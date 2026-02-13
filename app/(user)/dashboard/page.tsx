'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/StatsCard';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Clock, Award, Play, Loader2, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { formatDate } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';

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
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className={`${dmSans.className} text-3xl font-bold mb-2`}>Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and improve your interview skills
        </p>
      </div>

      {/* Quick Start */}
      {stats.freeMocksRemaining > 0 && (
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`${dmSans.className} text-lg font-semibold mb-2`}>
                  {stats.freeMocksRemaining} Free Mock{stats.freeMocksRemaining > 1 ? 's' : ''} Remaining
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start practicing now to improve your skills
                </p>
              </div>
              <Link href="/mock/new">
                <Button size="lg" className={`${dmSans.className} text-white`}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Mock Interview
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
        <Card className="mb-8 overflow-hidden">
          {/* <CardHeader>
            <CardTitle className={dmSans.className}>Score Trend</CardTitle>
          </CardHeader> */}
          <CardContent className="p-0 sm:p-6">
            <div className="h-full w-full">


              <ScoreTrendChart stats={stats} />

            </div>
          </CardContent>
        </Card>
      )}
      {/* Weak Topics */}
      {
        stats.weakTopics.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className={dmSans.className}>Focus Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These topics need more practice:
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Recent Mocks */}
      <Card>
        <CardHeader>
          <CardTitle className={dmSans.className}>Recent Mock Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentMocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No mock interviews yet. Start your first one!</p>
              <Link href="/mock/new" className="mt-4 inline-block">
                <Button className={`${dmSans.className}  text-white overflow-hidden`}>Start Mock Interview</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentMocks.map((mock) => (
                <div
                  key={mock.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-semibold">
                      Score: {mock.score}% • {mock.questions} questions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(mock.date)}
                    </p>
                  </div>
                  <Link href={`/mock/${mock.id}`}>
                    <Button variant="outline" size="sm" className={dmSans.className}>
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
}


// Enhanced Score Trend Component
function ScoreTrendChart({ stats }: { stats: any }) {
  const calculateTrend = () => {
    if (stats.scoreTrend.length < 2) return 'stable';
    const recent = stats.scoreTrend.slice(-2);
    return recent[1].score > recent[0].score ? 'up' :
      recent[1].score < recent[0].score ? 'down' : 'stable';
  };

  const trend = calculateTrend();
  const latestScore = stats.scoreTrend[stats.scoreTrend.length - 1]?.score || 0;

  return (
    <div className="chart-container p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Performance Trend</h3>
          <p className="text-sm text-muted-foreground">Your practice scores over time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1
            ${trend === 'up' ? 'bg-green-500/10 text-green-500' :
              trend === 'down' ? 'bg-red-500/10 text-red-500' :
                'bg-blue-500/10 text-blue-500'}
          `}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
              trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                <Minus className="h-4 w-4" />}
            {latestScore}%
          </div>
        </div>
      </div>

      <div style={{ height: 270 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={stats.scoreTrend}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.3}
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
                      <p className="text-sm font-semibold text-primary">{label}</p>
                      <p className="text-lg font-bold mt-1">
                        {payload[0].value}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
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

            {/* Area under line */}
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              activeDot={{
                r: 6,
                fill: 'var(--primary)',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />

            {/* Reference line for average or target */}
            <ReferenceLine
              y={stats.averageScore || 70}
              stroke="var(--secondary-avg)"
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{
                value: `Avg: ${stats.averageScore || 70}%`,
                position: 'insideTopRight',
                fill: 'var(--secondary-avg)',
                fontSize: 10
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart stats summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Highest</p>
          <p className="text-xl font-semibold">
            {Math.max(...stats.scoreTrend.map((s: any) => s.score))}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Average</p>
          <p className="text-xl font-semibold">
            {(stats.scoreTrend.reduce((a: number, b: any) => a + b.score, 0) / stats.scoreTrend.length).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Improvement</p>
          <p className={`
            text-xl font-semibold flex items-center justify-center gap-1
            ${trend === 'up' ? 'text-green-500' :
              trend === 'down' ? 'text-red-500' : 'text-blue-500'}
          `}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            {stats.scoreTrend.length > 1
              ? Math.abs(stats.scoreTrend[stats.scoreTrend.length - 1].score - stats.scoreTrend[0].score)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}