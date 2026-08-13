// No official SDK dependency — OpenRouter exposes an OpenAI-compatible
// chat completions endpoint, so a plain fetch avoids adding the `openai`
// package just for this fallback path.
import { AI_MODELS } from './models';
import { appUrl } from '@/config/site';

export interface OpenRouterChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

const DEFAULT_MODEL = AI_MODELS.OPENROUTER;
const DEFAULT_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function openRouterChat(
  prompt: string,
  options: OpenRouterChatOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }
  const apiUrl = process.env.OPENROUTER_API_URL || DEFAULT_API_URL;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // OpenRouter uses these to attribute traffic on their dashboard — not
      // required for functionality, but recommended by their docs.
      'HTTP-Referer': appUrl,
      'X-Title': 'CareerSpire',
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4096,
      ...(options.responseFormat === 'json_object' && {
        response_format: { type: 'json_object' as const },
      }),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const error = new Error(`OpenRouter request failed (${response.status}): ${body}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter returned empty response');
  }

  return content;
}
