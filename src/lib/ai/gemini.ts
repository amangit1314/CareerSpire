import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is not set in environment variables');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export interface GeminiChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

const DEFAULT_MODEL = 'gemini-2.0-flash';

export async function geminiChat(
  prompt: string,
  options: GeminiChatOptions = {}
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: options.model || DEFAULT_MODEL,
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 4096,
      ...(options.responseFormat === 'json_object' && {
        responseMimeType: 'application/json',
      }),
    },
  });

  const result = await model.generateContent(prompt);
  const content = result.response.text();

  if (!content) {
    throw new Error('Gemini returned empty response');
  }

  return content;
}
