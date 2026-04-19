'use server';

import { prisma } from '@/lib/prisma';
import { Difficulty, ProgrammingLanguage, QuestionType } from '@prisma/client';
import { AppError } from '@/lib/errors';
import { unstable_cache } from 'next/cache';

export enum Framework {
    REACT = 'REACT',
    ANGULAR = 'ANGULAR',
    VUE = 'VUE',
    NODE = 'NODE',
    FASTAPI = 'FASTAPI',
    DJANGO = 'DJANGO',
    SPRING_BOOT = 'SPRING_BOOT',
    NONE = 'NONE'
}

export type ResourceStats = {
    totalQuestions: number;
    completedQuestions: number;
    attemptedQuestions: number;
};

export type CategoryStats = {
    category: string;
    slug: string;
    description: string;
    stats: ResourceStats;
    icon?: string;
}

const CATEGORIES = [
    { id: 'dsa', name: 'Data Structures & Algorithms', type: QuestionType.DSA, description: 'Master core computer science concepts' },
    { id: 'javascript', name: 'JavaScript', language: ProgrammingLanguage.JAVASCRIPT, description: 'Deep dive into JS internals and patterns' },
    { id: 'typescript', name: 'TypeScript', language: ProgrammingLanguage.TYPESCRIPT, description: 'Learn static typing and advanced TS features' },
    { id: 'python', name: 'Python', language: ProgrammingLanguage.PYTHON, description: 'Pythonic coding and standard libraries' },
    { id: 'react', name: 'React', framework: Framework.REACT, description: 'Modern UI development with React' },
    { id: 'node', name: 'Node.js', framework: Framework.NODE, description: 'Server-side JavaScript runtime' },
];

export async function getResourceCategories(userId?: string): Promise<CategoryStats[]> {
    const results = await Promise.all(
        CATEGORIES.map(async (cat) => {
            const whereClause: Record<string, unknown> = {};
            if (cat.type) whereClause.type = cat.type;
            if (cat.language) whereClause.language = cat.language;
            if (cat.framework) whereClause.framework = cat.framework;

            const [total, userResults] = await Promise.all([
                prisma.question.count({ where: whereClause }),
                userId
                    ? prisma.mockResult.findMany({
                          where: {
                              session: { userId },
                              question: whereClause,
                          },
                          select: { questionId: true },
                      })
                    : Promise.resolve([]),
            ]);

            const attempted = new Set(userResults.map((r) => r.questionId)).size;

            return {
                category: cat.name,
                slug: cat.id,
                description: cat.description,
                stats: {
                    totalQuestions: total,
                    completedQuestions: attempted,
                    attemptedQuestions: attempted,
                },
            };
        }),
    );

    return results;
}

// ---------------------------------------------------------------------------
// Consolidated: fetch all resources page data in one round trip
// ---------------------------------------------------------------------------

export interface ResourcesPageData {
    categories: CategoryStats[];
    roadmaps: UserRoadmap[];
}

export async function getResourcesPageData(userId?: string): Promise<ResourcesPageData> {
    const [categories, roadmaps] = await Promise.all([
        getResourceCategories(userId),
        getUserRoadmaps(userId),
    ]);
    return { categories, roadmaps };
}

// ---------------------------------------------------------------------------
// User Roadmaps — custom skill tracks (AI-generated, outside curated catalog)
// ---------------------------------------------------------------------------

export type UserRoadmap = {
    slug: string;
    name: string;
    totalQuestions: number;
    completedQuestions: number;
    tutorMessages: number;
    lastVisitedAt: Date;
    startedAt: Date;
    isPinned: boolean;
};

/** Normalize a skill label into a consistent slug. */
function normalizeSlug(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9.\-]/g, '');
}

/** Title-case display name from a slug. */
function defaultDisplayName(raw: string): string {
    const cleaned = raw.trim().replace(/[-_]+/g, ' ');
    return cleaned
        .split(' ')
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ');
}

/** True if this slug corresponds to a curated category (should NOT go in user roadmaps). */
function isCuratedSlug(slug: string): boolean {
    const normalized = slug.toLowerCase();
    return CATEGORIES.some(
        (c) => c.id.toLowerCase() === normalized || c.name.toLowerCase() === normalized,
    );
}

/**
 * List the current user's custom roadmaps, enriched with live question
 * totals and attempted counts. Pinned first, then most-recently-visited.
 */
export async function getUserRoadmaps(userId?: string): Promise<UserRoadmap[]> {
    if (!userId) return [];

    const roadmaps = await prisma.userRoadmap.findMany({
        where: { userId, isArchived: false },
        orderBy: [{ isPinned: 'desc' }, { lastVisitedAt: 'desc' }],
    });

    if (roadmaps.length === 0) return [];

    // Get total questions per slug and the user's attempt count per slug
    // in two parallelized queries to keep the list fast.
    const slugs = roadmaps.map((r) => r.slug);

    const [totals, userAttempts] = await Promise.all([
        Promise.all(
            slugs.map((s) =>
                prisma.question.count({
                    where: { topic: { equals: s, mode: 'insensitive' } },
                }),
            ),
        ),
        prisma.mockResult.findMany({
            where: {
                session: { userId },
                question: {
                    topic: { in: slugs, mode: 'insensitive' },
                },
            },
            select: { questionId: true, question: { select: { topic: true } } },
        }),
    ]);

    const attemptsBySlug = new Map<string, Set<string>>();
    for (const a of userAttempts) {
        const key = a.question.topic.toLowerCase();
        if (!attemptsBySlug.has(key)) attemptsBySlug.set(key, new Set());
        attemptsBySlug.get(key)!.add(a.questionId);
    }

    return roadmaps.map((r, i) => ({
        slug: r.slug,
        name: r.displayName,
        totalQuestions: totals[i],
        completedQuestions: attemptsBySlug.get(r.slug.toLowerCase())?.size ?? 0,
        tutorMessages: r.tutorMessages,
        lastVisitedAt: r.lastVisitedAt,
        startedAt: r.startedAt,
        isPinned: r.isPinned,
    }));
}

/**
 * Record that the current user has visited a custom skill page. Idempotent
 * upsert — creates a roadmap on first visit, bumps `lastVisitedAt` thereafter.
 * Silent no-op for anonymous users or curated slugs.
 */
export async function recordRoadmapVisit(
    rawSlug: string,
    rawDisplayName?: string,
): Promise<void> {
    try {
        const { getCurrentUserId } = await import('@/lib/auth');
        const userId = await getCurrentUserId();
        if (!userId) return;

        const slug = normalizeSlug(rawSlug);
        if (!slug || isCuratedSlug(slug)) return;

        const displayName = rawDisplayName?.trim() || defaultDisplayName(rawSlug);

        await prisma.userRoadmap.upsert({
            where: { userId_slug: { userId, slug } },
            update: {
                lastVisitedAt: new Date(),
                isArchived: false, // un-archive on revisit
            },
            create: {
                userId,
                slug,
                displayName,
            },
        });
    } catch (error) {
        // Never block page render on this best-effort telemetry write
        console.error('recordRoadmapVisit failed:', error);
    }
}

/**
 * Bump the tutor message count for a user's roadmap. Called from tutorChat
 * after a successful response. No-op if the roadmap doesn't exist (e.g.
 * curated slug or anonymous user).
 */
export async function incrementRoadmapTutorMessages(
    userId: string,
    rawSlug: string,
): Promise<void> {
    try {
        const slug = normalizeSlug(rawSlug);
        if (!slug || isCuratedSlug(slug)) return;

        await prisma.userRoadmap.updateMany({
            where: { userId, slug },
            data: {
                tutorMessages: { increment: 1 },
                lastVisitedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('incrementRoadmapTutorMessages failed:', error);
    }
}

/** Pin / unpin a roadmap (moves it to the top of the list). */
export async function toggleRoadmapPin(rawSlug: string): Promise<void> {
    const { getCurrentUserId } = await import('@/lib/auth');
    const userId = await getCurrentUserId();
    if (!userId) return;

    const slug = normalizeSlug(rawSlug);
    const existing = await prisma.userRoadmap.findUnique({
        where: { userId_slug: { userId, slug } },
        select: { isPinned: true },
    });
    if (!existing) return;

    await prisma.userRoadmap.update({
        where: { userId_slug: { userId, slug } },
        data: { isPinned: !existing.isPinned },
    });
}

/** Soft-delete (archive) a roadmap. Re-visiting it restores it. */
export async function archiveRoadmap(rawSlug: string): Promise<void> {
    const { getCurrentUserId } = await import('@/lib/auth');
    const userId = await getCurrentUserId();
    if (!userId) return;

    const slug = normalizeSlug(rawSlug);
    await prisma.userRoadmap.updateMany({
        where: { userId, slug },
        data: { isArchived: true, isPinned: false },
    });
}

export async function getQuestionsByCategory(categorySlug: string) {
    const category = CATEGORIES.find(c => c.id === categorySlug);
    if (!category) {
        throw new AppError('Category not found', 'NOT_FOUND', 404);
    }

    const whereClause: any = {};
    if (category.type) whereClause.type = category.type;
    if (category.language) whereClause.language = category.language;
    if (category.framework) whereClause.framework = category.framework;

    const questions = await prisma.question.findMany({
        where: whereClause,
        select: {
            id: true,
            title: true,
            difficulty: true,
            topic: true,
            type: true,
            language: true,
            framework: true,
        },
        orderBy: {
            difficulty: 'asc',
        }
    });

    return {
        category: category.name,
        description: category.description,
        questions,
    };
}

export async function getOrGenerateQuestionsForSkill(skillSlug: string) {
    // 1. Try to find existing category first
    const existingCategory = CATEGORIES.find(c => c.id === skillSlug.toLowerCase());

    const topicQuery = existingCategory ? existingCategory.name : skillSlug; // Use name for better DB search if it's a known category

    // 2. Check DB
    let questions = await prisma.question.findMany({
        where: {
            OR: [
                { topic: { contains: topicQuery, mode: 'insensitive' } },
                { title: { contains: topicQuery, mode: 'insensitive' } },
                // If it's a known category, we might rely on the type/language filters from getQuestionsByCategory, 
                // but this function is for generic "Skill" search.
                // Let's rely on topic tag primarily for dynamic skills.
            ]
        },
        take: 50
    });

    // 3. If not enough questions, generate with AI
    if (questions.length < 5) {
        console.log(`Not enough questions for ${skillSlug}. Generating with AI...`);
        const { generateAIQuestions, generateTopicSyllabus, generateTopicGuide } = await import('@/lib/llm');
        const aiQuestions = await generateAIQuestions({
            difficulty: 'MEDIUM', // Default to mixed or handle multiple calls
            type: 'CODING',
            count: 5,
            topics: [skillSlug]
        });

        if (aiQuestions && aiQuestions.length > 0) {
            // Save to DB
            // We need to map AI question format to DB format
            // AI returns object matching AISchema, DB needs QuestionCreateInput
            for (const q of aiQuestions) {
                try {
                    await prisma.question.create({
                        data: {
                            title: q.title,
                            description: q.description,
                            topic: skillSlug, // Use the slug or cleaned name as topic
                            difficulty: q.difficulty as Difficulty, // Ensure cast or map
                            type: q.type as QuestionType,
                            testCases: q.testCases,
                            hints: q.hints,
                            expectedComplexity: q.expectedComplexity,
                            // Defaults
                            language: q.language ? (q.language.toUpperCase() as ProgrammingLanguage) : undefined,
                            framework: Framework.NONE,
                        }
                    });
                } catch (e) {
                    console.error('Failed to save generated question:', e);
                }
            }

            // Re-fetch to include IDs and correct formatting
            questions = await prisma.question.findMany({
                where: { topic: skillSlug },
                take: 50
            });
        }
    }

    // If still empty (AI failed), return empty or throw
    if (questions.length === 0) {
        // Return empty structure, frontend handles "No questions found"
        return {
            category: skillSlug,
            description: `Practice questions for ${skillSlug}`,
            questions: []
        };
    }

    return {
        category: existingCategory ? existingCategory.name : skillSlug.charAt(0).toUpperCase() + skillSlug.slice(1),
        description: existingCategory ? existingCategory.description : `AI-generated practice questions for ${skillSlug}`,
        questions,
    };
}

export const getTopicsForCategory = unstable_cache(
    async (categorySlug: string) => {
        const { generateTopicSyllabus } = await import('@/lib/llm');
        const topics = await generateTopicSyllabus(categorySlug);
        return topics;
    },
    ['topics-syllabus'],
    { revalidate: 86400, tags: ['syllabus'] }
);

const getCachedTopicGuide = unstable_cache(
    async (categorySlug: string, topicSlug: string) => {
        const { generateTopicGuide } = await import('@/lib/llm');
        return await generateTopicGuide(categorySlug, topicSlug);
    },
    ['topic-guide'],
    { revalidate: 86400, tags: ['guide'] }
);

export async function getTopicDetails(categorySlug: string, topicSlug: string) {
    const { generateAIQuestions } = await import('@/lib/llm');

    // 1. Get Syllabus to find topic difficulty
    const syllabus = await getTopicsForCategory(categorySlug);
    const topicInfo = syllabus.find(t => t.id === topicSlug);

    // Map 'Beginner' -> 'EASY', 'Intermediate' -> 'MEDIUM', 'Advanced' -> 'HARD'
    const syllabusDifficulty = topicInfo?.difficulty || 'Intermediate';
    const mappedDifficulty =
        syllabusDifficulty === 'Beginner' ? 'EASY' :
            syllabusDifficulty === 'Advanced' ? 'HARD' : 'MEDIUM';

    // 2. Get Guide (Theory) - Cached
    const guide = await getCachedTopicGuide(categorySlug, topicSlug);

    // 3. Get Questions (Look for exact topic match first for uniqueness)
    let questions = await prisma.question.findMany({
        where: {
            topic: { equals: topicSlug, mode: 'insensitive' }
        },
        take: 10
    });

    // 4. Generate questions if missing or not enough unique ones
    if (questions.length < 3) {
        console.log(`Generating fresh questions for topic: ${topicSlug} with difficulty: ${mappedDifficulty}`);
        const aiQuestions = await generateAIQuestions({
            difficulty: mappedDifficulty,
            type: 'CODING',
            count: 3,
            topics: [`${categorySlug}: ${topicSlug}`] // Contextual prompt
        });

        // Save generated questions
        if (aiQuestions && aiQuestions.length > 0) {
            for (const q of aiQuestions) {
                try {
                    await prisma.question.create({
                        data: {
                            title: q.title,
                            description: q.description,
                            topic: topicSlug, // Tag with the specific topic slug
                            difficulty: (q.difficulty as Difficulty) || mappedDifficulty as Difficulty,
                            type: (q.type as QuestionType) || 'CODING',
                            testCases: q.testCases,
                            hints: q.hints,
                            expectedComplexity: q.expectedComplexity,
                            language: q.language ? (q.language.toUpperCase() as ProgrammingLanguage) : undefined,
                            framework: Framework.NONE,
                        }
                    });
                } catch (e) {
                    console.error('Failed to save generated question:', e);
                }
            }
            // Re-fetch using exact match
            questions = await prisma.question.findMany({
                where: { topic: { equals: topicSlug, mode: 'insensitive' } },
                take: 10
            });
        }
    }

    return {
        guide,
        questions
    };
}

export async function getQuestionDetails(questionId: string) {
    try {
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        return question;
    } catch (error) {
        console.error('Failed to fetch question details:', error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Adaptive AI Tutor
// ---------------------------------------------------------------------------
//
// A single prompt that adapts based on user intent — code submission,
// conceptual question, hint request, "test me", etc. Returns markdown only.
// The frontend just renders it — no schema branching, no structured fallbacks,
// no "undefined" leaking into the UI.
//
// ---------------------------------------------------------------------------

interface TutorQuestion {
    title: string;
    description: string;
    topic: string;
    difficulty?: string;
    hints?: unknown; // typically string[] from JSON column
    codeSnippet?: string | null;
    language?: string | null;
    expectedAnswerFormat?: string | null;
}

interface TutorMessage {
    role: 'ai' | 'user';
    content: string;
}

function buildQuestionContext(q: TutorQuestion): string {
    const hints = Array.isArray(q.hints) ? (q.hints as string[]) : [];
    return [
        `Title: ${q.title}`,
        `Topic: ${q.topic}`,
        q.difficulty ? `Difficulty: ${q.difficulty}` : null,
        q.language ? `Language: ${q.language}` : null,
        `Description: ${q.description}`,
        q.codeSnippet ? `Reference Code:\n\`\`\`${q.language ?? ''}\n${q.codeSnippet}\n\`\`\`` : null,
        hints.length
            ? `Available hints (only reveal if the user explicitly asks for a hint, and only one at a time):\n${hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
            : null,
    ]
        .filter(Boolean)
        .join('\n');
}

/**
 * Generate a brief, Socratic opening message for a new tutoring session.
 * Returns markdown. 2 short sentences + 1 invitation — NOT a lecture.
 */
export async function generateOpeningMessage(question: TutorQuestion): Promise<string> {
    try {
        const { llmClient } = await import('@/lib/llmClient');
        const prompt = `You are an adaptive technical tutor starting a practice session on CareerSpire.

### Question
${buildQuestionContext(question)}

### Your task
Generate a brief, inviting opening message. Format as markdown.

Strict rules:
- Maximum 2 short sentences followed by ONE question that invites engagement.
- Do NOT explain the concept. The user will learn by doing.
- Do NOT give away any part of the solution or hints.
- Tone: warm, concise, focused. Like a senior engineer saying "let's dig in".
- Prefer an opening question tied directly to the problem, e.g.
  "What do you think will happen if we log \`x\` before declaring it?"
  "Before writing code — in one line, what's your mental model here?"

Output: only the message text in markdown. No preamble, no headings, no code fences wrapping the whole output.`;

        const response = await llmClient(prompt);
        return response.trim();
    } catch (error) {
        console.error('Failed to generate opening message:', error);
        return `Let's work on **${question.title}** together. Before writing any code — in one line, what's your current mental model of this problem?`;
    }
}

/**
 * Discriminated return type for tutorChat.
 * - ok=true: markdown reply
 * - ok=false + reason='rate_limited': user hit daily cap (frontend shows soft pause)
 * - ok=false + reason='transport': transient LLM/network failure
 */
export type TutorChatResult =
    | {
          ok: true;
          content: string;
          usage: { used: number; limit: number | null; remaining: number | null };
      }
    | {
          ok: false;
          reason: 'rate_limited';
          usage: { used: number; limit: number; resetsAt: string };
      }
    | {
          ok: false;
          reason: 'transport';
          message: string;
      };

/**
 * Adaptive tutor response. Single prompt handles all intents (submission,
 * question, hint, test-me, clarification). Returns a discriminated union
 * so the frontend can render success / rate-limit / error distinctly.
 */
export async function tutorChat(
    question: TutorQuestion,
    history: TutorMessage[],
    userMessage: string,
): Promise<TutorChatResult> {
    // 1. Identify user & resolve tier for rate limiting
    const { getCurrentUserId } = await import('@/lib/auth');
    const { checkAndConsume } = await import('@/lib/tutorRateLimit');
    const { prisma } = await import('@/lib/prisma');

    const userId = await getCurrentUserId();
    const tier = userId
        ? (
              await prisma.user.findUnique({
                  where: { id: userId },
                  select: { subscriptionTier: true },
              })
          )?.subscriptionTier ?? 'FREE'
        : 'ANONYMOUS';

    // Anonymous users share a single bucket; still bounded but separate from paid users.
    const rateLimitKey = userId ?? 'anonymous';
    const usage = checkAndConsume(rateLimitKey, tier);

    if (!usage.allowed) {
        return {
            ok: false,
            reason: 'rate_limited',
            usage: {
                used: usage.used,
                limit: usage.limit,
                resetsAt: usage.resetsAt,
            },
        };
    }

    // 2. Intent-based model routing — keep this BEFORE the try so routing
    //    decisions are visible even in error logs.
    const { classifyTutorIntent, providerForIntent } = await import('@/lib/tutorRouter');
    const intent = classifyTutorIntent(userMessage);
    const provider = providerForIntent(intent);

    // 3. Build prompt
    const recentHistory = history
        .slice(-8)
        .map((m) => `${m.role === 'ai' ? 'Tutor' : 'Learner'}: ${m.content}`)
        .join('\n\n');

    const prompt = `You are an elite, adaptive technical tutor for CareerSpire, helping a learner practice ONE specific question.

### Question Context
${buildQuestionContext(question)}

### Conversation So Far
${recentHistory || '(this is the first exchange)'}

### Latest Learner Message
"""
${userMessage}
"""

### How to Respond
Detect the learner's intent from their latest message and respond appropriately. Pick ONE mode:

**A) Code / solution submission** — they pasted code or a conceptual answer
  - Start with a 1-line honest verdict (e.g. "Close, but there's a subtle bug." or "Correct — nice work.")
  - Use a short "**What works**" section (1–2 bullets) and "**What to improve**" section (1–2 bullets).
  - If wrong: do NOT paste the correct code. Ask ONE pointed question that helps them see the issue.
  - If right: celebrate briefly and ask ONE follow-up that extends understanding (edge case, complexity, variant).

**B) Conceptual question / clarification** — they asked about the topic
  - Answer directly and concisely.
  - Include a TINY code example only if it makes the concept click.
  - End with a one-line invitation back to the problem.

**C) Hint request** — they asked for a hint, nudge, or said "I'm stuck"
  - Offer the smallest possible nudge that moves them forward.
  - If the question has hints listed above, reveal them ONE at a time in order — reveal the next unrevealed hint based on how many hints already appear to have been given in the conversation.
  - Do NOT give the answer. Prefer a leading question.

**D) "Test me" / wants to check understanding**
  - Ask ONE focused Socratic question about the concept.
  - Do not lecture before the question.

### Tone & Format Rules
- Warm, concise, precise. Never condescending.
- Max ~4 short paragraphs. Brevity > comprehensiveness.
- Use markdown: \`inline code\`, \`\`\`fenced blocks\`\`\` with a language tag, **bold** for emphasis, bullets sparingly.
- Never say "as an AI". Never hedge with "I think maybe".
- Never output JSON, schemas, or bracketed placeholders.

Output: the tutor's reply only, in markdown.`;

    // 4. Call the LLM with the chosen provider
    try {
        const { aiChat } = await import('@/lib/ai');
        const result = await aiChat(prompt, {
            provider, // undefined = default (Groq → Gemini fallback); 'gemini' = straight to flash
            temperature: 0.7,
        });

        // 5. Record engagement on the user's custom roadmap (if applicable).
        // Fire-and-forget — don't block the response on telemetry.
        if (userId) {
            incrementRoadmapTutorMessages(userId, question.topic).catch((e) =>
                console.error('roadmap engagement update failed:', e),
            );
        }

        return {
            ok: true,
            content: result.content.trim(),
            usage: {
                used: usage.used,
                limit: Number.isFinite(usage.limit) ? usage.limit : null,
                remaining: Number.isFinite(usage.remaining) ? usage.remaining : null,
            },
        };
    } catch (error) {
        console.error('tutorChat LLM error:', error, { intent, provider });
        return {
            ok: false,
            reason: 'transport',
            message: "I hit a snag on my side — could you send that again?",
        };
    }
}
