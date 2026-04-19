'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CodeEditor } from '@/components/CodeEditor';
import { QuestionCard } from '@/components/QuestionCard';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { MockSessionSkeleton } from '@/components/skeletons/MockSessionSkeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockSession, useSubmitSolution } from '@/hooks/useMock';
import { Question, MockResult, ProgrammingLanguage, AnswerFormat, QuestionFormat, QuestionType } from '@/types';
import { Bug, Clock, Send, ShieldAlert, Sparkles, Terminal, Lightbulb, Loader2, Code2, ChevronLeft, ChevronRight, AlertTriangle, Timer } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CareerSpireLogo } from '@/components/CareerSpireLogo';
import { constants } from '@/lib/utils/constants';
import { formatCodeAsync } from '@/lib/utils/formatCode';

// Strip sections from description based on question format
const filterDescriptionByFormat = (text: string, format: QuestionFormat): string => {
  if (!text) return '';

  // Protect fenced code blocks from section removal
  const codeBlocks: string[] = [];
  let filtered = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CB_${codeBlocks.length - 1}__`;
  });

  // Helper: remove from Examples heading to Constraints heading (or end of text)
  const stripExamples = (t: string) => t
    .replace(/(?:^|\n)(?:#+\s*)?Examples?[\s\S]*?(?=\n(?:#+\s*)?Constraints?:)/gim, '\n')
    .replace(/(?:^|\n)(?:#+\s*)?Examples?[\s\S]*/gim, '\n'); // fallback if no Constraints follows
  const stripConstraints = (t: string) => t
    .replace(/(?:^|\n)(?:#+\s*)?Constraints?:[\s\S]*/gim, '\n');

  switch (format) {
    case QuestionFormat.OUTPUT_PREDICTION:
      // Remove Examples (they contain the answer) and Constraints (irrelevant)
      filtered = stripConstraints(stripExamples(filtered));
      break;

    case QuestionFormat.DEBUGGING:
      // Remove Examples (correct I/O hints at the bug), keep Constraints
      filtered = stripExamples(filtered);
      break;

    case QuestionFormat.CODE_WRITING:
      // Remove rigid I/O examples, keep Constraints/Requirements
      filtered = stripExamples(filtered);
      break;

    case QuestionFormat.THEORY:
      // Remove Examples and Constraints
      filtered = stripConstraints(stripExamples(filtered));
      break;

    // DSA and MCQ: keep everything (LeetCode-style)
    default:
      break;
  }

  // Restore code blocks
  filtered = filtered.replace(/__CB_(\d+)__/g, (_, idx) => codeBlocks[Number(idx)]);

  return filtered;
};

// Format markdown headings and labels for display
const formatDescription = (text: string) => {
  if (!text) return '';

  // Protect code blocks and inline spans
  const preserved: string[] = [];
  let cleanText = text
    .replace(/```[\s\S]*?```/g, (match) => {
      preserved.push(match);
      return `\n\n__PRESERVED_${preserved.length - 1}__\n\n`;
    })
    .replace(/`[^`\n]+`/g, (match) => {
      preserved.push(match);
      return `__PRESERVED_${preserved.length - 1}__`;
    });

  cleanText = cleanText
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/###\s*###/g, '###');

  cleanText = cleanText
    .replace(/(?:^|\n)(?:#+\s*)?(Examples)\s*(?:\n|$)/gi, '\n\n### $1\n\n')
    .replace(/(?:^|\n)(?:#+\s*)?(Example \d+:|Example:)/gi, '\n\n### $1')
    .replace(/(?:^|\n)-?\s*(?:\*\*|)?(Input:|Output:|Explanation:)(?:\*\*|)?/gi, '\n\n**$1**')
    .replace(/(?:^|\n)(?:#+\s*)?(Constraints:)/gi, '\n\n### $1')
    .replace(/\n{3,}/g, '\n\n');

  cleanText = cleanText.replace(/__PRESERVED_(\d+)__/g, (_, idx) => preserved[Number(idx)]);

  return cleanText.trim();
};


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
        router.push('/dashboard');
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

  // Format-specific hint configuration
  const hintConfig = (() => {
    switch (qf) {
      case QuestionFormat.OUTPUT_PREDICTION:
        return { label: 'Think About', icon: Lightbulb, progressive: true, emptyMessage: 'No thinking prompts available.' };
      case QuestionFormat.DEBUGGING:
        return { label: 'Where to Look', icon: Bug, progressive: true, emptyMessage: 'No debugging hints available.' };
      case QuestionFormat.CODE_WRITING:
        return { label: 'Follow-ups', icon: Lightbulb, progressive: false, emptyMessage: 'No follow-up questions available.' };
      case QuestionFormat.THEORY:
        return { label: 'Key Concepts', icon: Lightbulb, progressive: false, emptyMessage: 'No key concepts available.' };
      default:
        return { label: 'Hints', icon: Lightbulb, progressive: true, emptyMessage: 'No hints available for this question.' };
    }
  })();
  const totalHints = currentQuestion.hints?.length || 0;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-muted/30">
        <div className="flex items-center gap-6">
          <CareerSpireLogo size="sm" />

          <div className="h-6 w-px bg-border mx-2" />

          {/* Question Navigation */}
          <nav className="flex items-center gap-2">
            {session.questions.map((q, idx) => {
              const result = session.results?.find(r => r.questionId === q.id);
              const isCompleted = !!result || (idx === currentQuestionIndex && !!submittedResult);
              return (
                <button
                  key={q.id}
                  onClick={() => handleQuestionSelect(idx)}
                  className={cn(
                    "w-12 h-8 px-2 rounded-md flex items-center justify-center text-xs font-semibold transition-all border",
                    idx === currentQuestionIndex
                      ? "bg-primary text-primary-foreground border-primary dark:text-white"
                      : isCompleted
                        ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  Q. {idx + 1}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Per-question time: elapsed / expected */}
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md border transition-colors",
            questionOvertime
              ? "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/20"
              : "text-muted-foreground bg-muted/50 border-border/50"
          )}>
            <Timer className="h-3 w-3" />
            <span>{Math.floor(questionTimeSpent / 60)}:{(questionTimeSpent % 60).toString().padStart(2, '0')}</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground/70">{currentQuestionExpected / 60}m</span>
          </div>

          {/* Session countdown timer */}
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1 rounded-full transition-colors",
            sessionTimeRemaining > totalSessionSeconds * 0.25
              ? "text-foreground bg-muted"
              : sessionTimeRemaining > totalSessionSeconds * 0.1
                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                : "text-red-600 dark:text-red-400 bg-red-500/10 animate-pulse"
          )}>
            <Clock className="h-3.5 w-3.5" />
            {sessionTimeRemaining >= 0 ? (
              <span>{Math.floor(sessionTimeRemaining / 60)}:{(sessionTimeRemaining % 60).toString().padStart(2, '0')}</span>
            ) : (
              <span className="text-red-500">+{Math.floor(Math.abs(sessionTimeRemaining) / 60)}:{(Math.abs(sessionTimeRemaining) % 60).toString().padStart(2, '0')}</span>
            )}
          </div>

          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="hover:bg-red-500/10 hover:text-red-500 transition-colors">
            Exit Session
          </Button>
        </div>
      </header>

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
                    <div className="space-y-6 pb-12">
                      <div className="flex flex-col justify-start space-y-3">
                        <h2 className={cn(dmSans.className, "text-2xl font-bold")}>{currentQuestionIndex + 1}. {currentQuestion.title}</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize">{currentQuestion.difficulty.toLowerCase()}</Badge>
                          <Badge variant="secondary" className="bg-primary/5 text-primary">{currentQuestion.topic}</Badge>
                          {qf === QuestionFormat.OUTPUT_PREDICTION && (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Predict Output</Badge>
                          )}
                          {qf === QuestionFormat.DEBUGGING && (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">Find the Bug</Badge>
                          )}
                          {qf === QuestionFormat.THEORY && (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Theory</Badge>
                          )}
                          {qf === QuestionFormat.CODE_WRITING && (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Implementation</Badge>
                          )}
                          {qf === QuestionFormat.DSA && (
                            <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">DSA</Badge>
                          )}
                        </div>
                      </div>

                      {/* Inline code for OUTPUT_PREDICTION / DEBUGGING — code IS the question */}
                      {isCodeTheQuestion && currentQuestion.codeSnippet && formattedSnippet && (
                        <div className="space-y-3">
                          <div className={cn(
                            "flex items-start gap-3 p-3 rounded-lg text-sm",
                            qf === QuestionFormat.OUTPUT_PREDICTION
                              ? "bg-amber-500/5 border border-amber-500/10 text-amber-700 dark:text-amber-300"
                              : "bg-red-500/5 border border-red-500/10 text-red-700 dark:text-red-300"
                          )}>
                            {qf === QuestionFormat.OUTPUT_PREDICTION ? (
                              <p>Carefully read the code below. What will be printed to the console when executed? Explain your reasoning.</p>
                            ) : (
                              <p>The code below has a bug. Identify the issue and submit your corrected version in the editor.</p>
                            )}
                          </div>
                          <div className="w-full overflow-hidden rounded-lg">
                            <CodeEditor
                              value={formattedSnippet}
                              language={currentQuestion.language?.toLowerCase() || 'javascript'}
                              readOnly
                              height={`${Math.max(120, (formattedSnippet.split('\n').length + 2) * 22)}px`}
                              onChange={() => { }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Implementation instruction for CODE_WRITING */}
                      {qf === QuestionFormat.CODE_WRITING && (
                        <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <p>Implement the solution in the code editor. Focus on clean, working code that meets the requirements described above.</p>
                        </div>
                      )}

                      <div className="prose dark:prose-invert max-w-none
                        prose-h3:text-lg prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-foreground/80 prose-p:leading-relaxed
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-ul:list-disc prose-ul:pl-6 prose-li:text-foreground/80
                        prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:rounded-xl">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="whitespace-pre-wrap mb-4" {...props} />,
                            h3: ({ node, ...props }) => {
                              const text = String(props.children);
                              const isExample = /^Example\s*\d*/i.test(text);
                              const isExamplesHeader = /^Examples$/i.test(text);
                              return (
                                <h3
                                  className={cn(
                                    "text-lg font-bold mb-4 text-foreground border-b border-border pb-2 flex items-center gap-2",
                                    isExample && !isExamplesHeader ? "mt-8 pt-6 border-t border-t-border" : "mt-10"
                                  )}
                                  {...props}
                                />
                              );
                            },
                            strong: ({ node, ...props }) => {
                              const isLabel = /^(Input:|Output:|Explanation:)$/.test(String(props.children));
                              return isLabel ? (
                                <span className="block mt-4 mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground" {...props} />
                              ) : (
                                <strong className="font-bold text-foreground" {...props} />
                              );
                            },
                            pre: ({ node, ...props }) => (
                              <pre className="bg-muted/50 border border-border rounded-xl p-4 overflow-x-auto my-4" {...props} />
                            ),
                            code: ({ node, className: codeClassName, children, ...props }) => {
                              const isBlock = /language-/.test(codeClassName || '') || (typeof children === 'string' && children.includes('\n'));
                              return isBlock ? (
                                <code className={cn("font-mono text-sm text-foreground whitespace-pre", codeClassName)} {...props}>{children}</code>
                              ) : (
                                <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-primary" {...props}>{children}</code>
                              );
                            },
                          }}
                        >
                          {formatDescription(filterDescriptionByFormat(currentQuestion.description, qf))}
                        </ReactMarkdown>
                      </div>

                      {showReferenceSnippet && (
                        <div className="mt-8 space-y-3 pt-6 border-t overflow-hidden">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Terminal className="h-4 w-4" />
                            Reference Code Snippet
                          </div>
                          <div className="w-full overflow-hidden rounded-lg">
                            <CodeEditor
                              value={formattedSnippet}
                              language={currentQuestion.language?.toLowerCase() || 'javascript'}
                              readOnly
                              height={`${Math.max(100, (formattedSnippet.split('\n').length + 2) * 22)}px`}
                              onChange={() => { }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="hints" className="m-0 focus-visible:ring-0">
                    <div className="space-y-4 py-4">
                      {totalHints > 0 ? (
                        <>
                          {currentQuestion.hints.map((hint, i) => {
                            const isRevealed = !hintConfig.progressive || i < revealedHints;
                            const isNext = hintConfig.progressive && i === revealedHints;

                            if (!isRevealed && !isNext) {
                              // Locked hint — show as dim placeholder
                              return (
                                <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50 flex gap-4 opacity-40">
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 font-bold text-muted-foreground">
                                    {i + 1}
                                  </div>
                                  <p className="text-sm leading-relaxed text-muted-foreground italic">Locked — reveal previous hints first</p>
                                </div>
                              );
                            }

                            if (isNext && !isRevealed) {
                              // Next hint — reveal button
                              return (
                                <button
                                  key={i}
                                  onClick={() => setRevealedHints(prev => prev + 1)}
                                  className="w-full p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 flex gap-4 items-center transition-colors text-left cursor-pointer"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                                    {i + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-primary">Click to reveal {hintConfig.label.toLowerCase()} {i + 1}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Try solving it yourself first</p>
                                  </div>
                                  <ShieldAlert className="h-4 w-4 text-primary/50" />
                                </button>
                              );
                            }

                            // Revealed hint
                            return (
                              <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                                  {i + 1}
                                </div>
                                <p className="text-sm leading-relaxed">{hint}</p>
                              </div>
                            );
                          })}

                          {hintConfig.progressive && revealedHints < totalHints && (
                            <p className="text-center text-xs text-muted-foreground pt-2">
                              {revealedHints}/{totalHints} revealed — try to solve with fewer hints for better practice
                            </p>
                          )}

                          {hintConfig.progressive && revealedHints === totalHints && totalHints > 0 && (
                            <p className="text-center text-xs text-muted-foreground pt-2">
                              All {hintConfig.label.toLowerCase()} revealed
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-center text-muted-foreground py-12">{hintConfig.emptyMessage}</p>
                      )}
                    </div>
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
                            <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full h-12" size="lg">
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

      {/* Time's up warning overlay */}
      {showTimeWarning && !sessionFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-background border border-red-500/20 rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className={cn(dmSans.className, "text-xl font-bold")}>Time&apos;s Up!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your session time has ended. You have a <span className="font-semibold text-foreground">2-minute grace period</span> to finish your current answer and submit.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowTimeWarning(false);
                  setSessionFinished(true);
                  router.push('/dashboard');
                }}
              >
                End Now
              </Button>
              <Button
                className="flex-1 dark:text-white"
                onClick={() => setShowTimeWarning(false)}
              >
                Use Grace Period
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
