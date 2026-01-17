import { z } from 'zod';
import { Question } from '@/types';

const FeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  codeQuality: z.number().min(0).max(100),
  timeComplexity: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  nextQuestion: z.string().optional(),
  // New fields for corrected code with comments
  correctedCode: z.string().optional(), // Full corrected code with inline comments
  codeExplanation: z.array(z.object({
    lineRange: z.string(), // e.g., "1-3" or "5"
    explanation: z.string(), // What this section does
  })).optional(),
  approachSummary: z.string().optional(), // High-level explanation of the correct approach
  isCodeCorrect: z.boolean().optional(), // Whether user's code was already correct
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export async function generateFeedback(
  question: { title: string; description: string; topic: string },
  userCode: string,
  testResults: { passed: number; total: number },
  timeSpent: number
): Promise<Feedback> {
  // Use OpenRouter or direct API
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const apiUrl = process.env.OPENROUTER_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'openai/gpt-4o-mini';

  const prompt = `You are an expert coding interview evaluator and mentor. Evaluate this submission and provide corrected code with detailed explanations:

Question: ${question.title}
Description: ${question.description}
Topic: ${question.topic}

User's Submitted Code:
\`\`\`
${userCode}
\`\`\`

Test Results: ${testResults.passed}/${testResults.total} passed
Time Spent: ${timeSpent} seconds

Provide structured feedback in JSON format:
{
  "score": 0-100,
  "codeQuality": 0-100,
  "timeComplexity": "O(n) format",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "nextQuestion": "suggested topic to practice next",
  "isCodeCorrect": true/false,
  "approachSummary": "A 2-3 sentence explanation of the optimal approach to solve this problem",
  "correctedCode": "The complete corrected/optimized code with inline comments explaining each important step. If user's code was correct, add comments explaining what each part does. Use // for single-line comments. Add a comment for every significant line or block.",
  "codeExplanation": [
    {"lineRange": "1-3", "explanation": "What these lines do"},
    {"lineRange": "5", "explanation": "What this specific line does"}
  ]
}

IMPORTANT for correctedCode:
- If user's code is CORRECT: Add inline comments (// ...) explaining each step
- If user's code is INCORRECT: Provide the corrected version with comments explaining the fix
- Make sure comments are clear and educational
- Explain the "why" not just the "what"`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for more complex response

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(process.env.OPENROUTER_API_KEY && {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
          'X-Title': 'Mocky AI Interview Prep',
        }),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000, // Increased for code + explanations
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return FeedbackSchema.parse(content);
  } catch (error) {
    console.error('LLM feedback generation error:', error);
    // Fallback feedback
    return {
      score: Math.round((testResults.passed / testResults.total) * 100),
      codeQuality: 60,
      timeComplexity: 'Unknown',
      strengths: ['Code submitted successfully'],
      improvements: ['Review test cases and edge cases'],
      isCodeCorrect: testResults.passed === testResults.total,
      approachSummary: 'Unable to generate detailed feedback at this time.',
    };
  }
}
import { Difficulty, QuestionType } from '@/types/enums';

const AISchema = z.object({
  questions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    topic: z.string(),
    difficulty: z.nativeEnum(Difficulty),
    type: z.nativeEnum(QuestionType),
    language: z.string().optional(),
    testCases: z.array(z.object({
      input: z.any(),
      expectedOutput: z.any(),
      isHidden: z.boolean().optional(),
    })).optional().default([]),
    expectedComplexity: z.string().optional(),
    hints: z.array(z.string()),
  })),
});

export async function generateAIQuestions(
  options: { difficulty: string; type: string; count: number; topics: string[] }
): Promise<any[]> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const apiUrl = process.env.OPENROUTER_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'openai/gpt-4o-mini';

  const prompt = `Generate ${options.count} ${options.difficulty} ${options.type} interview questions.
Topics to cover: ${options.topics.join(', ') || 'Any common interview topics'}.

For each question, provide:
- Title
- Detailed Description
- Topic
- Difficulty (Must be one of: EASY, MEDIUM, HARD)
- Type (Must be one of: DSA, CODING, HR, APTITUDE)
- Expected Language (if applicable, e.g., JAVASCRIPT, PYTHON, JAVA)
- 3-5 Test Cases (with input/expectedOutput) - Required for CODING/DSA types. Can be empty for theory/conceptual questions.
- Expected Complexity (e.g. O(n))
- 2-3 Hints

Ensure the questions cover a mix of problem-solving and core language concepts (e.g. for JavaScript: hoisting, closures, event loop; for Python: tuples, decorators, classes), dynamically adapted to the requested topic.

Format the output as a valid JSON object with a "questions" array. Ensure strict JSON syntax.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`LLM Error: ${response.statusText}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return AISchema.parse(content).questions;
  } catch (error) {
    console.error('Failed to generate AI questions:', error);
    return [];
  }
}

const SyllabusSchema = z.object({
  topics: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  }))
});

export async function generateTopicSyllabus(skill: string): Promise<z.infer<typeof SyllabusSchema>['topics']> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const apiUrl = process.env.OPENROUTER_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'openai/gpt-4o-mini';

  const prompt = `Generate a comprehensive study syllabus for "${skill}". 
List 9-12 essential topics (chapters) that cover everything from basics to advanced concepts.
For example, if skill is "JavaScript", include topics like "Variables & Scope", "Hoisting", "Closures", "Promises", "Event Loop", etc.

For each topic provide:
- id (slug-friendly, e.g., "hoisting")
- title (Display name)
- description (Short summary of what is covered)
- difficulty (Beginner, Intermediate, or Advanced)

Format as JSON object with "topics" array.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      }),
    });

    if (!response.ok) throw new Error(`LLM Error: ${response.statusText}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return SyllabusSchema.parse(content).topics;
  } catch (error) {
    console.error('Failed to generate syllabus:', error);
    return [
      { id: 'basics', title: `${skill} Basics`, description: 'Core concepts', difficulty: 'Beginner' },
      { id: 'advanced', title: `Advanced ${skill}`, description: 'Deep dive features', difficulty: 'Advanced' }
    ];
  }
}

const GuideSchema = z.object({
  title: z.string(),
  content: z.string(), // Markdown content
  keyTakeaways: z.array(z.string()),
});

export async function generateTopicGuide(skill: string, topic: string): Promise<z.infer<typeof GuideSchema>> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const apiUrl = process.env.OPENROUTER_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'openai/gpt-4o-mini';

  const prompt = `Create a comprehensive deep-dive study guide for the topic "${topic}" in the context of "${skill}".
  
  The output should include:
  1. A clear, in-depth explanation of the concept (using Markdown).
  2. Code examples demonstrating the concept (using Markdown code blocks).
  3. Common pitfalls or interview "gotchas".
  4. Real-world use cases.
  
  Format as JSON:
  {
    "title": "Topic Title",
    "content": "Full markdown content string...",
    "keyTakeaways": ["point 1", "point 2", ...]
  }`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      }),
    });

    if (!response.ok) throw new Error(`LLM Error: ${response.statusText}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return GuideSchema.parse(content);
  } catch (error) {
    console.error('Failed to generate guide:', error);
    return {
      title: topic,
      content: `Failed to generate guide for **${topic}**. Please try again later.`,
      keyTakeaways: []
    };
  }
}
