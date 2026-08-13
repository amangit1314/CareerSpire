import ReactMarkdown from 'react-markdown';
import { Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/CodeEditor';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { QuestionFormat, type Question } from '@/types';
import { filterDescriptionByFormat, formatDescription } from '../formatDescription';

interface QuestionDescriptionPanelProps {
  question: Question;
  questionIndex: number;
  qf: QuestionFormat;
  formattedSnippet: string;
  isCodeTheQuestion: boolean;
  showReferenceSnippet: boolean;
}

export function QuestionDescriptionPanel({
  question,
  questionIndex,
  qf,
  formattedSnippet,
  isCodeTheQuestion,
  showReferenceSnippet,
}: QuestionDescriptionPanelProps) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-start space-y-3">
        <h2 className={cn(dmSans.className, "text-2xl font-bold")}>{questionIndex + 1}. {question.title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">{question.difficulty.toLowerCase()}</Badge>
          <Badge variant="secondary" className="bg-primary/5 text-primary">{question.topic}</Badge>
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
      {isCodeTheQuestion && question.codeSnippet && formattedSnippet && (
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
              language={question.language?.toLowerCase() || 'javascript'}
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
          {formatDescription(filterDescriptionByFormat(question.description, qf))}
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
              language={question.language?.toLowerCase() || 'javascript'}
              readOnly
              height={`${Math.max(100, (formattedSnippet.split('\n').length + 2) * 22)}px`}
              onChange={() => { }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
