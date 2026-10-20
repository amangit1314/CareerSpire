"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { dmSans } from "@/lib/fonts";
import { ADDON_LEARNING_PATH_PRICE } from "@/lib/pricing";
import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { LEARNING_PATH_GATE_CONTENT } from "@/config/content";

interface LearningPathGateProps {
  open: boolean;
  onClose: () => void;
  onPurchase: (
    itemId: string,
    amount: number,
    description: string,
  ) => Promise<void>;
}

export function LearningPathGate({
  open,
  onClose,
  onPurchase,
}: LearningPathGateProps) {
  const [processing, setProcessing] = useState(false);

  const handleBuy = async () => {
    setProcessing(true);
    try {
      await onPurchase(
        "addon_learning_path",
        ADDON_LEARNING_PATH_PRICE,
        "Extra Learning Path",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-primary" />
            <DialogTitle className={cn(dmSans.className, "text-xl")}>
              {LEARNING_PATH_GATE_CONTENT.TITLE}
            </DialogTitle>
          </div>
          <DialogDescription>
            {LEARNING_PATH_GATE_CONTENT.DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            className="w-full cursor-pointer"
            disabled={processing}
            onClick={handleBuy}
          >
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {LEARNING_PATH_GATE_CONTENT.BUY_PREFIX}{" "}
            {formatPrice(ADDON_LEARNING_PATH_PRICE)}
          </Button>

          <Button asChild variant="outline" className="w-full cursor-pointer">
            <Link href={ROUTES.PRICING}>
              {LEARNING_PATH_GATE_CONTENT.UPGRADE_PLAN}
            </Link>
          </Button>
        </div>

        <div className="text-center mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground cursor-pointer"
            onClick={onClose}
          >
            {LEARNING_PATH_GATE_CONTENT.MAYBE_LATER}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
