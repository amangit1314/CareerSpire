import { z } from 'zod';
import { aiChat } from '../index';

const FeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  codeQuality: z.number().min(0).max(100),
  timeComplexity: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  nextQuestion: z.string().optional(),
  correctedCode: z.string().optional(),
  codeExplanation: z.array(z.object({
    lineRange: z.string(),
    explanation: z.string(),
  })).optional(),
  approachSummary: z.string().optional(),
  isCodeCorrect: z.boolean().optional(),
  conversationalResponse: z.string().optional(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export async function generateFeedback(
  question: {
    title: string;
    description: string;
    topic: string;
    codeSnippet?: string | null;
    expectedAnswerFormat?: string;
  },
  userAnswer: string,
  testResults: { passed: number; total: number },
  timeSpent: number,
  history: { role: 'ai' | 'user'; content: string }[] = []
): Promise<Feedback> {
  const prompt = `You are an ELITE Senior Technical Interviewer and Tutor.
The user is practicing a specific interview question.
Your goal is to guide them, evaluate their submissions, and answer their questions about THIS topic/question only.

STRICT RULES:
1. If the user is ASKING for the answer, a hint, or has a general question about the concept, provide a detailed and helpful response in "conversationalResponse".
2. If the user SUBMITS a code or a conceptual answer, evaluate it and fill in "score", "strengths", "improvements", etc.
3. BE MINDFUL of the conversation history. If the user asks follow-up questions, answer them naturally.
4. If providing a direct answer/solution, always explain the reasoning and wrap code in Markdown.
5. You MUST respond with a JSON object.

### Current Question Context
Title: ${question.title}
Topic: ${question.topic}
Description: ${question.description}
${question.codeSnippet ? `Reference Code Snippet:\n\`\`\`\n${question.codeSnippet}\n\`\`\`` : ''}

${history.length > 0 ? `### Conversation History\n${history.slice(-6).map(m => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.content}`).join('\n')}\n` : ''}
### User's Input
"${userAnswer}"

### Evaluation Goal
Is the user submitting a final answer, or just asking a question/seeking clarification/hint?
- If asking a question/hint/direct answer: Provide a helpful and encouraging response in "conversationalResponse". Answer their query directly and accurately.
- If submitting an answer: Evaluate it rigorously and provide feedback in the other fields.

Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.
{
  "score": 0-100,
  "codeQuality": 0-100,
  "timeComplexity": "O(...) or N/A",
  "strengths": ["..."],
  "improvements": ["..."],
  "isCodeCorrect": true/false,
  "approachSummary": "Summary of the ideal approach",
  "conversationalResponse": "Your direct message to the user if they are chatting/asking for help",
  "correctedCode": "The full corrected code or perfect theoretical explanation",
  "codeExplanation": [{"lineRange": "...", "explanation": "..."}]
}`;

  try {
    const result = await aiChat(prompt, {
      temperature: 0.1,
      responseFormat: 'json_object',
      maxTokens: 2000,
    });

    const content = JSON.parse(result.content);
    return FeedbackSchema.parse(content);
  } catch (error) {
    console.error('Feedback generation error:', error);
    const total = testResults.total || 1;
    return {
      score: Math.round((testResults.passed / total) * 100),
      codeQuality: 60,
      timeComplexity: 'Unknown',
      strengths: ['Code submitted successfully'],
      improvements: ['Review test cases and edge cases'],
      isCodeCorrect: testResults.passed === testResults.total,
      approachSummary: 'Unable to generate detailed feedback at this time.',
    };
  }
}
