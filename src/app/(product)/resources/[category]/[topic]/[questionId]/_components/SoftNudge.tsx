import { motion } from "framer-motion";
import { Target, Lightbulb, X } from "lucide-react";
import { SOFT_NUDGE_CONTENT } from "@/config/content";

// ---------------------------------------------------------------------------
// Soft Nudge — appears after ~15 user messages. Pedagogy, not limit.
// ---------------------------------------------------------------------------

export function SoftNudge({
  onTry,
  onHint,
  onDismiss,
}: {
  onTry: () => void;
  onHint: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 sm:px-5 pt-3 border-t border-primary/10"
    >
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-start gap-3">
        <div className="shrink-0 mt-0.5 p-1.5 rounded-md bg-primary/15">
          <Target className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground">
            {SOFT_NUDGE_CONTENT.TITLE}
          </p>
          <p className="text-[0.6875rem] sm:text-xs text-muted-foreground mt-0.5">
            {SOFT_NUDGE_CONTENT.DESCRIPTION}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onTry}
              className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Target className="h-3 w-3" />
              {SOFT_NUDGE_CONTENT.TAKE_A_SHOT}
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onHint}
              className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium px-2.5 py-1 rounded-full border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <Lightbulb className="h-3 w-3" />
              {SOFT_NUDGE_CONTENT.ONE_MORE_HINT}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={SOFT_NUDGE_CONTENT.DISMISS_ARIA}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
