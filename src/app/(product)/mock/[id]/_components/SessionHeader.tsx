import { Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CareerSpireLogo } from "@/components/CareerSpireLogo";
import { cn } from "@/lib/utils";
import type { MockResult } from "@/types";
import { SESSION_HEADER_CONTENT } from "@/config/content";

interface SessionQuestion {
  id: string;
}

interface SessionHeaderProps {
  questions: SessionQuestion[];
  results?: MockResult[];
  currentQuestionIndex: number;
  currentQuestionSubmitted: boolean;
  onSelectQuestion: (idx: number) => void;
  questionTimeSpent: number;
  currentQuestionExpected: number;
  questionOvertime: boolean;
  sessionTimeRemaining: number;
  totalSessionSeconds: number;
  onExit: () => void;
}

function formatClock(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  return `${Math.floor(abs / 60)}:${(abs % 60).toString().padStart(2, "0")}`;
}

export function SessionHeader({
  questions,
  results,
  currentQuestionIndex,
  currentQuestionSubmitted,
  onSelectQuestion,
  questionTimeSpent,
  currentQuestionExpected,
  questionOvertime,
  sessionTimeRemaining,
  totalSessionSeconds,
  onExit,
}: SessionHeaderProps) {
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-muted/30">
      <div className="flex items-center gap-6">
        <CareerSpireLogo size="sm" />

        <div className="h-6 w-px bg-border mx-2" />

        {/* Question Navigation */}
        <nav className="flex items-center gap-2">
          {questions.map((q, idx) => {
            const result = results?.find((r) => r.questionId === q.id);
            const isCompleted =
              !!result ||
              (idx === currentQuestionIndex && currentQuestionSubmitted);
            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(idx)}
                className={cn(
                  "w-12 h-8 px-2 rounded-md flex items-center justify-center text-xs font-semibold transition-all border",
                  idx === currentQuestionIndex
                    ? "bg-primary text-primary-foreground border-primary dark:text-white"
                    : isCompleted
                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50",
                )}
              >
                {SESSION_HEADER_CONTENT.QUESTION_NAV_LABEL(idx + 1)}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Per-question time: elapsed / expected */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md border transition-colors",
            questionOvertime
              ? "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/20"
              : "text-muted-foreground bg-muted/50 border-border/50",
          )}
        >
          <Timer className="h-3 w-3" />
          <span>
            {Math.floor(questionTimeSpent / 60)}:
            {(questionTimeSpent % 60).toString().padStart(2, "0")}
          </span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-muted-foreground/70">
            {currentQuestionExpected / 60}m
          </span>
        </div>

        {/* Session countdown timer */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1 rounded-full transition-colors",
            sessionTimeRemaining > totalSessionSeconds * 0.25
              ? "text-foreground bg-muted"
              : sessionTimeRemaining > totalSessionSeconds * 0.1
                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                : "text-red-600 dark:text-red-400 bg-red-500/10 animate-pulse",
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {sessionTimeRemaining >= 0 ? (
            <span>{formatClock(sessionTimeRemaining)}</span>
          ) : (
            <span className="text-red-500">
              +{formatClock(sessionTimeRemaining)}
            </span>
          )}
        </div>

        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          {SESSION_HEADER_CONTENT.EXIT_SESSION}
        </Button>
      </div>
    </header>
  );
}
