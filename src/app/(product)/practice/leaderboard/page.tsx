"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLeaderboard,
  LeaderboardScope,
  type LeaderboardEntry,
} from "@/app/actions/practice.actions";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Trophy, ArrowLeft, Flame, Loader2, Crown, Medal } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { LEADERBOARD_CONTENT } from "@/config/content";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>(
    LeaderboardScope.ALL_TIME,
  );
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Standard loading-flag pattern: null here means "loading", the
    // real value lands in .then() below, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(null);
    getLeaderboard(scope, 100).then((e) => {
      if (!cancelled) setEntries(e);
    });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <Link
          href={ROUTES.PRACTICE}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />{" "}
          {LEADERBOARD_CONTENT.BACK_TO_PRACTICE}
        </Link>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 sm:p-8">
          <div className="relative flex items-center gap-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-primary">
                {LEADERBOARD_CONTENT.EYEBROW}
              </span>
              <h1
                className={cn(
                  dmSans.className,
                  "text-2xl sm:text-3xl font-bold tracking-tight",
                )}
              >
                {LEADERBOARD_CONTENT.TITLE}
              </h1>
            </div>
          </div>
        </div>

        {/* Scope tabs */}
        <div className="flex items-center gap-1">
          {(
            [
              {
                v: LeaderboardScope.ALL_TIME,
                label: LEADERBOARD_CONTENT.SCOPE_ALL_TIME,
              },
              {
                v: LeaderboardScope.WEEKLY,
                label: LEADERBOARD_CONTENT.SCOPE_WEEKLY,
              },
            ] as { v: LeaderboardScope; label: string }[]
          ).map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => setScope(t.v)}
              className={cn(
                "text-xs font-semibold px-3 py-2 rounded-md transition-colors cursor-pointer",
                scope === t.v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {entries === null ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            {LEADERBOARD_CONTENT.LOADING}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className={cn(dmSans.className, "font-semibold mb-1")}>
              {LEADERBOARD_CONTENT.EMPTY_TITLE}
            </h3>
            <p className="text-xs text-muted-foreground">
              {LEADERBOARD_CONTENT.EMPTY_HINT}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-4 py-2.5 text-[0.6875rem] uppercase tracking-wider font-semibold text-muted-foreground border-b border-border bg-muted/30">
              <span>{LEADERBOARD_CONTENT.COL_RANK}</span>
              <span>{LEADERBOARD_CONTENT.COL_USER}</span>
              <span className="hidden sm:inline text-right">
                {scope === LeaderboardScope.WEEKLY
                  ? LEADERBOARD_CONTENT.COL_SOLVED_WEEK
                  : LEADERBOARD_CONTENT.COL_SOLVED_TOTAL}
              </span>
              <span className="text-right">
                {scope === LeaderboardScope.WEEKLY
                  ? LEADERBOARD_CONTENT.COL_STREAK
                  : LEADERBOARD_CONTENT.COL_XP}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {entries.map((e) => (
                <Row key={e.userId} entry={e} scope={scope} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  entry,
  scope,
}: {
  entry: LeaderboardEntry;
  scope: LeaderboardScope;
}) {
  return (
    <li
      className={cn(
        "grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-4 py-3 items-center",
        entry.isYou && "bg-primary/5",
      )}
    >
      <span
        className={cn(
          "text-sm font-bold tabular-nums inline-flex items-center gap-1",
          entry.rank === 1
            ? "text-warning"
            : entry.rank === 2
              ? "text-foreground/80"
              : entry.rank === 3
                ? "text-destructive/70"
                : "text-muted-foreground",
        )}
      >
        {entry.rank === 1 ? (
          <Crown className="h-3.5 w-3.5" />
        ) : entry.rank === 2 || entry.rank === 3 ? (
          <Medal className="h-3.5 w-3.5" />
        ) : null}
        #{entry.rank}
      </span>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar entry={entry} />
        <span
          className={cn(dmSans.className, "text-sm font-semibold truncate")}
        >
          {entry.name ?? LEADERBOARD_CONTENT.ANONYMOUS_NAME}
          {entry.isYou && (
            <span className="ml-1.5 text-[0.625rem] uppercase tracking-wider text-primary font-bold">
              {LEADERBOARD_CONTENT.YOU_BADGE}
            </span>
          )}
        </span>
      </div>
      <span className="hidden sm:inline text-sm text-right tabular-nums text-muted-foreground">
        {entry.problemsSolved}
      </span>
      <span className="text-right text-sm tabular-nums font-semibold inline-flex items-center gap-1 justify-end">
        {scope === LeaderboardScope.WEEKLY && entry.currentStreak > 0 ? (
          <>
            <Flame className="h-3 w-3 text-warning" />
            {entry.currentStreak}
          </>
        ) : scope === LeaderboardScope.ALL_TIME ? (
          <span className="text-primary">{entry.xp}</span>
        ) : (
          "—"
        )}
      </span>
    </li>
  );
}

function Avatar({ entry }: { entry: LeaderboardEntry }) {
  if (entry.image) {
    return (
      <div className="shrink-0 h-7 w-7 rounded-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.image} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  const initial = entry.name?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="shrink-0 h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
      {initial}
    </div>
  );
}
