"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { StatsCard } from "@/components/StatsCard";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Clock, Award, Play, FileText } from "lucide-react";
import Link from "next/link";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { DASHBOARD_CONTENT } from "@/config/content";
import { DASHBOARD_MESSAGES } from "@/config/messages";
import { TrendBadge } from "./_components/TrendBadge";
import { ScoreTrendChart } from "./_components/ScoreTrendChart";
import { RecentMockRow } from "./_components/RecentMockRow";

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
          title={DASHBOARD_CONTENT.LOAD_ERROR_TITLE}
          message={error?.message || DASHBOARD_MESSAGES.LOAD_ERROR_FALLBACK}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1
          className={`${dmSans.className} text-2xl sm:text-3xl font-bold mb-2`}
        >
          {DASHBOARD_CONTENT.TITLE}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {DASHBOARD_CONTENT.SUBTITLE}
        </p>
      </div>

      {/* Quick Start */}
      {stats.freeMocksRemaining > 0 && (
        <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h3
                  className={`${dmSans.className} text-base sm:text-lg font-semibold mb-1 sm:mb-2`}
                >
                  {DASHBOARD_CONTENT.FREE_MOCKS_REMAINING(
                    stats.freeMocksRemaining,
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {DASHBOARD_CONTENT.FREE_MOCKS_HINT}
                </p>
              </div>
              <Link href={ROUTES.MOCK_NEW} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className={`${dmSans.className} w-full sm:w-auto text-primary-foreground`}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {DASHBOARD_CONTENT.START_MOCK}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <StatsCard
          title={DASHBOARD_CONTENT.STAT_TOTAL_MOCKS}
          value={stats.totalMocks}
          icon={Target}
        />
        <StatsCard
          title={DASHBOARD_CONTENT.STAT_AVERAGE_SCORE}
          value={`${stats.averageScore}%`}
          icon={Award}
        />
        <StatsCard
          title={DASHBOARD_CONTENT.STAT_COMPLETED}
          value={stats.completedMocks}
          icon={TrendingUp}
        />
        <StatsCard
          title={DASHBOARD_CONTENT.STAT_FREE_MOCKS_LEFT}
          value={stats.freeMocksRemaining}
          icon={Clock}
        />
      </div>

      {/* Score Trend */}
      {stats.scoreTrend.length > 0 && (
        <Card className="mb-6 sm:mb-8 overflow-hidden">
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-4 space-y-0">
            <div className="min-w-0">
              <CardTitle className={cn(dmSans.className, "text-lg sm:text-xl")}>
                {DASHBOARD_CONTENT.TREND_TITLE}
              </CardTitle>
              <CardDescription className="mt-1">
                {DASHBOARD_CONTENT.TREND_SUBTITLE}
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
            <CardTitle className={cn(dmSans.className, "text-lg sm:text-xl")}>
              {DASHBOARD_CONTENT.FOCUS_AREAS_TITLE}
            </CardTitle>
            <CardDescription className="mt-1">
              {DASHBOARD_CONTENT.FOCUS_AREAS_SUBTITLE}
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
          <CardTitle className={cn(dmSans.className, "text-lg sm:text-xl")}>
            {DASHBOARD_CONTENT.RECENT_MOCKS_TITLE}
          </CardTitle>
          <CardDescription className="mt-1">
            {DASHBOARD_CONTENT.RECENT_MOCKS_SUBTITLE}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentMocks.length === 0 ? (
            <div className="text-center py-10 sm:py-12 px-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm sm:text-base font-medium mb-1">
                {DASHBOARD_CONTENT.EMPTY_RECENT_MOCKS_TITLE}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                {DASHBOARD_CONTENT.EMPTY_RECENT_MOCKS_HINT}
              </p>
              <Link href={ROUTES.MOCK_NEW} className="inline-block">
                <Button
                  className={cn(
                    dmSans.className,
                    "text-primary-foreground cursor-pointer",
                  )}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {DASHBOARD_CONTENT.START_MOCK}
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
