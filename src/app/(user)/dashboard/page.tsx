'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/StatsCard';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Clock, Award, Play, TrendingDown, Minus, ChevronRight, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { formatDate } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading, error } = useDashboard();

  if (authLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  if (error || !stats) {
    return (
      <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-8">
        <ErrorMessage
          title="Failed to load dashboard"
          message={
            error?.message ||
            'We couldn\'t load your dashboard data. Please refresh the page or try again later.'
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className={`${dmSans.className} text-2xl sm:text-3xl font-bold mb-2`}>Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your progress and improve your interview skills
        </p>
      </div>

      {/* Quick Start */}
      {stats.freeMocksRemaining > 0 && (
        <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className={`${dmSans.className} text-base sm:text-lg font-semibold mb-1 sm:mb-2`}>
                  {stats.freeMocksRemaining} Free Mock{stats.freeMocksRemaining > 1 ? 's' : ''} Remaining
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Start practicing now to improve your skills
                </p>
              </div>
              <Link href="/mock/new" className="w-full sm:w-auto">
                <Button size="lg" className={`${dmSans.className} w-full sm:w-auto text-primary-foreground`}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Mock Interview
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <StatsCard
          title="Total Mocks"
          value={stats.totalMocks}
          icon={Target}
        />
        <StatsCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={Award}
        />
        <StatsCard
          title="Completed"
          value={stats.completedMocks}
          icon={TrendingUp}
        />
        <StatsCard
          title="Free Mocks Left"
          value={stats.freeMocksRemaining}
          icon={Clock}
        />
      </div>

      {/* Score Trend */}
      {stats.scoreTrend.length > 0 && (
        <Card className="mb-6 sm:mb-8 overflow-hidden">
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-4 space-y-0">
            <div className="min-w-0">
              <CardTitle className={cn(dmSans.className, 'text-lg sm:text-xl')}>
                Performance Trend
              </CardTitle>
              <CardDescription className="mt-1">
                Your practice scores over time
              </CardDescription>
            </div>
            <TrendBadge stats={stats} />
          </CardHeader>
          <CardContent className="pt-0">
            <ScoreTrendChart stats={stats} />
          </CardContent>
        </Card>
      )}

      {/* Weak Topics */}
      {stats.weakTopics.length > 0 && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className={cn(dmSans.className, 'text-lg sm:text-xl')}>Focus Areas</CardTitle>
            <CardDescription className="mt-1">
              These topics need more practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.weakTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs sm:text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Mocks */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(dmSans.className, 'text-lg sm:text-xl')}>Recent Mock Interviews</CardTitle>
          <CardDescription className="mt-1">
            Your latest practice sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentMocks.length === 0 ? (
            <div className="text-center py-10 sm:py-12 px-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm sm:text-base font-medium mb-1">No mock interviews yet</p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                Start your first session to see results here.
              </p>
              <Link href="/mock/new" className="inline-block">
                <Button className={cn(dmSans.className, 'text-primary-foreground cursor-pointer')}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Mock Interview
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border -mt-2">
              {stats.recentMocks.map((mock) => (
                <li key={mock.id}>
                  <RecentMockRow mock={mock} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Trend helpers
// ----------------------------------------------------------------------------

type ScorePoint = { date: string; score: number };
type TrendDirection = 'up' | 'down' | 'stable';

function getTrendDirection(trend: ScorePoint[]): TrendDirection {
  if (trend.length < 2) return 'stable';
  const [prev, curr] = trend.slice(-2);
  if (curr.score > prev.score) return 'up';
  if (curr.score < prev.score) return 'down';
  return 'stable';
}

const trendStyles: Record<TrendDirection, { badge: string; text: string; Icon: typeof TrendingUp }> = {
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

function TrendBadge({ stats }: { stats: { scoreTrend: ScorePoint[] } }) {
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

// ----------------------------------------------------------------------------
// Chart
// ----------------------------------------------------------------------------

function ScoreTrendChart({ stats }: { stats: { scoreTrend: ScorePoint[]; averageScore?: number } }) {
  const direction = getTrendDirection(stats.scoreTrend);
  const trendStyle = trendStyles[direction];

  const highest = Math.max(...stats.scoreTrend.map((s) => s.score));
  const average =
    stats.scoreTrend.reduce((acc, s) => acc + s.score, 0) / stats.scoreTrend.length;
  const improvement =
    stats.scoreTrend.length > 1
      ? Math.abs(stats.scoreTrend[stats.scoreTrend.length - 1].score - stats.scoreTrend[0].score)
      : 0;
  const avgValue = stats.averageScore ?? Math.round(average);

  return (
    <div>
      <div className="h-[16.25rem] sm:h-[18.75rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={stats.scoreTrend}
            margin={{ top: 20, right: 24, left: -8, bottom: 8 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)' }}
              tickMargin={10}
              padding={{ left: 20, right: 10 }}
            />

            <YAxis
              domain={[0, 100]}
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)' }}
              tickMargin={10}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass p-3 rounded-lg shadow-lg border border-primary/20">
                      <p className="text-xs font-semibold text-primary">{label}</p>
                      <p className="text-base font-bold mt-1">
                        {payload[0].value}%
                      </p>
                      <p className="text-[0.6875rem] text-muted-foreground mt-1">
                        Practice Score
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{
                stroke: 'var(--primary)',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              dot={{
                r: 4,
                fill: 'var(--primary)',
                stroke: 'var(--background)',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: 'var(--primary)',
                stroke: 'var(--background)',
                strokeWidth: 2,
              }}
            />

            <ReferenceLine
              y={avgValue}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.6}
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{
                value: `Avg: ${avgValue}%`,
                position: 'insideTopRight',
                fill: 'var(--muted-foreground)',
                fontSize: 11,
                fontWeight: 600,
                offset: 8,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart stats summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
        <SummaryStat label="Highest" value={`${highest}%`} valueClass="text-foreground" />
        <SummaryStat label="Average" value={`${average.toFixed(1)}%`} valueClass="text-foreground" />
        <SummaryStat
          label="Improvement"
          value={`${direction === 'up' ? '+' : direction === 'down' ? '-' : ''}${improvement}%`}
          valueClass={trendStyle.text}
        />
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
      <p className={cn(dmSans.className, 'text-lg sm:text-xl font-semibold', valueClass)}>
        {value}
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Recent Mock row
// ----------------------------------------------------------------------------

type RecentMock = {
  id: string;
  score: number;
  questions: number;
  date: Date;
};

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      ring: 'ring-success/30',
      bg: 'bg-success/10',
      text: 'text-success',
      label: 'Excellent',
    };
  }
  if (score >= 60) {
    return {
      ring: 'ring-warning/30',
      bg: 'bg-warning/10',
      text: 'text-warning',
      label: 'Good',
    };
  }
  return {
    ring: 'ring-destructive/30',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    label: 'Needs work',
  };
}

function RecentMockRow({ mock }: { mock: RecentMock }) {
  const tone = getScoreTone(mock.score);

  return (
    <Link
      href={`/mock/${mock.id}`}
      aria-label={`View details for mock with score ${mock.score}%`}
      className={cn(
        'group relative flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl cursor-pointer',
        'transition-all duration-200',
        'hover:bg-primary hover:shadow-md hover:shadow-primary/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
    >
      {/* Score chip — at rest: tinted; on hover: clean white surface keeps the tone-colored
          number high-contrast against the blue background without color clash */}
      <div
        className={cn(
          'shrink-0 h-12 w-14 sm:h-14 sm:w-16 rounded-xl flex items-center justify-center ring-1 transition-colors',
          tone.bg,
          tone.ring,
          'group-hover:bg-white group-hover:ring-white/40'
        )}
      >
        <span
          className={cn(
            dmSans.className,
            'text-base sm:text-lg font-bold leading-none tabular-nums transition-colors',
            tone.text
          )}
        >
          {mock.score}%
        </span>
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn(
            dmSans.className,
            'font-semibold text-sm sm:text-base text-foreground transition-colors',
            'group-hover:text-white'
          )}>
            Mock Interview
          </p>
          {/* Status pill — secondary visual weight on hover so the chip stays the anchor */}
          <span
            className={cn(
              'text-[0.625rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold whitespace-nowrap transition-colors',
              tone.bg,
              tone.text,
              'group-hover:bg-white/20 group-hover:text-white'
            )}
          >
            {tone.label}
          </span>
        </div>
        <p className={cn(
          'flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1 transition-colors',
          'group-hover:text-white/80'
        )}>
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {mock.questions} question{mock.questions !== 1 ? 's' : ''} · {formatDate(mock.date)}
          </span>
        </p>
      </div>

      {/* CTA */}
      <div className={cn(
        'hidden sm:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all',
        'group-hover:text-white group-hover:translate-x-0.5'
      )}>
        View Details
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
      <ChevronRight className={cn(
        'sm:hidden h-5 w-5 text-muted-foreground transition-all',
        'group-hover:text-white group-hover:translate-x-0.5'
      )} />
    </Link>
  );
}
