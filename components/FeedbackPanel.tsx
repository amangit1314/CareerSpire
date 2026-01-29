'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Code2, Lightbulb, Sparkles } from 'lucide-react';
import { MockResult } from '@/types';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import { useState } from 'react';
import { CodeEditor } from './CodeEditor';

interface FeedbackPanelProps {
  result: MockResult;
}

export function FeedbackPanel({ result }: FeedbackPanelProps) {
  const { feedback, testResults, score } = result;
  const [showFullCode, setShowFullCode] = useState(true);

  // Helper to format values for display (avoids extra quotes for stringified JSON)
  const formatValue = (val: any) => {
    if (val === null || val === undefined) return 'null';

    if (typeof val === 'string') {
      const trimmed = val.trim();

      // If it looks like a JSON array/object or multiple arguments (comma-separated), 
      // OR if it's already properly quoted, don't wrap in more quotes
      if (
        (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        trimmed.includes(',')
      ) {
        return trimmed;
      }

      // For simple strings, show with quotes as requested
      return `"${trimmed}"`;
    }

    // Numbers, booleans, objects, arrays
    return JSON.stringify(val);
  };

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", dmSans.className)}>
            <TrendingUp className="h-5 w-5 text-primary" />
            Overall Score: {score}/100
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Test Cases</p>
              <p className={cn("text-2xl font-bold", dmSans.className)}>
                {testResults.passed}/{testResults.total}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Code Quality</p>
              <p className={cn("text-2xl font-bold", dmSans.className)}>{feedback.codeQuality}/100</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Complexity</p>
              <p className={cn("text-lg font-semibold", dmSans.className)}>{feedback.timeComplexity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Approach Summary */}
      {feedback.approachSummary && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className={cn("text-lg flex items-center gap-2", dmSans.className)}>
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Insights: Optimal Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{feedback.approachSummary}</p>
            {feedback.isCodeCorrect !== undefined && (
              <div className={cn(
                "mt-3 px-3 py-2 rounded-lg text-sm font-medium",
                feedback.isCodeCorrect
                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              )}>
                {feedback.isCodeCorrect
                  ? "✓ Your code was correct! See annotated version below."
                  : "→ See the corrected code below with explanations."}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Corrected/Annotated Code */}
      {feedback.correctedCode && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-lg flex items-center gap-2", dmSans.className)}>
              <Code2 className="h-5 w-5 text-blue-500" />
              {feedback.isCodeCorrect ? 'Your Code (Annotated)' : 'Corrected Code'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={feedback.correctedCode.replace(/```[\w]*\n?|```/g, '').trim()}
              language="javascript"
              readOnly
              height="400px"
              onChange={() => { }}
            />
          </CardContent>
        </Card>
      )}

      {/* Line-by-Line Explanations */}
      {feedback.codeExplanation && feedback.codeExplanation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-lg flex items-center gap-2", dmSans.className)}>
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Step-by-Step Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.codeExplanation.map((exp, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">
                    Line {exp.lineRange}
                  </div>
                  <p className="text-sm flex-1">{exp.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg", dmSans.className)}>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testResults.details && testResults.details.length > 0 ? (
              testResults.details.map((test, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    test.passed
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  )}
                >
                  {test.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-mono">
                      Input: {formatValue(test.input)}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-muted-foreground">
                        Expected: <span className="font-mono text-foreground/80">{formatValue(test.expected)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Got: <span className={cn("font-mono", test.passed ? "text-green-500" : "text-red-500")}>
                          {formatValue(test.actual)}
                        </span>
                      </p>
                      {test.error && (
                        <p className="text-xs text-red-400 mt-1 italic">
                          Error: {test.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No test cases available for this question
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-lg flex items-center gap-2", dmSans.className)}>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-lg flex items-center gap-2", dmSans.className)}>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Question Recommendation */}
      {feedback.nextQuestion && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">
              Recommended Next Practice:
            </p>
            <p className={cn("font-semibold", dmSans.className)}>{feedback.nextQuestion}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
