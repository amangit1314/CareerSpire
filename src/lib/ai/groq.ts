import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export interface GroqChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export async function groqChat(
  prompt: string,
  options: GroqChatOptions = {}
): Promise<string> {
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 4096,
    ...(options.responseFormat === 'json_object' && {
      response_format: { type: 'json_object' as const },
    }),
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned empty response');
  }

  return content;
}
