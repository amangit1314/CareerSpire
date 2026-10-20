"use client";

import { useEffect, useState, useMemo, useReducer, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { MockSessionSkeleton } from "@/components/skeletons/MockSessionSkeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMockSession,
  useSubmitSolution,
} from "@/features/mock/hooks/useMock";
import { AnswerFormat, QuestionFormat } from "@/types";
import { Sparkles, Terminal, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCodeAsync } from "@/lib/utils/formatCode";
import { ROUTES } from "@/config/routes";
import { MOCK_INTERVIEW_MESSAGES } from "@/config/messages";
import { MOCK_INTERVIEW_CONTENT } from "@/config/content";
import { getHintConfig } from "./hintConfig";
import { SessionHeader } from "./_components/SessionHeader";
import { QuestionDescriptionPanel } from "./_components/QuestionDescriptionPanel";
import { HintsPanel } from "./_components/HintsPanel";
import { TimeUpOverlay } from "./_components/TimeUpOverlay";
import { CodeEditorPanel } from "./_components/CodeEditorPanel";
import {
  EditorType,
  QuestionActionType,
  QuestionTab,
  questionReducer,
  initialQuestionState,
  DEFAULT_EDITOR_LANGUAGE,
} from "./questionReducer";

export default function MockInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: session, isLoading } = useMockSession(id);
  const submitSolution = useSubmitSolution();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionState, dispatch] = useReducer(
    questionReducer,
    initialQuestionState,
  );
  const [sessionTimeElapsed, setSessionTimeElapsed] = useState(0); // total session elapsed
  const [isCodePanelCollapsed, setIsCodePanelCollapsed] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session?.questions && session.questions.length > 0) {
      const currentQuestion = session.questions[currentQuestionIndex];
      const lang =
        currentQuestion.language?.toLowerCase() || DEFAULT_EDITOR_LANGUAGE;
      const isPython = lang === "python";
      const commentPrefix = isPython ? "# " : "// ";
      const qFormat = currentQuestion.questionFormat;

      // Smart defaults based on question format
      let editorType: EditorType;
      let code: string;
      if (qFormat === QuestionFormat.DEBUGGING && currentQuestion.codeSnippet) {
        // Pre-fill with buggy code so user can fix it
        editorType = EditorType.Code;
        code = currentQuestion.starterCode || currentQuestion.codeSnippet; // show raw immediately if no starter code
      } else if (
        qFormat === QuestionFormat.OUTPUT_PREDICTION ||
        qFormat === QuestionFormat.THEORY
      ) {
        // Text-based answers
        editorType = EditorType.Text;
        code = "";
      } else if (
        currentQuestion.expectedAnswerFormat === AnswerFormat.CODE_SNIPPET
      ) {
        editorType = EditorType.Code;
        code =
          currentQuestion.starterCode ||
          `${commentPrefix}Write your solution here\n`;
      } else {
        editorType = EditorType.Text;
        code = currentQuestion.starterCode || "";
      }

      // Resets 8 pieces of question-specific state together whenever the
      // question index changes — a legitimate "reset state on key change"
      // effect, not a derived-value sync. (A `key`-prop remount would be
      // the alternative React's docs suggest, but that would blow away
      // more than intended here — the session-level timer
      // (sessionTimeElapsed, graceTimerRef below) must keep running
      // continuously across questions, not reset per-question.) Routed
      // through the reducer's dispatch instead of 8 setState calls.
      dispatch({
        type: QuestionActionType.ResetForQuestion,
        language: lang,
        editorType,
        code,
        formattedSnippet: currentQuestion.codeSnippet || "",
      });

      // DEBUGGING without starterCode: format the raw snippet with Prettier
      // once ready, replacing the raw version set synchronously above.
      if (
        qFormat === QuestionFormat.DEBUGGING &&
        currentQuestion.codeSnippet &&
        !currentQuestion.starterCode
      ) {
        formatCodeAsync(currentQuestion.codeSnippet, lang).then((formatted) => {
          dispatch({
            type: QuestionActionType.SetCode,
            code: formatted || currentQuestion.codeSnippet || "",
          });
        });
      }

      // Format the reference code snippet with Prettier for display
      if (currentQuestion.codeSnippet) {
        formatCodeAsync(currentQuestion.codeSnippet, lang).then((snippet) => {
          dispatch({ type: QuestionActionType.SetFormattedSnippet, snippet });
        });
      }
    }
  }, [currentQuestionIndex]); // Only reset when question index changes, not when session refetches

  // Collapse code panel only when first switching TO feedback tab
  const prevTabRef = useRef(questionState.activeTab);
  useEffect(() => {
    if (
      questionState.activeTab === QuestionTab.Feedback &&
      prevTabRef.current !== QuestionTab.Feedback
    ) {
      // Tracks a *transition* (via prevTabRef), not just the current tab —
      // can't be computed directly during render the way a plain derived
      // value could, since it needs to distinguish "just switched to
      // feedback" from "still on feedback".
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCodePanelCollapsed(true);
    } else if (
      questionState.activeTab !== QuestionTab.Feedback &&
      prevTabRef.current === QuestionTab.Feedback
    ) {
      setIsCodePanelCollapsed(false);
    }
    prevTabRef.current = questionState.activeTab;
  }, [questionState.activeTab]);

  // Total session duration from all questions' expectedTimeMinutes
  const totalSessionSeconds = useMemo(() => {
    if (!session?.questions) return 0;
    return (
      session.questions.reduce(
        (sum, q) => sum + (q.expectedTimeMinutes || 10),
        0,
      ) * 60
    );
  }, [session?.questions]);

  const sessionTimeRemaining = totalSessionSeconds - sessionTimeElapsed;
  const currentQuestionExpected = session?.questions?.[currentQuestionIndex]
    ?.expectedTimeMinutes
    ? session.questions[currentQuestionIndex].expectedTimeMinutes * 60
    : 600; // default 10 min
  const questionOvertime =
    questionState.questionTimeSpent > currentQuestionExpected;

  // Unified timer — ticks both per-question and session clocks
  useEffect(() => {
    if (sessionFinished) return;
    const interval = setInterval(() => {
      dispatch({ type: QuestionActionType.TickQuestionTime });
      setSessionTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionFinished]);

  // Session time warning and auto-finish after grace period
  useEffect(() => {
    if (sessionFinished || totalSessionSeconds === 0) return;

    if (sessionTimeRemaining <= 0 && !showTimeWarning) {
      // Watches a derived value (sessionTimeRemaining) cross a threshold and
      // triggers a one-time side effect (starting the grace-period timer) —
      // can't be expressed as a plain render-time computation since it must
      // fire exactly once per threshold crossing, not on every render where
      // the condition happens to be true.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [
    sessionTimeRemaining,
    sessionFinished,
    showTimeWarning,
    totalSessionSeconds,
    router,
  ]);

  const handleSubmit = async () => {
    if (!session) return;

    const currentQuestion = session.questions![currentQuestionIndex];

    try {
      const result = await submitSolution.mutateAsync({
        sessionId: session.id,
        questionId: currentQuestion.id,
        code: questionState.code,
        language: questionState.selectedLanguage.toUpperCase(),
        timeSpent: questionState.questionTimeSpent,
      });

      dispatch({ type: QuestionActionType.SubmitResult, result });
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : MOCK_INTERVIEW_MESSAGES.SUBMIT_FAILED_FALLBACK,
      );
    }
  };

  const handleNextQuestion = () => {
    if (
      session?.questions &&
      currentQuestionIndex < (session.questions?.length ?? 0) - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Check if user has made progress on current question
  const hasUnsavedProgress =
    questionState.code.trim() !== "// Write your solution here" &&
    questionState.code.trim() !== "# Write your solution here" &&
    questionState.code.trim() !== "" &&
    !questionState.submittedResult;

  const handleQuestionSelect = (idx: number) => {
    if (idx === currentQuestionIndex) return;

    // If user has written code and hasn't submitted, show confirmation
    if (hasUnsavedProgress) {
      const confirmed = window.confirm(
        MOCK_INTERVIEW_CONTENT.SWITCH_QUESTION_CONFIRM,
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
          title={
            !session
              ? MOCK_INTERVIEW_CONTENT.SESSION_NOT_FOUND_TITLE
              : MOCK_INTERVIEW_CONTENT.NO_QUESTIONS_TITLE
          }
          message={
            !session
              ? MOCK_INTERVIEW_CONTENT.SESSION_NOT_FOUND_MESSAGE
              : MOCK_INTERVIEW_CONTENT.NO_QUESTIONS_MESSAGE
          }
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push(ROUTES.MOCK_NEW)}>
            {MOCK_INTERVIEW_CONTENT.START_NEW_MOCK}
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={MOCK_INTERVIEW_CONTENT.QUESTION_NOT_FOUND}
          onDismiss={() => setCurrentQuestionIndex(0)}
        />
      </div>
    );
  }

  const currentResult = session.results?.find(
    (r) => r.questionId === currentQuestion.id,
  );
  const activeResult = questionState.submittedResult || currentResult;

  // Smart display logic based on question format
  const qf = currentQuestion.questionFormat;
  // Code snippet is the core of the question — embed inline, don't show as separate reference
  const isCodeTheQuestion =
    qf === QuestionFormat.OUTPUT_PREDICTION || qf === QuestionFormat.DEBUGGING;
  // Show language selector only for code-writing formats
  const showLanguageSelector =
    qf === QuestionFormat.CODE_WRITING || qf === QuestionFormat.DSA;
  // Show reference code snippet only when it's supplementary context, not the question itself
  const showReferenceSnippet =
    !isCodeTheQuestion &&
    !!currentQuestion.codeSnippet &&
    !!questionState.formattedSnippet;

  const hintConfig = getHintConfig(qf);
  const totalHints = currentQuestion.hints?.length || 0;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <SessionHeader
        questions={session.questions}
        results={session.results}
        currentQuestionIndex={currentQuestionIndex}
        currentQuestionSubmitted={!!questionState.submittedResult}
        onSelectQuestion={handleQuestionSelect}
        questionTimeSpent={questionState.questionTimeSpent}
        currentQuestionExpected={currentQuestionExpected}
        questionOvertime={questionOvertime}
        sessionTimeRemaining={sessionTimeRemaining}
        totalSessionSeconds={totalSessionSeconds}
        onExit={() => router.push(ROUTES.DASHBOARD)}
      />

      {/* Main Panels */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Description & Info */}
        <div
          className={cn(
            "flex flex-col border-r h-full bg-muted/[0.02] transition-all duration-300 ease-in-out",
            isCodePanelCollapsed ? "w-full mr-12" : "w-1/2",
          )}
        >
          <Tabs
            value={questionState.activeTab}
            onValueChange={(tab) =>
              dispatch({
                type: QuestionActionType.SetActiveTab,
                tab: tab as QuestionTab,
              })
            }
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-4 border-b shrink-0 bg-muted/10">
              <TabsList className="h-12 bg-transparent gap-6">
                <TabsTrigger
                  value={QuestionTab.Description}
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-semibold gap-2"
                >
                  <Terminal className="h-4 w-4" />{" "}
                  {MOCK_INTERVIEW_CONTENT.TAB_DESCRIPTION}
                </TabsTrigger>
                <TabsTrigger
                  value={QuestionTab.Hints}
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-semibold gap-2 text-muted-foreground"
                >
                  <hintConfig.icon className="h-4 w-4" /> {hintConfig.label}{" "}
                  {totalHints > 0 && `(${totalHints})`}
                </TabsTrigger>
                {activeResult && (
                  <TabsTrigger
                    value={QuestionTab.Feedback}
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-semibold gap-2 text-primary"
                  >
                    <Sparkles className="h-4 w-4" />{" "}
                    {MOCK_INTERVIEW_CONTENT.TAB_FEEDBACK}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4">
                  <TabsContent
                    value={QuestionTab.Description}
                    className="m-0 focus-visible:ring-0"
                  >
                    <QuestionDescriptionPanel
                      question={currentQuestion}
                      questionIndex={currentQuestionIndex}
                      qf={qf}
                      formattedSnippet={questionState.formattedSnippet}
                      isCodeTheQuestion={isCodeTheQuestion}
                      showReferenceSnippet={showReferenceSnippet}
                    />
                  </TabsContent>

                  <TabsContent
                    value={QuestionTab.Hints}
                    className="m-0 focus-visible:ring-0"
                  >
                    <HintsPanel
                      hints={currentQuestion.hints}
                      hintConfig={hintConfig}
                      revealedHints={questionState.revealedHints}
                      onRevealNext={() =>
                        dispatch({ type: QuestionActionType.RevealNextHint })
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value={QuestionTab.Feedback}
                    className="m-0 focus-visible:ring-0"
                  >
                    <div className="py-4 pb-12">
                      {activeResult && <FeedbackPanel result={activeResult} />}

                      {activeResult && (
                        <div className="mt-8 flex flex-col gap-4">
                          {currentQuestionIndex <
                          session.questions.length - 1 ? (
                            <Button
                              onClick={handleNextQuestion}
                              className="w-full h-12 dark:text-white"
                              size="lg"
                            >
                              {MOCK_INTERVIEW_CONTENT.GO_TO_NEXT_QUESTION}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => router.push(ROUTES.DASHBOARD)}
                              variant="outline"
                              className="w-full h-12"
                              size="lg"
                            >
                              {MOCK_INTERVIEW_CONTENT.FINISH_SESSION}
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

        <CodeEditorPanel
          questionState={questionState}
          dispatch={dispatch}
          qf={qf}
          showLanguageSelector={showLanguageSelector}
          isCodePanelCollapsed={isCodePanelCollapsed}
          onToggleCollapse={() =>
            setIsCodePanelCollapsed(!isCodePanelCollapsed)
          }
          onSubmit={handleSubmit}
          isSubmitting={submitSolution.isPending}
        />

        {/* Vertical Tab Handle (when collapsed) */}
        {isCodePanelCollapsed && (
          <button
            onClick={() => setIsCodePanelCollapsed(false)}
            className="absolute right-0 top-0 h-full w-12 bg-muted/30 hover:bg-muted/50 border-l border-border flex items-center justify-center transition-colors group"
          >
            <div className="flex flex-col items-center gap-2">
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div
                className="writing-mode-vertical text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors"
                style={{ writingMode: "vertical-rl" }}
              >
                {MOCK_INTERVIEW_CONTENT.EDITOR_COLLAPSED_LABEL}
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
