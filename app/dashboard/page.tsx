'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/StatsCard';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Clock, Award, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
          <CardHeader>
            <CardTitle className={dmSans.className}>Score Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.scoreTrend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
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
