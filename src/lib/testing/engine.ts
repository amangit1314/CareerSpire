import { prisma } from '@/lib/prisma';
import { submitSolutionAction, startMockAction } from '../../app/actions/mock.actions';
import { QuestionType, Difficulty, ProgrammingLanguage } from '@/types/enums';
import { llmClient } from '../llmClient';
import type { TestResult as CodeRunnerTestResult } from '../code-runner';

export interface WorkflowResult {
    step: string;
    status: 'SUCCESS' | 'FAILURE';
    details?: Record<string, unknown>;
    error?: string;
}

export class DynamicTestEngine {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    /**
     * Runs a complete end-to-end simulation of a mock interview.
     */
    async runFullInterviewSimulation(type: QuestionType): Promise<WorkflowResult[]> {
        const results: WorkflowResult[] = [];

        try {
            // Step 1: Start Mock
            console.log(`[TestEngine] Starting ${type} mock...`);
            const sessionResult = await startMockAction(this.userId, {
                type,
                difficulty: Difficulty.EASY,
                language: type === QuestionType.DSA ? ProgrammingLanguage.JAVASCRIPT : undefined
            });

            const session = sessionResult;
            const questionList = session.questions || [];

            results.push({
                step: 'START_MOCK',
                status: 'SUCCESS',
                details: { sessionId: session.id, questionCount: questionList.length }
            });

            // Step 2: For each question, simulate a perfect submission
            for (const q of questionList) {
                console.log(`[TestEngine] Simulating submission for: ${q.title}`);

                const lang = session.language || ProgrammingLanguage.JAVASCRIPT;
                const solution = await this.synthesizeSolution(q, lang);

                const submissionResult = await submitSolutionAction(this.userId, {
                    sessionId: session.id,
                    questionId: q.id,
                    code: solution,
                    language: lang,
                    timeSpent: 120
                });

                const submission = submissionResult;
                const testResults = (submission.testResults as unknown as CodeRunnerTestResult) || { verdict: 'UNKNOWN', details: [] };

                results.push({
                    step: `SUBMISSION_${q.id}`,
                    status: testResults.verdict === 'AC' ? 'SUCCESS' : 'FAILURE',
                    details: {
                        title: q.title,
                        verdict: testResults.verdict,
                        score: submission.score,
                        failures: (testResults.details || [])
                            .filter((d) => !d.passed)
                            .map((d) => ({ input: d.input, exp: d.expected, act: d.actual, err: d.error }))
                    }
                });
            }

            // Step 3: Verify Session Completion
            const finalSession = await prisma.mockSession.findUnique({ where: { id: session.id } });
            results.push({
                step: 'SESSION_COMPLETION',
                status: finalSession?.status === 'COMPLETED' ? 'SUCCESS' : 'FAILURE'
            });

        } catch (err: unknown) {
            results.push({ step: 'WORKFLOW_FAILURE', status: 'FAILURE', error: err instanceof Error ? err.message : 'Unknown error' });
        }

        return results;
    }

    /**
     * Asks AI to produce a perfect solution for a question to test the engine's evaluation.
     */
    private async synthesizeSolution(question: { title: string; description: string; entryFunctionName?: string | null; starterCode?: string | null }, language: ProgrammingLanguage = ProgrammingLanguage.JAVASCRIPT): Promise<string> {
        const prompt = `Solve this interview problem exactly.
    Title: ${question.title}
    Description: ${question.description}
    Entry Function Name: ${question.entryFunctionName || 'solution'}
    Programming Language: ${language}
    
    Return ONLY the code. No markdown code blocks, no explanation. 
    Ensure it matches the expected logic and returns the correct value type.
    DO NOT RETURN PLACEHOLDERS LIKE 'return true' or 'return 0'.
    Implement the FULL logic for ${language}.`;

        try {
            const solution = await llmClient(prompt);
            const cleanCode = solution.replace(/```[a-z]*\n/g, '').replace(/```/g, '').trim();
            console.log(`[TestEngine] Prepared ${language} code for ${question.title}:\n${cleanCode.substring(0, 150)}...`);
            return cleanCode;
        } catch {
            return question.starterCode || (language === ProgrammingLanguage.JAVASCRIPT ? `function solution() { return true; }` : `def solution(): return True`);
        }
    }
}
