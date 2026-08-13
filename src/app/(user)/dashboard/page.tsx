'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { StatsCard } from '@/components/StatsCard';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Clock, Award, Play, FileText } from 'lucide-react';
import Link from 'next/link';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import { TrendBadge } from './_components/TrendBadge';
import { ScoreTrendChart } from './_components/ScoreTrendChart';
import { RecentMockRow } from './_components/RecentMockRow';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading, error } = useDashboard();

  if (authLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
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
