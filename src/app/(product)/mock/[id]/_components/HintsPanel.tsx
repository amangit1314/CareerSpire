import { ShieldAlert } from 'lucide-react';
import type { HintConfig } from '../hintConfig';

interface HintsPanelProps {
  hints: string[];
  hintConfig: HintConfig;
  revealedHints: number;
  onRevealNext: () => void;
}

export function HintsPanel({ hints, hintConfig, revealedHints, onRevealNext }: HintsPanelProps) {
  const totalHints = hints.length;

  if (totalHints === 0) {
    return (
      <div className="space-y-4 py-4">
        <p className="text-center text-muted-foreground py-12">{hintConfig.emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {hints.map((hint, i) => {
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
              onClick={onRevealNext}
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
    </div>
  );
}
