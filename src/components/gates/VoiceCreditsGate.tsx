'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import { VOICE_PACKS, formatPrice } from '@/lib/pricing';
import { useState } from 'react';

interface VoiceCreditsGateProps {
  open: boolean;
  onClose: () => void;
  onPurchase: (itemId: string, amount: number, description: string) => Promise<void>;
}

export function VoiceCreditsGate({ open, onClose, onPurchase }: VoiceCreditsGateProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleBuy = async (id: string, amount: number, desc: string) => {
    setProcessing(id);
    try {
      await onPurchase(id, amount, desc);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Mic className="h-5 w-5 text-primary" />
            <DialogTitle className={cn(dmSans.className, 'text-xl')}>
              Get Voice Interview Sessions
            </DialogTitle>
          </div>
          <DialogDescription>
            Voice interviews are purchased separately and are not included in any
            plan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {VOICE_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                'border rounded-lg p-4 flex flex-col justify-between hover:shadow-sm transition relative',
                pack.badge && 'border-primary'
              )}
            >
              {pack.badge && (
                <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                  {pack.badge}
                </span>
              )}
              <div>
                <p className="font-semibold">{pack.label}</p>
                <p className={cn(dmSans.className, 'text-2xl font-bold mt-1')}>
                  {formatPrice(pack.price)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pack.sessions} voice session
                  {pack.sessions > 1 ? 's' : ''}
                </p>
              </div>
              <Button
                size="sm"
                className="w-full mt-3 cursor-pointer"
                disabled={processing === pack.id}
                onClick={() =>
                  handleBuy(
                    pack.id,
                    pack.price,
                    `${pack.label} Voice Pack`
                  )
                }
              >
                {processing === pack.id && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Buy
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-2">
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
