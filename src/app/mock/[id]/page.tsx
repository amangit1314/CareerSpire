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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockSession, useSubmitSolution } from '@/hooks/useMock';
import { Question, MockResult, ProgrammingLanguage, AnswerFormat, QuestionFormat } from '@/types';
import { Bug, Clock, Send, ShieldAlert, Sparkles, Terminal, Lightbulb, Loader2, Code2, ChevronLeft, ChevronRight } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ThemeToggle } from '@/components/ThemeToggle';

// Helper to format the description to be more LeetCode-like
const formatDescription = (text: string) => {
  if (!text) return '';

  // First, clean up potentially messed up doubled markers if they exist
  let cleanText = text
    .replace(/\*\*\s*\*\*/g, '') // Remove empty bold markers
    .replace(/###\s*###/g, '###'); // Remove double headers

  return cleanText
    // Ensure "Example X:" is a heading (handle existing headers)
    .replace(/(?:^|\n)(?:#+\s*)?(Example \d+:|Example:)/gi, '\n\n### $1')
    // Ensure "Input:", "Output:", "Explanation:" are on new lines and bolded (handle existing stars)
    .replace(/(?:^|\n)(?:\*\*|)?(Input:|Output:|Explanation:)(?:\*\*|)?/gi, '\n**$1**')
    // Ensure "Constraints:" is a heading
    .replace(/(?:^|\n)(?:#+\s*)?(Constraints:)/gi, '\n\n### $1')
    .trim();
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
  const [timeSpent, setTimeSpent] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<MockResult | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [editorType, setEditorType] = useState<'code' | 'text'>('code');
  const [isCodePanelCollapsed, setIsCodePanelCollapsed] = useState(false);

  useEffect(() => {
    if (session?.questions && session.questions.length > 0) {
      const currentQuestion = session.questions[currentQuestionIndex];
      const lang = currentQuestion.language?.toLowerCase() || 'javascript';
      setSelectedLanguage(lang);

      const isPython = lang === 'python';
      const defaultCode = isPython ? '# Write your solution here\n' : '// Write your solution here\n';
      setCode(currentQuestion.starterCode || defaultCode);
      setTimeSpent(0);
      setSubmittedResult(null);
      setActiveTab('description');

      // Initialize editor type based on expected answer format
      if (currentQuestion.expectedAnswerFormat === AnswerFormat.CODE_SNIPPET) {
        setEditorType('code');
      } else {
        setEditorType('text'); // Default to text for REASONING or null
      }
    }
  }, [currentQuestionIndex]); // Only reset when question index changes, not when session refetches

  // Auto-collapse code panel when viewing feedback
  useEffect(() => {
    if (activeTab === 'feedback') {
      setIsCodePanelCollapsed(true);
    } else {
      setIsCodePanelCollapsed(false);
    }
  }, [activeTab]);

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
        language: selectedLanguage.toUpperCase(),
        timeSpent,
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

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-muted/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className={cn(dmSans.className, "font-bold text-lg")}>Mocky AI</h1>
          </div>
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>

          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
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
                  <Lightbulb className="h-4 w-4" /> Hints {currentQuestion.hints && currentQuestion.hints.length > 0 && `(${currentQuestion.hints.length})`}
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{currentQuestion.difficulty.toLowerCase()}</Badge>
                          <Badge variant="secondary" className="bg-primary/5 text-primary">{currentQuestion.topic}</Badge>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none 
                        prose-h3:text-lg prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4 
                        prose-p:text-slate-300 prose-p:leading-relaxed
                        prose-strong:text-slate-100 prose-strong:font-semibold
                        prose-ul:list-disc prose-ul:pl-6 prose-li:text-slate-300
                        prose-code:bg-slate-800 prose-code:text-slate-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-800 prose-pre:p-4 prose-pre:rounded-xl">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="whitespace-pre-wrap mb-4" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-8 mb-4 text-slate-100 border-b border-slate-800 pb-2 flex items-center gap-2" {...props} />,
                            strong: ({ node, ...props }) => {
                              const isLabel = /^(Input:|Output:|Explanation:)$/.test(String(props.children));
                              return isLabel ? (
                                <span className="block mt-4 mb-1 text-sm font-bold uppercase tracking-wider text-slate-400" {...props} />
                              ) : (
                                <strong className="font-bold text-slate-100" {...props} />
                              );
                            },
                            code: ({ node, ...props }) => (
                              <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-primary" {...props} />
                            ),
                          }}
                        >
                          {formatDescription(currentQuestion.description)}
                        </ReactMarkdown>
                      </div>

                      {currentQuestion.codeSnippet && (
                        <div className="mt-8 space-y-3 pt-6 border-t">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Terminal className="h-4 w-4" />
                            Reference Code Snippet
                          </div>
                          <CodeEditor
                            value={currentQuestion.codeSnippet}
                            language={currentQuestion.language?.toLowerCase() || 'javascript'}
                            readOnly
                            height="200px"
                            onChange={() => { }}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="hints" className="m-0 focus-visible:ring-0">
                    <div className="space-y-4 py-4">
                      {currentQuestion.hints && currentQuestion.hints.length > 0 ? (
                        currentQuestion.hints.map((hint, i) => (
                          <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                              {i + 1}
                            </div>
                            <p className="text-sm leading-relaxed">{hint}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-12">No hints available for this question.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="feedback" className="m-0 focus-visible:ring-0">
                    <div className="py-4 pb-12 mr-13">
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
          <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/5 shrink-0">
            <div className="flex items-center gap-4 text-xs font-semibold text-primary">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5" />
                Editor:
                <Select
                  value={editorType}
                  onValueChange={(value: 'code' | 'text') => setEditorType(value)}
                >
                  <SelectTrigger className="h-7 w-[110px] text-xs border-none bg-transparent focus:ring-0 px-2 hover:bg-muted/10">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">Code Editor</SelectItem>
                    <SelectItem value="text">Text Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editorType === 'code' && currentQuestion.type === 'DSA' && (
                <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                  Language:
                  <Select
                    value={selectedLanguage}
                    onValueChange={(value) => {
                      setSelectedLanguage(value);
                      // Update starter comment if code is empty or just the old comment
                      const isPython = value === 'python';
                      const oldComment = selectedLanguage === 'python' ? '# Write your solution here\n' : '// Write your solution here\n';
                      const newComment = isPython ? '# Write your solution here\n' : '// Write your solution here\n';
                      if (code === '' || code === oldComment) {
                        setCode(newComment);
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 w-[100px] text-xs border-none bg-transparent focus:ring-0 px-2 hover:bg-muted/10 font-bold uppercase">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JAVASCRIPT</SelectItem>
                      <SelectItem value="python">PYTHON</SelectItem>
                      <SelectItem value="java">JAVA</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    "Type your answer, explanation, or system design notes here..."
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
    </div>
  );
}
