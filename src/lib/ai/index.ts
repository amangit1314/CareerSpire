import { groqChat } from './groq';
import { geminiChat } from './gemini';
import { openRouterChat } from './openrouter';
import { AI_MODEL_LABELS } from './models';

export interface AIChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
  /** Force a specific provider instead of auto-fallback */
  provider?: 'groq' | 'gemini' | 'openrouter';
  /** Use Gemini for final report generation (as per spec) */
  useGemini?: boolean;
  /** Abort a single provider call after this many ms. Default 20000. */
  timeoutMs?: number;
}

export interface AIResult {
  content: string;
  provider: 'groq' | 'gemini' | 'openrouter';
}

const DEFAULT_TIMEOUT_MS = 20_000;

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests');
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status: number }).status === 429;
  }
  return false;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

function logMetrics(provider: 'groq' | 'gemini' | 'openrouter', durationMs: number, success: boolean, promptChars: number) {
  // Deliberately a plain console.log line, not a dashboard call — cheapest
  // possible observability win. Structured so it's greppable/parseable from
  // Vercel logs (or any log drain) later without changing this call site.
  console.log(
    `[AI_METRICS] ${JSON.stringify({ provider, durationMs, success, promptChars, timestamp: new Date().toISOString() })}`
  );
}

/**
 * Unified AI caller — tries Groq first, falls back to Gemini (only if
 * GOOGLE_AI_API_KEY is configured — it's optional), then OpenRouter as the
 * final fallback on 429, failure, or timeout. Never exposes raw errors to
 * the caller — returns a typed error object. Every call is time-boxed so a
 * hung upstream provider can't hang the whole request until the platform's
 * own function timeout.
 */
export async function aiChat(
  prompt: string,
  options: AIChatOptions = {}
): Promise<AIResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (options.useGemini || options.provider === 'gemini') {
    return callGemini(prompt, options, timeoutMs);
  }

  if (options.provider === 'groq') {
    return callGroq(prompt, options, timeoutMs);
  }

  if (options.provider === 'openrouter') {
    return callOpenRouter(prompt, options, timeoutMs);
  }

  const errors: string[] = [];

  try {
    return await callGroq(prompt, options, timeoutMs);
  } catch (groqError) {
    const isRate = isRateLimitError(groqError);
    const groqMsg = groqError instanceof Error ? groqError.message : 'Unknown error';
    errors.push(`Groq: ${groqMsg}`);
    console.warn(
      `[AI] Groq ${isRate ? 'rate limited (429)' : 'failed'}: ${groqMsg}. Falling back...`
    );
  }

  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      return await callGemini(prompt, options, timeoutMs);
    } catch (geminiError) {
      const geminiMsg = geminiError instanceof Error ? geminiError.message : 'Unknown error';
      errors.push(`Gemini: ${geminiMsg}`);
      console.warn(`[AI] Gemini fallback failed: ${geminiMsg}. Falling back to OpenRouter.`);
    }
  }

  try {
    return await callOpenRouter(prompt, options, timeoutMs);
  } catch (openRouterError) {
    const openRouterMsg = openRouterError instanceof Error ? openRouterError.message : 'Unknown error';
    errors.push(`OpenRouter: ${openRouterMsg}`);
    console.error(`[AI] All providers failed: ${errors.join(' | ')}`);
    throw new AICallError(
      'All AI providers failed. Please try again later.',
      'all',
      false
    );
  }
}

async function callGroq(prompt: string, options: AIChatOptions, timeoutMs: number): Promise<AIResult> {
  const startedAt = Date.now();
  try {
    const content = await withTimeout(
      groqChat(prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        responseFormat: options.responseFormat,
      }),
      timeoutMs,
      'Groq'
    );
    logMetrics('groq', Date.now() - startedAt, true, prompt.length);
    console.log(`[AI] Response from: ${AI_MODEL_LABELS.GROQ}`);
    return { content, provider: 'groq' };
  } catch (error) {
    logMetrics('groq', Date.now() - startedAt, false, prompt.length);
    throw error;
  }
}

async function callGemini(prompt: string, options: AIChatOptions, timeoutMs: number): Promise<AIResult> {
  const startedAt = Date.now();
  try {
    const content = await withTimeout(
      geminiChat(prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        responseFormat: options.responseFormat,
      }),
      timeoutMs,
      'Gemini'
    );
    logMetrics('gemini', Date.now() - startedAt, true, prompt.length);
    console.log(`[AI] Response from: ${AI_MODEL_LABELS.GEMINI}`);
    return { content, provider: 'gemini' };
  } catch (error) {
    logMetrics('gemini', Date.now() - startedAt, false, prompt.length);
    throw error;
  }
}

async function callOpenRouter(prompt: string, options: AIChatOptions, timeoutMs: number): Promise<AIResult> {
  const startedAt = Date.now();
  try {
    const content = await withTimeout(
      openRouterChat(prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        responseFormat: options.responseFormat,
      }),
      timeoutMs,
      'OpenRouter'
    );
    logMetrics('openrouter', Date.now() - startedAt, true, prompt.length);
    console.log(`[AI] Response from: ${AI_MODEL_LABELS.OPENROUTER}`);
    return { content, provider: 'openrouter' };
  } catch (error) {
    logMetrics('openrouter', Date.now() - startedAt, false, prompt.length);
    throw error;
  }
}

/**
 * Convenience: call AI and parse the response as JSON.
 * Retries once on parse failure before throwing.
 */
export async function aiChatJSON<T = unknown>(
  prompt: string,
  options: Omit<AIChatOptions, 'responseFormat'> = {}
): Promise<{ data: T; provider: 'groq' | 'gemini' | 'openrouter' }> {
  const jsonPrompt = prompt + '\n\nReturn ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.';

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await aiChat(jsonPrompt, { ...options, responseFormat: 'json_object' });
      const data = JSON.parse(result.content) as T;
      return { data, provider: result.provider };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 0) {
        console.warn('[AI] JSON parse failed, retrying once...');
      }
    }
  }

  throw new AICallError(
    `Failed to get valid JSON from AI: ${lastError?.message}`,
    'unknown',
    false
  );
}

export class AICallError extends Error {
  provider: string;
  isRateLimit: boolean;

  constructor(message: string, provider: string, isRateLimit: boolean) {
    super(message);
    this.name = 'AICallError';
    this.provider = provider;
    this.isRateLimit = isRateLimit;
  }
}
