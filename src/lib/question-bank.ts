import { prisma } from '@/lib/prisma';
import { aiChat } from '@/lib/ai';

/**
 * Check SkillQuestionBank for cached questions.
 * Returns questions array if found with enough questions, null otherwise.
 */
export async function getQuestionsFromBank(skill: string, minCount: number = 15): Promise<any[] | null> {
  try {
    const bank = await prisma.skillQuestionBank.findFirst({
      where: { skill: { equals: skill, mode: 'insensitive' } },
    });

    if (!bank) return null;

    const questions = bank.questions as any[];
    if (!Array.isArray(questions) || questions.length < minCount) return null;

    // Increment hit count (fire-and-forget)
    prisma.skillQuestionBank.update({
      where: { id: bank.id },
      data: { hitCount: bank.hitCount + 1 },
    }).catch(() => {});

    console.log(`[QuestionBank] Serving ${questions.length} cached questions for "${skill}" (hit #${bank.hitCount + 1})`);
    return questions;
  } catch (err) {
    console.error('[QuestionBank] Cache lookup failed:', err);
    return null;
  }
}

/** The shared prompt for generating a question bank */
function buildQuestionBankPrompt(skill: string): string {
  return `You are an expert interviewer and educator.
Generate a comprehensive interview question bank for: ${skill}
Include all major topics a candidate would be asked in interviews for this skill.

Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.
{
  "skill": "${skill}",
  "topics": ["topic1", "topic2"],
  "questions": [
    {
      "id": 1,
      "topic": "...",
      "question": "...",
      "type": "conceptual | coding | scenario",
      "difficulty": "easy | medium | hard",
      "answer_guide": "..."
    }
  ]
}
Generate minimum 30 questions. Cover all difficulty levels. Cover all major topics.`;
}

/**
 * Generate questions via AI and return parsed result.
 * Optionally saves to SkillQuestionBank for future users.
 */
export async function generateAndCacheQuestionBank(
  skill: string,
  niche: string
): Promise<{ topics: string[]; questions: any[] }> {
  const prompt = buildQuestionBankPrompt(skill);

  try {
    const result = await aiChat(prompt, { temperature: 0.3, responseFormat: 'json_object', maxTokens: 8192 });
    const parsed = JSON.parse(result.content);
    const questions = parsed.questions || [];
    const topics = parsed.topics || [];

    if (questions.length > 0) {
      await prisma.skillQuestionBank.create({
        data: { skill, niche, topics, questions, hitCount: 1 },
      }).catch((err: any) => {
        // Unique constraint — another request may have cached it already
        console.warn('[QuestionBank] Could not cache (may already exist):', err.message);
      });
      console.log(`[QuestionBank] Cached ${questions.length} new questions for "${skill}"`);
    }

    return { topics, questions };
  } catch (err) {
    console.error('[QuestionBank] AI generation failed:', err);
    return { topics: [], questions: [] };
  }
}
