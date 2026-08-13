import { cn } from '@/lib/utils';
import { getTrendDirection, trendStyles, type ScorePoint } from './trendHelpers';

export function TrendBadge({ stats }: { stats: { scoreTrend: ScorePoint[] } }) {
  const direction = getTrendDirection(stats.scoreTrend);
  const latest = stats.scoreTrend[stats.scoreTrend.length - 1]?.score ?? 0;
  const { badge, Icon } = trendStyles[direction];

  return (
    <div className={cn('px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 shrink-0', badge)}>
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {latest}%
    </div>
  );
}
