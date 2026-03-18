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
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import { MOCK_PACKS, PLANS, formatPrice } from '@/lib/pricing';
import { useState } from 'react';

interface MockCreditsGateProps {
  open: boolean;
  onClose: () => void;
  onPurchase: (itemId: string, amount: number, description: string) => Promise<void>;
}

export function MockCreditsGate({ open, onClose, onPurchase }: MockCreditsGateProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleBuy = async (id: string, amount: number, desc: string) => {
    setProcessing(id);
    try {
      await onPurchase(id, amount, desc);
    } finally {
      setProcessing(null);
    }
  };

  const proPlan = PLANS[1]; // Pro
  const placementPlan = PLANS[2]; // Placement

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className={cn(dmSans.className, 'text-xl')}>
            You&apos;ve used all your mocks
          </DialogTitle>
          <DialogDescription>
            Choose an option to keep practicing
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {/* PAYG Option */}
          <div className="border rounded-lg p-4 space-y-3">
            <Badge variant="outline">Pay as you go</Badge>
            <p className="text-sm text-muted-foreground">Buy a mock pack</p>
            <div className="space-y-2">
              {MOCK_PACKS.map((pack) => (
                <Button
                  key={pack.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-between cursor-pointer"
                  disabled={processing === pack.id}
                  onClick={() =>
                    handleBuy(pack.id, pack.price, `${pack.label} Pack`)
                  }
                >
                  <span>{pack.label}</span>
                  <span className="font-semibold">
                    {processing === pack.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      formatPrice(pack.price)
                    )}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-primary rounded-lg p-4 space-y-3 relative">
            <Badge className="bg-primary">Most Popular</Badge>
            <p className={cn(dmSans.className, 'text-lg font-bold')}>
              {proPlan.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {proPlan.mockLabel} + {proPlan.learningPathsPerMonth} paths
            </p>
            <p className={cn(dmSans.className, 'text-2xl font-bold')}>
              {formatPrice(proPlan.monthlyPrice)}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <Button
              className="w-full cursor-pointer"
              disabled={processing === proPlan.id}
              onClick={() =>
                handleBuy(
                  proPlan.id,
                  proPlan.monthlyPrice,
                  `${proPlan.name} Plan`
                )
              }
            >
              {processing === proPlan.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upgrade to Pro
            </Button>
          </div>

          {/* Placement Plan */}
          <div className="border rounded-lg p-4 space-y-3">
            <Badge variant="secondary">Best Value</Badge>
            <p className={cn(dmSans.className, 'text-lg font-bold')}>
              {placementPlan.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {placementPlan.mockLabel} + {placementPlan.learningPathsPerMonth}{' '}
              paths
            </p>
            <p className={cn(dmSans.className, 'text-2xl font-bold')}>
              {formatPrice(placementPlan.monthlyPrice)}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              disabled={processing === placementPlan.id}
              onClick={() =>
                handleBuy(
                  placementPlan.id,
                  placementPlan.monthlyPrice,
                  `${placementPlan.name} Plan`
                )
              }
            >
              {processing === placementPlan.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upgrade to Placement
            </Button>
          </div>
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
