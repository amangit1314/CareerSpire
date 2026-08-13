import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type ScorePoint = { date: string; score: number };
export type TrendDirection = 'up' | 'down' | 'stable';

export function getTrendDirection(trend: ScorePoint[]): TrendDirection {
  if (trend.length < 2) return 'stable';
  const [prev, curr] = trend.slice(-2);
  if (curr.score > prev.score) return 'up';
  if (curr.score < prev.score) return 'down';
  return 'stable';
}

export const trendStyles: Record<TrendDirection, { badge: string; text: string; Icon: typeof TrendingUp }> = {
  up: {
    badge: 'bg-success/10 text-success border border-success/20',
    text: 'text-success',
    Icon: TrendingUp,
  },
  down: {
    badge: 'bg-destructive/10 text-destructive border border-destructive/20',
    text: 'text-destructive',
    Icon: TrendingDown,
  },
  stable: {
    badge: 'bg-muted text-muted-foreground border border-border',
    text: 'text-muted-foreground',
    Icon: Minus,
  },
};
