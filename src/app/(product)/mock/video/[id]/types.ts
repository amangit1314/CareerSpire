import type { Feedback } from '@/lib/ai/llm';

export interface AnswerFeedback {
    questionIndex: number;
    score: number;
    feedback: Feedback;
}
