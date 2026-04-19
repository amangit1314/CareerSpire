/**
 * Intent-based model routing for the AI Tutor.
 *
 * Light intents (short questions, hints, greetings, acknowledgments) → Gemini
 *   - Faster, cheaper, sufficient for conversational responses
 * Heavy intents (code submissions, complex conceptual explanations) → Groq
 *   - More capable 70B model, justified cost for evaluation tasks
 *
 * The classification is a fast heuristic — no LLM call. Good enough to catch
 * the 80% case. Groq stays as the fallback for Gemini anyway, so misclassification
 * degrades cost but never breaks correctness.
 */

export type TutorIntent = 'light' | 'heavy';

const CODE_SIGNAL_PATTERNS: RegExp[] = [
    /\bfunction\s+\w+\s*\(/,
    /=>\s*\{/,
    /\bclass\s+\w+/,
    /\bdef\s+\w+\s*\(/,
    /\bimport\s+.+\s+from\s+/,
    /\bconst\s+\w+\s*=/,
    /\blet\s+\w+\s*=/,
    /\breturn\s+.+;/,
    // Multiple statements on multiple lines
    /;[\s\S]*;/,
];

/**
 * Heuristic classifier. Returns 'heavy' when the message looks like a
 * code submission or a long, substantive prompt.
 */
export function classifyTutorIntent(userMessage: string): TutorIntent {
    const trimmed = userMessage.trim();

    // Explicit code fence → definitely code submission
    if (trimmed.includes('```')) return 'heavy';

    // Multi-line messages > 3 lines → substantive (code or long question)
    const lineCount = trimmed.split('\n').filter((l) => l.trim().length > 0).length;
    if (lineCount > 3) return 'heavy';

    // Code-shaped content (even without fences)
    if (CODE_SIGNAL_PATTERNS.some((re) => re.test(trimmed))) return 'heavy';

    // Long single-line prompts (>400 chars) = substantive question
    if (trimmed.length > 400) return 'heavy';

    // Everything else (short questions, hint requests, "explain differently",
    // "test my understanding", greetings) → light
    return 'light';
}

/** Map intent to AI provider preference. */
export function providerForIntent(intent: TutorIntent): 'groq' | 'gemini' | undefined {
    // Light → Gemini flash (cheap & fast); Heavy → default (Groq first, Gemini fallback)
    return intent === 'light' ? 'gemini' : undefined;
}
