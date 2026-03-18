'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import { ADDON_LEARNING_PATH_PRICE, formatPrice } from '@/lib/pricing';
import { useState } from 'react';
import Link from 'next/link';

interface LearningPathGateProps {
  open: boolean;
  onClose: () => void;
  onPurchase: (itemId: string, amount: number, description: string) => Promise<void>;
}

export function LearningPathGate({ open, onClose, onPurchase }: LearningPathGateProps) {
  const [processing, setProcessing] = useState(false);

  const handleBuy = async () => {
    setProcessing(true);
    try {
      await onPurchase(
        'addon_learning_path',
        ADDON_LEARNING_PATH_PRICE,
        'Extra Learning Path'
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
            <DialogTitle className={cn(dmSans.className, 'text-xl')}>
              No learning paths left
            </DialogTitle>
          </div>
          <DialogDescription>
            You&apos;ve used all your learning paths this month. Get more
            instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            className="w-full cursor-pointer"
            disabled={processing}
            onClick={handleBuy}
          >
            {processing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Buy extra path — {formatPrice(ADDON_LEARNING_PATH_PRICE)}
          </Button>

          <Button asChild variant="outline" className="w-full cursor-pointer">
            <Link href="/pricing">Upgrade your plan</Link>
          </Button>
        </div>

        <div className="text-center mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground cursor-pointer"
            onClick={onClose}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
