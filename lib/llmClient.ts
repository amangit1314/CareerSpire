export async function llmClient(
    prompt: string,
    opts?: { response_format?: string; temperature?: number; timeout?: number; maxRetries?: number }
): Promise<string> {
    const maxRetries = opts?.maxRetries ?? 2;
    const initialTimeout = opts?.timeout || 90000;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        // Increase timeout slightly on each retry
        const currentTimeout = initialTimeout + (attempt * 10000);
        const timeoutId = setTimeout(() => controller.abort(), currentTimeout);

        try {
            const apiUrl = process.env.OPENROUTER_API_URL || process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
            const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

            if (!apiKey) {
                throw new Error('LLM API key is missing. Please check your .env file.');
            }

            if (attempt > 0) {
                console.log(`[LLM Client] Retry attempt ${attempt}/${maxRetries} with timeout ${currentTimeout}ms...`);
                // Wait before retrying (exponential backoff: 1s, 2s)
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }

            const res = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    ...(process.env.OPENROUTER_API_KEY && {
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                        'X-Title': 'CareerSpire AI Interview Prep',
                    }),
                },
                body: JSON.stringify({
                    model: process.env.LLM_MODEL || "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: opts?.response_format ? { type: opts.response_format } : undefined,
                    temperature: opts?.temperature ?? 0.7,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errorText = await res.text().catch(() => 'Unknown error');
                throw new Error(`LLM API error: ${res.status} ${res.statusText} - ${errorText}`);
            }

            const json = await res.json();

            if (!json.choices?.[0]?.message?.content) {
                throw new Error('Invalid LLM response format');
            }

            return json.choices[0].message.content;
        } catch (error: any) {
            clearTimeout(timeoutId);
            lastError = error;

            const isTimeout = error.name === 'AbortError';
            const isRetryable = isTimeout || (error.status && error.status >= 500);

            if (isTimeout) {
                console.error(`[LLM Client] Request timed out after ${currentTimeout}ms`);
            } else {
                console.error(`[LLM Client] Error on attempt ${attempt + 1}:`, error.message);
            }

            if (!isRetryable || attempt >= maxRetries) {
                break;
            }
        }
    }

    if (lastError?.name === 'AbortError') {
        throw new Error('LLM request timed out after multiple attempts. Please try again.');
    }
    throw lastError;
}
