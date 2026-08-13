import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

interface TimeUpOverlayProps {
  show: boolean;
  onEndNow: () => void;
  onUseGracePeriod: () => void;
}

export function TimeUpOverlay({ show, onEndNow, onUseGracePeriod }: TimeUpOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background border border-red-500/20 rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className={cn(dmSans.className, "text-xl font-bold")}>Time&apos;s Up!</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your session time has ended. You have a <span className="font-semibold text-foreground">2-minute grace period</span> to finish your current answer and submit.
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onEndNow}>
            End Now
          </Button>
          <Button className="flex-1 dark:text-white" onClick={onUseGracePeriod}>
            Use Grace Period
          </Button>
        </div>
      </div>
    </div>
  );
}
