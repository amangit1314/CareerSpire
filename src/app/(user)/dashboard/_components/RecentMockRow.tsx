import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { RECENT_MOCK_ROW_CONTENT } from "@/config/content";

type RecentMock = {
  id: string;
  score: number;
  questions: number;
  date: Date;
};

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      ring: "ring-success/30",
      bg: "bg-success/10",
      text: "text-success",
      label: RECENT_MOCK_ROW_CONTENT.SCORE_EXCELLENT,
    };
  }
  if (score >= 60) {
    return {
      ring: "ring-warning/30",
      bg: "bg-warning/10",
      text: "text-warning",
      label: RECENT_MOCK_ROW_CONTENT.SCORE_GOOD,
    };
  }
  return {
    ring: "ring-destructive/30",
    bg: "bg-destructive/10",
    text: "text-destructive",
    label: RECENT_MOCK_ROW_CONTENT.SCORE_NEEDS_WORK,
  };
}

export function RecentMockRow({ mock }: { mock: RecentMock }) {
  const tone = getScoreTone(mock.score);

  return (
    <Link
      href={`/mock/${mock.id}`}
      aria-label={RECENT_MOCK_ROW_CONTENT.VIEW_DETAILS_ARIA(mock.score)}
      className={cn(
        "group relative flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl cursor-pointer",
        "transition-all duration-200",
        "hover:bg-primary hover:shadow-md hover:shadow-primary/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Score chip — at rest: tinted; on hover: clean white surface keeps the tone-colored
          number high-contrast against the blue background without color clash */}
      <div
        className={cn(
          "shrink-0 h-12 w-14 sm:h-14 sm:w-16 rounded-xl flex items-center justify-center ring-1 transition-colors",
          tone.bg,
          tone.ring,
          "group-hover:bg-white group-hover:ring-white/40",
        )}
      >
        <span
          className={cn(
            dmSans.className,
            "text-base sm:text-lg font-bold leading-none tabular-nums transition-colors",
            tone.text,
          )}
        >
          {mock.score}%
        </span>
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={cn(
              dmSans.className,
              "font-semibold text-sm sm:text-base text-foreground transition-colors",
              "group-hover:text-white",
            )}
          >
            {RECENT_MOCK_ROW_CONTENT.LABEL}
          </p>
          {/* Status pill — secondary visual weight on hover so the chip stays the anchor */}
          <span
            className={cn(
              "text-[0.625rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold whitespace-nowrap transition-colors",
              tone.bg,
              tone.text,
              "group-hover:bg-white/20 group-hover:text-white",
            )}
          >
            {tone.label}
          </span>
        </div>
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1 transition-colors",
            "group-hover:text-white/80",
          )}
        >
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {mock.questions} question{mock.questions !== 1 ? "s" : ""} ·{" "}
            {formatDate(mock.date)}
          </span>
        </p>
      </div>

      {/* CTA */}
      <div
        className={cn(
          "hidden sm:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all",
          "group-hover:text-white group-hover:translate-x-0.5",
        )}
      >
        {RECENT_MOCK_ROW_CONTENT.VIEW_DETAILS}
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
      <ChevronRight
        className={cn(
          "sm:hidden h-5 w-5 text-muted-foreground transition-all",
          "group-hover:text-white group-hover:translate-x-0.5",
        )}
      />
    </Link>
  );
}
