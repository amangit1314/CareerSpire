'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CodeEditor } from '@/components/CodeEditor';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { MockSessionSkeleton } from '@/components/skeletons/MockSessionSkeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockSession, useSubmitSolution } from '@/features/mock/hooks/useMock';
import { MockResult, AnswerFormat, QuestionFormat } from '@/types';
import { Send, Sparkles, Terminal, Loader2, Code2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCodeAsync } from '@/lib/utils/formatCode';
import { ROUTES } from '@/config/routes';
import { getHintConfig } from './hintConfig';
import { SessionHeader } from './_components/SessionHeader';
import { QuestionDescriptionPanel } from './_components/QuestionDescriptionPanel';
import { HintsPanel } from './_components/HintsPanel';
import { TimeUpOverlay } from './_components/TimeUpOverlay';

export default function MockInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: session, isLoading } = useMockSession(id);
  const submitSolution = useSubmitSolution();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [questionTimeSpent, setQuestionTimeSpent] = useState(0); // per-question elapsed
  const [sessionTimeElapsed, setSessionTimeElapsed] = useState(0); // total session elapsed
  const [submittedResult, setSubmittedResult] = useState<MockResult | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [editorType, setEditorType] = useState<'code' | 'text'>('code');
  const [isCodePanelCollapsed, setIsCodePanelCollapsed] = useState(false);
  const [formattedSnippet, setFormattedSnippet] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session?.questions && session.questions.length > 0) {
      const currentQuestion = session.questions[currentQuestionIndex];
      const lang = currentQuestion.language?.toLowerCase() || 'javascript';
      setSelectedLanguage(lang);

      const isPython = lang === 'python';
      const commentPrefix = isPython ? '# ' : '// ';
      const qFormat = currentQuestion.questionFormat;

      // Smart defaults based on question format
      if (qFormat === QuestionFormat.DEBUGGING && currentQuestion.codeSnippet) {
        // Pre-fill with buggy code so user can fix it
        setEditorType('code');
        if (currentQuestion.starterCode) {
          setCode(currentQuestion.starterCode);
        } else {
          formatCodeAsync(currentQuestion.codeSnippet, lang).then(formatted => {
            setCode(formatted || currentQuestion.codeSnippet || '');
          });
          setCode(currentQuestion.codeSnippet); // show raw immediately
        }
      } else if (qFormat === QuestionFormat.OUTPUT_PREDICTION || qFormat === QuestionFormat.THEORY) {
        // Text-based answers
        setEditorType('text');
        setCode('');
      } else if (currentQuestion.expectedAnswerFormat === AnswerFormat.CODE_SNIPPET) {
        setEditorType('code');
        setCode(currentQuestion.starterCode || `${commentPrefix}Write your solution here\n`);
      } else {
        setEditorType('text');
        setCode(currentQuestion.starterCode || '');
      }

      setQuestionTimeSpent(0);
      setSubmittedResult(null);
      setActiveTab('description');
      setRevealedHints(0);

      // Format code snippet with Prettier
      if (currentQuestion.codeSnippet) {
        setFormattedSnippet(currentQuestion.codeSnippet); // show raw immediately
        formatCodeAsync(currentQuestion.codeSnippet, lang).then(setFormattedSnippet);
      } else {
        setFormattedSnippet('');
      }
    }
  }, [currentQuestionIndex]); // Only reset when question index changes, not when session refetches

  // Collapse code panel only when first switching TO feedback tab
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (activeTab === 'feedback' && prevTabRef.current !== 'feedback') {
      setIsCodePanelCollapsed(true);
    } else if (activeTab !== 'feedback' && prevTabRef.current === 'feedback') {
      setIsCodePanelCollapsed(false);
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  // Total session duration from all questions' expectedTimeMinutes
  const totalSessionSeconds = useMemo(() => {
    if (!session?.questions) return 0;
    return session.questions.reduce((sum, q) => sum + (q.expectedTimeMinutes || 10), 0) * 60;
  }, [session?.questions]);

  const sessionTimeRemaining = totalSessionSeconds - sessionTimeElapsed;
  const currentQuestionExpected = session?.questions?.[currentQuestionIndex]?.expectedTimeMinutes
    ? session.questions[currentQuestionIndex].expectedTimeMinutes * 60
    : 600; // default 10 min
  const questionOvertime = questionTimeSpent > currentQuestionExpected;

  // Unified timer — ticks both per-question and session clocks
  useEffect(() => {
    if (sessionFinished) return;
    const interval = setInterval(() => {
      setQuestionTimeSpent((prev) => prev + 1);
      setSessionTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionFinished]);

  // Session time warning and auto-finish after grace period
  useEffect(() => {
    if (sessionFinished || totalSessionSeconds === 0) return;

    if (sessionTimeRemaining <= 0 && !showTimeWarning) {
      setShowTimeWarning(true);
      // Start 2-minute grace period then auto-redirect
      graceTimerRef.current = setTimeout(() => {
        setSessionFinished(true);
        router.push(ROUTES.DASHBOARD);
      }, 120_000);
    }

    return () => {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, [sessionTimeRemaining, sessionFinished, showTimeWarning, totalSessionSeconds, router]);

  const handleSubmit = async () => {
    if (!session) return;

    const currentQuestion = session.questions![currentQuestionIndex];

    try {
      const result = await submitSolution.mutateAsync({
        sessionId: session.id,
        questionId: currentQuestion.id,
        code,
        language: selectedLanguage.toUpperCase(),
        timeSpent: questionTimeSpent,
      });

      setSubmittedResult(result);
      setActiveTab('feedback');
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to submit solution');
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

  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          title={!session ? "Session not found" : "No questions found"}
          message={!session
            ? "The interview session you're looking for doesn't exist or has been deleted."
            : "This session doesn't have any questions associated with it. Please try starting a new interview."}
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push('/mock/new')}>Start New Mock</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message="The requested question could not be found in this session."
          onDismiss={() => setCurrentQuestionIndex(0)}
        />
      </div>
    );
  }

  const currentResult = session.results?.find((r) => r.questionId === currentQuestion.id);
  const activeResult = submittedResult || currentResult;

  // Smart display logic based on question format
  const qf = currentQuestion.questionFormat;
  // Code snippet is the core of the question — embed inline, don't show as separate reference
  const isCodeTheQuestion = qf === QuestionFormat.OUTPUT_PREDICTION || qf === QuestionFormat.DEBUGGING;
  // Show language selector only for code-writing formats
  const showLanguageSelector = qf === QuestionFormat.CODE_WRITING || qf === QuestionFormat.DSA;
  // Show reference code snippet only when it's supplementary context, not the question itself
  const showReferenceSnippet = !isCodeTheQuestion && !!currentQuestion.codeSnippet && !!formattedSnippet;

  const hintConfig = getHintConfig(qf);
  const totalHints = currentQuestion.hints?.length || 0;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <SessionHeader
        questions={session.questions}
        results={session.results}
        currentQuestionIndex={currentQuestionIndex}
        currentQuestionSubmitted={!!submittedResult}
        onSelectQuestion={handleQuestionSelect}
        questionTimeSpent={questionTimeSpent}
        currentQuestionExpected={currentQuestionExpected}
        questionOvertime={questionOvertime}
        sessionTimeRemaining={sessionTimeRemaining}
        totalSessionSeconds={totalSessionSeconds}
        onExit={() => router.push(ROUTES.DASHBOARD)}
      />

      {/* Main Panels */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Description & Info */}
        <div className={cn(
          "flex flex-col border-r h-full bg-muted/[0.02] transition-all duration-300 ease-in-out",
          isCodePanelCollapsed ? "w-full mr-12" : "w-1/2"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 border-b shrink-0 bg-muted/10">
              <TabsList className="h-12 bg-transparent gap-6">
                <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-semibold gap-2">
                  <Terminal className="h-4 w-4" /> Description
                </TabsTrigger>
                <TabsTrigger value="hints" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-semibold gap-2 text-muted-foreground">
                  <hintConfig.icon className="h-4 w-4" /> {hintConfig.label} {totalHints > 0 && `(${totalHints})`}
                </TabsTrigger>
                {(activeResult) && (
                  <TabsTrigger value="feedback" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-semibold gap-2 text-primary">
                    <Sparkles className="h-4 w-4" /> Feedback
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4">
                  <TabsContent value="description" className="m-0 focus-visible:ring-0">
                    <QuestionDescriptionPanel
                      question={currentQuestion}
                      questionIndex={currentQuestionIndex}
                      qf={qf}
                      formattedSnippet={formattedSnippet}
                      isCodeTheQuestion={isCodeTheQuestion}
                      showReferenceSnippet={showReferenceSnippet}
                    />
                  </TabsContent>

                  <TabsContent value="hints" className="m-0 focus-visible:ring-0">
                    <HintsPanel
                      hints={currentQuestion.hints}
                      hintConfig={hintConfig}
                      revealedHints={revealedHints}
                      onRevealNext={() => setRevealedHints(prev => prev + 1)}
                    />
                  </TabsContent>

                  <TabsContent value="feedback" className="m-0 focus-visible:ring-0">
                    <div className="py-4 pb-12">
                      {activeResult && <FeedbackPanel result={activeResult} />}

                      {activeResult && (
                        <div className="mt-8 flex flex-col gap-4">
                          {currentQuestionIndex < session.questions.length - 1 ? (
                            <Button onClick={handleNextQuestion} className="w-full h-12 dark:text-white" size="lg">
                              Go to Next Question
                            </Button>
                          ) : (
                            <Button onClick={() => router.push(ROUTES.DASHBOARD)} variant="outline" className="w-full h-12" size="lg">
                              Finish Session and Return to Dashboard
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Right Panel: Editor */}
        <div className={cn(
          "flex flex-col h-full bg-background transition-all duration-300 ease-in-out overflow-hidden",
          isCodePanelCollapsed ? "w-0" : "w-1/2"
        )}>
          <div className="h-12 border-b flex items-center justify-between px-3 bg-muted/5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                <Select
                  value={editorType}
                  onValueChange={(value: 'code' | 'text') => setEditorType(value)}
                >
                  <SelectTrigger className="h-7 w-auto gap-1.5 text-xs font-semibold border border-border/50 bg-muted/30 hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 px-2.5 rounded-md transition-colors">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[140px]">
                    <SelectItem value="code" className="text-xs font-medium">Code Editor</SelectItem>
                    <SelectItem value="text" className="text-xs font-medium">Text Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editorType === 'code' && showLanguageSelector && (
                <>
                  <div className="h-4 w-px bg-border/50" />
                  <Select
                    value={selectedLanguage}
                    onValueChange={(value) => {
                      setSelectedLanguage(value);
                      const isPython = value === 'python';
                      const oldComment = selectedLanguage === 'python' ? '# Write your solution here\n' : '// Write your solution here\n';
                      const newComment = isPython ? '# Write your solution here\n' : '// Write your solution here\n';
                      if (code === '' || code === oldComment) {
                        setCode(newComment);
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 w-auto gap-1.5 text-xs font-bold uppercase border border-border/50 bg-muted/30 hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 px-2.5 rounded-md transition-colors">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent align="start" className="min-w-[140px]">
                      <SelectItem value="javascript" className="text-xs font-bold">JavaScript</SelectItem>
                      <SelectItem value="python" className="text-xs font-bold">Python</SelectItem>
                      <SelectItem value="java" className="text-xs font-bold">Java</SelectItem>
                      <SelectItem value="cpp" className="text-xs font-bold">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setIsCodePanelCollapsed(!isCodePanelCollapsed)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {editorType === 'code' ? (
              <div className="h-full p-4">
                <CodeEditor
                  language={selectedLanguage}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  height="100%"
                  className="h-full shadow-sm"
                />
              </div>
            ) : (
              <div className="h-full p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={
                    qf === QuestionFormat.OUTPUT_PREDICTION
                      ? "What will this code output? Explain your reasoning..."
                      : qf === QuestionFormat.THEORY
                        ? "Explain your understanding with examples..."
                        : "Type your answer, explanation, or system design notes here..."
                  }
                  className="w-full h-full p-6 text-base font-mono bg-muted/10 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 border-border border"
                />
              </div>
            )}

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={submitSolution.isPending || !!submittedResult}
                className="shadow-2xl shadow-primary/20 px-4 py-2 h-12 rounded-full cursor-pointer h-full dark:text-white"
                size="lg"
              >
                {submitSolution.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Submit Answer</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Vertical Tab Handle (when collapsed) */}
        {isCodePanelCollapsed && (
          <button
            onClick={() => setIsCodePanelCollapsed(false)}
            className="absolute right-0 top-0 h-full w-12 bg-muted/30 hover:bg-muted/50 border-l border-border flex items-center justify-center transition-colors group"
          >
            <div className="flex flex-col items-center gap-2">
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="writing-mode-vertical text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors" style={{ writingMode: 'vertical-rl' }}>
                Editor
              </div>
            </div>
          </button>
        )}
      </main>

      <TimeUpOverlay
        show={showTimeWarning && !sessionFinished}
        onEndNow={() => {
          setShowTimeWarning(false);
          setSessionFinished(true);
          router.push(ROUTES.DASHBOARD);
        }}
        onUseGracePeriod={() => setShowTimeWarning(false)}
      />
    </div>
  );
}
