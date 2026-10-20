import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { TIME_UP_OVERLAY_CONTENT } from "@/config/content";

interface TimeUpOverlayProps {
  show: boolean;
  onEndNow: () => void;
  onUseGracePeriod: () => void;
}

export function TimeUpOverlay({
  show,
  onEndNow,
  onUseGracePeriod,
}: TimeUpOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background border border-red-500/20 rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className={cn(dmSans.className, "text-xl font-bold")}>
          {TIME_UP_OVERLAY_CONTENT.TITLE}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {TIME_UP_OVERLAY_CONTENT.DESCRIPTION_PREFIX}{" "}
          <span className="font-semibold text-foreground">
            {TIME_UP_OVERLAY_CONTENT.GRACE_PERIOD}
          </span>{" "}
          {TIME_UP_OVERLAY_CONTENT.DESCRIPTION_SUFFIX}
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onEndNow}>
            {TIME_UP_OVERLAY_CONTENT.END_NOW}
          </Button>
          <Button className="flex-1 dark:text-white" onClick={onUseGracePeriod}>
            {TIME_UP_OVERLAY_CONTENT.USE_GRACE_PERIOD}
          </Button>
        </div>
      </div>
    </div>
  );
}
