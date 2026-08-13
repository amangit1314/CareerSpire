/**
 * Single source of truth for AI provider model identifiers and labels.
 * Was duplicated across groq.ts/gemini.ts/openrouter.ts/index.ts plus copy
 * text in pricing.ts (FAQ) and swagger.ts — changing a model meant hunting
 * down every string literal. Now it's one place, colocated with the
 * provider clients that use it instead of a separate top-level config file.
 */
export const AI_MODELS = {
  GROQ: 'llama-3.3-70b-versatile',
  GEMINI: 'gemini-2.0-flash',
  OPENROUTER: 'openai/gpt-4o-mini',
} as const;

export const AI_MODEL_LABELS: Record<keyof typeof AI_MODELS, string> = {
  GROQ: 'Groq (llama-3.3-70b)',
  GEMINI: 'Gemini (gemini-2.0-flash)',
  OPENROUTER: 'OpenRouter (openai/gpt-4o-mini)',
};
