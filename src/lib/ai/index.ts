import { groqChat, type GroqChatOptions } from './groq';
import { geminiChat } from './gemini';

export interface AIChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
  /** Force a specific provider instead of auto-fallback */
  provider?: 'groq' | 'gemini';
  /** Use Gemini for final report generation (as per spec) */
  useGemini?: boolean;
  /** Abort a single provider call after this many ms. Default 20000. */
  timeoutMs?: number;
}

export interface AIResult {
  content: string;
  provider: 'groq' | 'gemini';
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

function logMetrics(provider: 'groq' | 'gemini', durationMs: number, success: boolean, promptChars: number) {
  // Deliberately a plain console.log line, not a dashboard call — cheapest
  // possible observability win. Structured so it's greppable/parseable from
  // Vercel logs (or any log drain) later without changing this call site.
  console.log(
    `[AI_METRICS] ${JSON.stringify({ provider, durationMs, success, promptChars, timestamp: new Date().toISOString() })}`
  );
}

/**
 * Unified AI caller — tries Groq first, falls back to Gemini on 429, failure,
 * or timeout. Never exposes raw errors to the caller — returns a typed error
 * object. Every call is time-boxed so a hung upstream provider can't hang
 * the whole request until the platform's own function timeout.
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

  try {
    return await callGroq(prompt, options, timeoutMs);
  } catch (groqError) {
    const isRate = isRateLimitError(groqError);
    console.warn(
      `[AI] Groq ${isRate ? 'rate limited (429)' : 'failed'}: ${groqError instanceof Error ? groqError.message : 'Unknown error'}. Falling back to Gemini.`
    );

    try {
      return await callGemini(prompt, options, timeoutMs);
    } catch (geminiError) {
      console.error(
        `[AI] Gemini fallback also failed: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`
      );
      throw new AICallError(
        'Both Groq and Gemini failed. Please try again later.',
        'both',
        false
      );
    }
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
    console.log('[AI] Response from: Groq (llama-3.3-70b-versatile)');
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
    console.log('[AI] Response from: Gemini (gemini-2.0-flash)');
    return { content, provider: 'gemini' };
  } catch (error) {
    logMetrics('gemini', Date.now() - startedAt, false, prompt.length);
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
): Promise<{ data: T; provider: 'groq' | 'gemini' }> {
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
