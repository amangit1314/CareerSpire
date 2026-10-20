"use server";

import { incrementRoadmapTutorMessages } from "./roadmaps";
import { SubscriptionTier } from "@/types/enums";
import { TutorChatFailureReason, type TutorChatResult } from "./tutor.types";

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
  role: "ai" | "user";
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
    q.codeSnippet
      ? `Reference Code:\n\`\`\`${q.language ?? ""}\n${q.codeSnippet}\n\`\`\``
      : null,
    hints.length
      ? `Available hints (only reveal if the user explicitly asks for a hint, and only one at a time):\n${hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Generate a brief, Socratic opening message for a new tutoring session.
 * Returns markdown. 2 short sentences + 1 invitation — NOT a lecture.
 */
export async function generateOpeningMessage(
  question: TutorQuestion,
): Promise<string> {
  try {
    const { llmClient } = await import("@/lib/ai/llmClient");
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
    console.error("Failed to generate opening message:", error);
    return `Let's work on **${question.title}** together. Before writing any code — in one line, what's your current mental model of this problem?`;
  }
}

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
  const { getCurrentUserId } = await import("@/lib/auth");
  const { checkAndConsume, ANONYMOUS_TIER } =
    await import("@/lib/tutor/rateLimit");
  const { prisma } = await import("@/lib/prisma");

  const userId = await getCurrentUserId();
  const tier = userId
    ? ((
        await prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionTier: true },
        })
      )?.subscriptionTier ?? SubscriptionTier.FREE)
    : ANONYMOUS_TIER;

  // Anonymous users share a single bucket; still bounded but separate from paid users.
  const rateLimitKey = userId ?? "anonymous";
  const usage = checkAndConsume(rateLimitKey, tier);

  if (!usage.allowed) {
    return {
      ok: false,
      reason: TutorChatFailureReason.RateLimited,
      usage: {
        used: usage.used,
        limit: usage.limit,
        resetsAt: usage.resetsAt,
      },
    };
  }

  // 2. Intent-based model routing — keep this BEFORE the try so routing
  //    decisions are visible even in error logs.
  const { classifyTutorIntent, providerForIntent } =
    await import("@/lib/tutor/router");
  const intent = classifyTutorIntent(userMessage);
  const provider = providerForIntent(intent);

  // 3. Build prompt
  const recentHistory = history
    .slice(-8)
    .map((m) => `${m.role === "ai" ? "Tutor" : "Learner"}: ${m.content}`)
    .join("\n\n");

  const prompt = `You are an elite, adaptive technical tutor for CareerSpire, helping a learner practice ONE specific question.

### Question Context
${buildQuestionContext(question)}

### Conversation So Far
${recentHistory || "(this is the first exchange)"}

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
    const { aiChat } = await import("@/lib/ai");
    const result = await aiChat(prompt, {
      provider, // undefined = default (Groq → Gemini fallback); 'gemini' = straight to flash
      temperature: 0.7,
    });

    // 5. Record engagement on the user's custom roadmap (if applicable).
    // Fire-and-forget — don't block the response on telemetry.
    if (userId) {
      incrementRoadmapTutorMessages(userId, question.topic).catch((e) =>
        console.error("roadmap engagement update failed:", e),
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
    console.error("tutorChat LLM error:", error, { intent, provider });
    return {
      ok: false,
      reason: TutorChatFailureReason.Transport,
      message: "I hit a snag on my side — could you send that again?",
    };
  }
}
