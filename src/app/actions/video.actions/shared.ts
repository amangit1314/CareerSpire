// Types and question-generation helpers shared across the video.actions/
// split. Not a 'use server' file — none of these are called directly from
// client components (they were file-private in the original file too,
// except the exported config type/interface, which stays type-only-safe).

import {
  Difficulty,
  ProgrammingLanguage,
  Framework,
  InterviewMode,
  TechnicalFocus,
  InterviewRoundType,
} from "@/types/enums";
import type { VideoInterviewConfig, InterviewRound } from "@/types/interfaces";
import { aiChat } from "@/lib/ai";

export {
  InterviewMode,
  TechnicalFocus,
  NonTechnicalCategory,
  InterviewRoundType,
} from "@/types/enums";
export type { VideoInterviewConfig, InterviewRound };

export function getInterviewRounds(
  config: VideoInterviewConfig,
): InterviewRound[] {
  switch (config.mode) {
    case InterviewMode.TECHNICAL:
      return [
        { name: "Intro", type: InterviewRoundType.HR, count: 1 },
        {
          name: "Technical",
          type: InterviewRoundType.TECHNICAL,
          count:
            config.difficulty === Difficulty.HARD
              ? 5
              : config.difficulty === Difficulty.EASY
                ? 3
                : 4,
        },
        { name: "Wrap-up", type: InterviewRoundType.HR, count: 1 },
      ];
    case InterviewMode.NON_TECHNICAL:
      return [
        {
          name: "Behavioral",
          type: InterviewRoundType.HR,
          count:
            config.difficulty === Difficulty.HARD
              ? 7
              : config.difficulty === Difficulty.EASY
                ? 3
                : 5,
        },
      ];
    case InterviewMode.MIXED:
    default:
      return [
        { name: "HR Intro", type: InterviewRoundType.HR, count: 2 },
        {
          name: "Technical Round",
          type: InterviewRoundType.TECHNICAL,
          count: config.difficulty === Difficulty.HARD ? 4 : 3,
        },
        {
          name: "System Design",
          type: InterviewRoundType.SYSTEM_DESIGN,
          count: config.difficulty === Difficulty.EASY ? 1 : 2,
        },
        { name: "HR Wrap-up", type: InterviewRoundType.HR, count: 1 },
      ];
  }
}

// ============ Question Generators (Video-specific) ============

export async function generateTechnicalVideoQuestions(
  config: VideoInterviewConfig,
  count: number,
): Promise<
  Array<{
    title: string;
    question: string;
    topic: string;
    hints: string[];
    expectedTimeMinutes: number;
  }>
> {
  const lang = config.language || ProgrammingLanguage.JAVASCRIPT;
  const fw =
    config.framework && config.framework !== Framework.NONE
      ? config.framework
      : null;
  const focus = config.technicalFocus || TechnicalFocus.ALL;

  const focusInstruction =
    focus === TechnicalFocus.DSA
      ? "Focus on data structures and algorithms. Ask the candidate to explain their approach verbally."
      : focus === TechnicalFocus.SYSTEM_DESIGN
        ? "Focus on system design. Ask about architecture, scalability, trade-offs."
        : focus === TechnicalFocus.LANGUAGE_CONCEPTS
          ? `Focus on ${lang}${fw ? ` / ${fw}` : ""} internals, gotchas, and best practices.`
          : `Mix of ${lang}${fw ? ` / ${fw}` : ""} concepts, problem-solving, and practical scenarios.`;

  const prompt = `You are a Senior Technical Interviewer at a top tech company.
Generate ${count} technical interview questions for a VIDEO interview (verbal answers only, no code editor).

Language: ${lang}
${fw ? `Framework: ${fw}` : ""}
Difficulty: ${config.difficulty}
${focusInstruction}

These are VERBAL questions — the candidate explains their thinking out loud. Questions should be:
- Conceptual depth (explain how X works under the hood)
- Trade-off analysis (when would you use X vs Y?)
- Problem-solving walkthrough (how would you approach building X?)
- Debugging scenario (here's a bug description, how would you diagnose it?)

Return JSON: { "questions": [{ "title": "short title", "question": "full question text the AI interviewer will read aloud", "topic": "topic area", "hints": ["hint1"], "expectedTimeMinutes": 3 }] }
Return ONLY valid JSON.`;

  try {
    const result = await aiChat(prompt, {
      temperature: 0.3,
      responseFormat: "json_object",
    });
    const data = JSON.parse(result.content);
    return data.questions || [];
  } catch (err) {
    console.error("[VideoAction] Failed to generate technical questions:", err);
    return [];
  }
}

export async function generateSystemDesignQuestions(
  config: VideoInterviewConfig,
  count: number,
): Promise<
  Array<{
    title: string;
    question: string;
    topic: string;
    hints: string[];
    expectedTimeMinutes: number;
  }>
> {
  const prompt = `You are a Principal Engineer interviewing a candidate.
Generate ${count} system design interview questions for a VIDEO interview (verbal discussion).

Difficulty: ${config.difficulty}
${config.language ? `Context: The candidate works with ${config.language}${config.framework && config.framework !== Framework.NONE ? ` / ${config.framework}` : ""}.` : ""}

Questions should ask the candidate to:
- Design a system (e.g., "Design a real-time notification system")
- Discuss trade-offs, scaling, database choices
- Walk through their architecture decisions verbally

Return JSON: { "questions": [{ "title": "short title", "question": "full question for AI to read aloud", "topic": "System Design", "hints": ["Think about scalability"], "expectedTimeMinutes": 5 }] }
Return ONLY valid JSON.`;

  try {
    const result = await aiChat(prompt, {
      temperature: 0.3,
      responseFormat: "json_object",
    });
    const data = JSON.parse(result.content);
    return data.questions || [];
  } catch (err) {
    console.error(
      "[VideoAction] Failed to generate system design questions:",
      err,
    );
    return [];
  }
}
