"use client";

import { useEffect, useState } from "react";
import type { SubmissionSummary } from "@/app/actions/practice.actions";
import { getSubmissionHistory } from "@/app/actions/practice.actions";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Verdict } from "@/types/enums";
import { SUBMISSIONS_TAB_CONTENT } from "@/config/content";

function verdictTone(v: string): {
  icon: typeof CheckCircle2;
  color: string;
  label: string;
} {
  switch (v) {
    case Verdict.ACCEPTED:
      return {
        icon: CheckCircle2,
        color: "text-success",
        label: SUBMISSIONS_TAB_CONTENT.VERDICT_ACCEPTED,
      };
    case Verdict.TIME_LIMIT_EXCEEDED:
      return {
        icon: Clock,
        color: "text-warning",
        label: SUBMISSIONS_TAB_CONTENT.VERDICT_TIME_LIMIT,
      };
    case Verdict.COMPILE_ERROR:
      return {
        icon: AlertTriangle,
        color: "text-destructive",
        label: SUBMISSIONS_TAB_CONTENT.VERDICT_COMPILE_ERROR,
      };
    case Verdict.RUNTIME_ERROR:
      return {
        icon: AlertTriangle,
        color: "text-destructive",
        label: SUBMISSIONS_TAB_CONTENT.VERDICT_RUNTIME_ERROR,
      };
    default:
      return {
        icon: XCircle,
        color: "text-destructive",
        label: SUBMISSIONS_TAB_CONTENT.VERDICT_WRONG_ANSWER,
      };
  }
}

function formatRelative(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (m < 1) return SUBMISSIONS_TAB_CONTENT.TIME_JUST_NOW;
  if (m < 60) return SUBMISSIONS_TAB_CONTENT.TIME_MINUTES_AGO(m);
  if (h < 24) return SUBMISSIONS_TAB_CONTENT.TIME_HOURS_AGO(h);
  if (days < 7) return SUBMISSIONS_TAB_CONTENT.TIME_DAYS_AGO(days);
  return SUBMISSIONS_TAB_CONTENT.TIME_WEEKS_AGO(Math.floor(days / 7));
}

export function SubmissionsTab({
  questionId,
  refreshKey,
}: {
  questionId: string;
  refreshKey: number;
}) {
  const [subs, setSubs] = useState<SubmissionSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Standard loading-flag pattern: null here means "loading", the
    // real value lands in .then() below, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubs(null);
    getSubmissionHistory(questionId).then((s) => {
      if (!cancelled) setSubs(s);
    });
    return () => {
      cancelled = true;
    };
  }, [questionId, refreshKey]);

  if (subs === null) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
        <Loader2 className="h-3 w-3 animate-spin" />
        {SUBMISSIONS_TAB_CONTENT.LOADING}
      </div>
    );
  }

  if (subs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-xs text-muted-foreground">
          {SUBMISSIONS_TAB_CONTENT.EMPTY}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
      {subs.map((s) => {
        const tone = verdictTone(s.verdict);
        const Icon = tone.icon;
        return (
          <li
            key={s.id}
            className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors"
          >
            <Icon className={cn("h-4 w-4 shrink-0", tone.color)} />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  dmSans.className,
                  "text-sm font-semibold truncate",
                  tone.color,
                )}
              >
                {tone.label}
              </p>
              <p className="text-[0.6875rem] text-muted-foreground">
                {s.testsPassed}/{s.testsTotal} passed · {s.language} ·{" "}
                {formatRelative(s.submittedAt)}
              </p>
            </div>
            {s.runtimeMs !== null && (
              <span className="text-[0.6875rem] text-muted-foreground tabular-nums shrink-0">
                {s.runtimeMs}ms
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
