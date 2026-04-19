import { aiChat } from './ai';

/**
 * Legacy llmClient wrapper — delegates to the unified AI caller (Groq → Gemini fallback).
 * Maintains the same function signature for backward compatibility.
 */
export async function llmClient(
    prompt: string,
    opts?: { response_format?: string; temperature?: number; timeout?: number; maxRetries?: number }
): Promise<string> {
    try {
        const result = await aiChat(prompt, {
            temperature: opts?.temperature ?? 0.7,
            responseFormat: opts?.response_format === 'json_object' ? 'json_object' : 'text',
        });
        return result.content;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'AI request failed. Please try again.';
        console.error('[LLM Client] AI call failed:', errorMessage);
        throw new Error(errorMessage);
    }
}
