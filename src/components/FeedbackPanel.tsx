'use client';

import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Code2, Lightbulb, Sparkles, ChevronDown } from 'lucide-react';
import { MockResult, QuestionFormat } from '@/types';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { formatCodeAsync } from '@/lib/utils/formatCode';

interface FeedbackPanelProps {
  result: MockResult;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
  const bgColor = score >= 80 ? 'stroke-emerald-500/10' : score >= 50 ? 'stroke-amber-500/10' : 'stroke-red-500/10';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={bgColor} strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(dmSans.className, "text-lg font-bold", color)}>{score}</span>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  iconColor,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border/50 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", iconColor)} />
          <h3 className={cn(dmSans.className, "text-sm font-semibold")}>{title}</h3>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          open ? "rotate-0" : "-rotate-90"
        )} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

// Helper to format values for display
const formatValue = (val: unknown) => {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      trimmed.includes(',')
    ) return trimmed;
    return `"${trimmed}"`;
  }
  return JSON.stringify(val);
};

export function FeedbackPanel({ result }: FeedbackPanelProps) {
  const { feedback, testResults, score } = result;
  const [formattedCode, setFormattedCode] = useState<string>('');
  const questionFormat = result.question?.questionFormat;

  // Format corrected code on first render
  const rawCode = feedback.correctedCode?.replace(/```[\w]*\n?|```/g, '').trim() || '';

  // Detect if correctedCode is actual code vs plain text explanation
  const isActualCode = (() => {
    if (!rawCode) return false;
    const codeIndicators = [/\bfunction\b/, /\bconst\b/, /\blet\b/, /\bvar\b/, /\breturn\b/,
      /\bclass\b/, /\bimport\b/, /\bexport\b/, /=>/, /\{[\s\S]*\}/, /;\s*$/, /\bdef\b/, /\bif\s*\(/];
    const matches = codeIndicators.filter(r => r.test(rawCode)).length;
    return matches >= 2; // at least 2 code indicators = likely code
  })();

  if (isActualCode && rawCode && !formattedCode) {
    formatCodeAsync(rawCode, 'javascript').then(setFormattedCode);
    setFormattedCode(rawCode);
  }

  const hasTestCases = testResults.details && testResults.details.length > 0;
  const showCodeMetrics = questionFormat !== QuestionFormat.THEORY &&
    questionFormat !== QuestionFormat.OUTPUT_PREDICTION;
  const codeDisplayValue = isActualCode ? (formattedCode || rawCode) : '';
  const textExplanation = !isActualCode ? rawCode : '';
  const codeLineCount = codeDisplayValue ? codeDisplayValue.split('\n').length : 0;

  return (
    <div className="space-y-5">
      {/* Score Header */}
      <div className="flex items-center gap-5">
        <ScoreRing score={score} />
        <div className="flex-1 space-y-2">
          <h2 className={cn(dmSans.className, "text-lg font-bold")}>
            {score >= 80 ? 'Excellent work!' : score >= 50 ? 'Good effort' : 'Keep practicing'}
          </h2>
          <div className="flex gap-4">
            {hasTestCases && (
              <div>
                <p className="text-xs text-muted-foreground">Tests</p>
                <p className={cn(dmSans.className, "text-sm font-bold")}>
                  {testResults.passed}/{testResults.total}
                </p>
              </div>
            )}
            {showCodeMetrics && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Quality</p>
                  <p className={cn(dmSans.className, "text-sm font-bold")}>{feedback.codeQuality}/100</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Complexity</p>
                  <p className={cn(dmSans.className, "text-sm font-bold")}>{feedback.timeComplexity}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Approach Summary */}
      {feedback.approachSummary && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{feedback.approachSummary}</p>
          {feedback.isCodeCorrect !== undefined && (
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
              feedback.isCodeCorrect
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}>
              {feedback.isCodeCorrect ? (
                <><CheckCircle2 className="h-3 w-3" /> Correct solution</>
              ) : (
                <><AlertCircle className="h-3 w-3" /> {isActualCode ? 'See corrected code below' : 'See model answer below'}</>
              )}
            </div>
          )}
        </div>
      )}

      {/* Corrected/Annotated Code — only when it's actual code */}
      {codeDisplayValue && (
        <CollapsibleSection
          title={feedback.isCodeCorrect ? 'Your Code (Annotated)' : 'Corrected Code'}
          icon={Code2}
          iconColor="text-blue-500"
        >
          <div className="w-full overflow-hidden rounded-lg">
            <CodeEditor
              value={codeDisplayValue}
              language="javascript"
              readOnly
              height={`${Math.max(120, (codeLineCount + 2) * 22)}px`}
              onChange={() => { }}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Text explanation — when AI returned text instead of code */}
      {textExplanation && (
        <CollapsibleSection
          title="Model Answer"
          icon={Lightbulb}
          iconColor="text-blue-500"
        >
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{textExplanation}</p>
          </div>
        </CollapsibleSection>
      )}

      {/* Step-by-Step Breakdown */}
      {feedback.codeExplanation && feedback.codeExplanation.length > 0 && (
        <CollapsibleSection
          title="Step-by-Step Breakdown"
          icon={Lightbulb}
          iconColor="text-amber-500"
        >
          <div className="space-y-2">
            {feedback.codeExplanation.map((exp, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <span className="shrink-0 bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-mono">
                  L{exp.lineRange}
                </span>
                <p className="text-sm leading-relaxed">{exp.explanation}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Test Results */}
      {hasTestCases && (
        <CollapsibleSection
          title={`Test Results (${testResults.passed}/${testResults.total} passed)`}
          icon={testResults.passed === testResults.total ? CheckCircle2 : XCircle}
          iconColor={testResults.passed === testResults.total ? "text-emerald-500" : "text-red-500"}
        >
          <div className="space-y-2">
            {testResults.details.map((test, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg border text-sm",
                  test.passed
                    ? "bg-emerald-500/5 border-emerald-500/15"
                    : "bg-red-500/5 border-red-500/15"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {test.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className="font-mono text-xs text-muted-foreground">Test {idx + 1}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs font-mono pl-5">
                  <span className="text-muted-foreground">Input:</span>
                  <span>{formatValue(test.input)}</span>
                  <span className="text-muted-foreground">Expected:</span>
                  <span>{formatValue(test.expected)}</span>
                  <span className="text-muted-foreground">Got:</span>
                  <span className={test.passed ? "text-emerald-500" : "text-red-500"}>
                    {formatValue(test.actual)}
                  </span>
                </div>
                {test.error && (
                  <p className="text-xs text-red-400 mt-1.5 pl-5 italic">{test.error}</p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Strengths & Improvements side by side */}
      {(feedback.strengths.length > 0 || feedback.improvements.length > 0) && (
        <div className="border-t border-border/50 pt-4 grid grid-cols-1 gap-4">
          {feedback.strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h3 className={cn(dmSans.className, "text-sm font-semibold")}>Strengths</h3>
              </div>
              <ul className="space-y-1.5">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 mt-0.5 text-xs">+</span>
                    <span className="text-foreground/80">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.improvements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h3 className={cn(dmSans.className, "text-sm font-semibold")}>To Improve</h3>
              </div>
              <ul className="space-y-1.5">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5 text-xs">-</span>
                    <span className="text-foreground/80">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Next Question Recommendation */}
      {feedback.nextQuestion && (
        <div className="border-t border-border/50 pt-4">
          <p className="text-xs text-muted-foreground mb-1">Recommended Next</p>
          <p className={cn(dmSans.className, "text-sm font-semibold")}>{feedback.nextQuestion}</p>
        </div>
      )}
    </div>
  );
}
