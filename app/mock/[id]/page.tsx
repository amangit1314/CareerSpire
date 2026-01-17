'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CodeEditor } from '@/components/CodeEditor';
import { QuestionCard } from '@/components/QuestionCard';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { MockSessionSkeleton } from '@/components/skeletons/MockSessionSkeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMockSession, useSubmitSolution } from '@/hooks/useMock';
import { Question, MockResult, ProgrammingLanguage } from '@/types';
import { Bug, Clock, Send, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function MockInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: session, isLoading } = useMockSession(id);
  const submitSolution = useSubmitSolution();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<MockResult | null>(null);

  useEffect(() => {
    if (session?.questions && session.questions.length > 0) {
      const currentQuestion = session.questions[currentQuestionIndex];
      const isPython = currentQuestion.language === ProgrammingLanguage.PYTHON;
      setCode(isPython ? '# Write your solution here\n' : '// Write your solution here\n');
      setTimeSpent(0);
      setSubmittedResult(null);
    }
  }, [session, currentQuestionIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!session) return;

    const currentQuestion = session.questions![currentQuestionIndex];

    try {
      const result = await submitSolution.mutateAsync({
        sessionId: session.id,
        questionId: currentQuestion.id,
        code,
        timeSpent,
      });

      setSubmittedResult(result);
    } catch (error: any) {
      alert(error.message || 'Failed to submit solution');
    }
  };

  const handleNextQuestion = () => {
    if (session?.questions && currentQuestionIndex < (session.questions?.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Check if user has made progress on current question
  const hasUnsavedProgress = code.trim() !== '// Write your solution here' &&
    code.trim() !== '# Write your solution here' &&
    code.trim() !== '' &&
    !submittedResult;

  const handleQuestionSelect = (idx: number) => {
    if (idx === currentQuestionIndex) return;

    // If user has written code and hasn't submitted, show confirmation
    if (hasUnsavedProgress) {
      const confirmed = window.confirm(
        '⚠️ Switching questions will reset your current progress.\n\nYour code for this question will be lost. Are you sure you want to continue?'
      );
      if (!confirmed) return;
    }

    setCurrentQuestionIndex(idx);
  };

  if (isLoading) {
    return <MockSessionSkeleton />;
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          title="Session not found"
          message="The interview session you're looking for doesn't exist or has been deleted. Please start a new mock interview."
        />
      </div>
    );
  }

  const currentQuestion = session.questions![currentQuestionIndex];
  const currentResult = session.results?.find((r) => r.questionId === currentQuestion.id);
  const showFeedback = submittedResult || currentResult;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`${dmSans.className} text-2xl font-bold`}>Mock Interview</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {session.questions!.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Questions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {session.questions!.map((question, idx) => {
            const result = session.results?.find((r) => r.questionId === question.id);
            return (
              <QuestionCard
                key={question.id}
                question={question}
                index={idx}
                isActive={idx === currentQuestionIndex}
                onSelect={() => handleQuestionSelect(idx)}
              />
            );
          })}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question */}
          <Card>
            <CardContent className={cn("pt-6", dmSans.className)}>
              <h2 className="text-xl font-bold mb-4">{currentQuestion.title}</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{currentQuestion.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          {!showFeedback && (
            <div>
              <CodeEditor
                language={
                  currentQuestion.language === ProgrammingLanguage.PYTHON
                    ? 'python'
                    : 'javascript'
                }
                value={code}
                onChange={(value) => setCode(value || '')}
                height="500px"
              />
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={submitSolution.isPending}
                  className={`${dmSans.className} w-full`}
                  size="lg"
                >
                  {submitSolution.isPending ? (
                    <>
                      <Terminal className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Solution
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div>
              <FeedbackPanel result={submittedResult || currentResult!} />
              {currentQuestionIndex < session.questions!.length - 1 && (
                <div className="mt-6">
                  <Button onClick={handleNextQuestion} size="lg" className={`${dmSans.className} w-full`}>
                    Next Question
                  </Button>
                </div>
              )}
              {currentQuestionIndex === session.questions!.length - 1 && (
                <div className="mt-6">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    size="lg"
                    variant="outline"
                    className={`${dmSans.className} w-full`}
                  >
                    Finish Interview
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
