import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./groq', () => ({ groqChat: vi.fn() }));
vi.mock('./gemini', () => ({ geminiChat: vi.fn() }));
vi.mock('./openrouter', () => ({ openRouterChat: vi.fn() }));

import { groqChat } from './groq';
import { geminiChat } from './gemini';
import { openRouterChat } from './openrouter';
import { aiChat, AICallError } from './index';

describe('aiChat timeout', () => {
  const originalGoogleKey = process.env.GOOGLE_AI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    // Gemini only enters the fallback chain when this key is configured.
    process.env.GOOGLE_AI_API_KEY = 'test-value';
  });

  afterEach(() => {
    process.env.GOOGLE_AI_API_KEY = originalGoogleKey;
  });

  it('aborts a hung Groq call and falls back to Gemini', async () => {
    vi.mocked(groqChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('too late'), 30_000))
    );
    vi.mocked(geminiChat).mockResolvedValue('gemini response');

    const resultPromise = aiChat('test prompt', { timeoutMs: 50 });
    const result = await resultPromise;

    expect(result.provider).toBe('gemini');
    expect(result.content).toBe('gemini response');
  }, 10_000);

  it('falls back to OpenRouter when Groq and Gemini both fail', async () => {
    vi.mocked(groqChat).mockRejectedValue(new Error('groq down'));
    vi.mocked(geminiChat).mockRejectedValue(new Error('gemini down'));
    vi.mocked(openRouterChat).mockResolvedValue('openrouter response');

    const result = await aiChat('test prompt', { timeoutMs: 50 });

    expect(result.provider).toBe('openrouter');
    expect(result.content).toBe('openrouter response');
  }, 10_000);

  it('skips Gemini when GOOGLE_AI_API_KEY is not configured', async () => {
    delete process.env.GOOGLE_AI_API_KEY;
    vi.mocked(groqChat).mockRejectedValue(new Error('groq down'));
    vi.mocked(openRouterChat).mockResolvedValue('openrouter response');

    const result = await aiChat('test prompt', { timeoutMs: 50 });

    expect(geminiChat).not.toHaveBeenCalled();
    expect(result.provider).toBe('openrouter');
  }, 10_000);

  it('throws AICallError when all providers time out', async () => {
    vi.mocked(groqChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('too late'), 30_000))
    );
    vi.mocked(geminiChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('too late'), 30_000))
    );
    vi.mocked(openRouterChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('too late'), 30_000))
    );

    await expect(aiChat('test prompt', { timeoutMs: 50 })).rejects.toThrow(AICallError);
  }, 10_000);

  it('logs a structured line with provider, durationMs, and success', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(groqChat).mockResolvedValue('groq response');

    await aiChat('test prompt');

    const structuredLog = logSpy.mock.calls.find(([line]) =>
      typeof line === 'string' && line.startsWith('[AI_METRICS]')
    );
    expect(structuredLog).toBeDefined();
    const payload = JSON.parse((structuredLog![0] as string).replace('[AI_METRICS] ', ''));
    expect(payload.provider).toBe('groq');
    expect(payload.success).toBe(true);
    expect(typeof payload.durationMs).toBe('number');

    logSpy.mockRestore();
  });
});
