'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
    User,
    Trophy,
    Flame,
    Star,
    Target,
    Zap,
    Award,
    TrendingUp,
    Calendar,
    CheckCircle2,
    Lock,
    Crown,
    Sparkles,
    Medal,
    Shield
} from 'lucide-react';

// Gamification Constants
const LEVELS = [
    { level: 1, title: 'Beginner', xpRequired: 0, color: 'text-gray-500' },
    { level: 2, title: 'Novice', xpRequired: 100, color: 'text-green-500' },
    { level: 3, title: 'Apprentice', xpRequired: 300, color: 'text-blue-500' },
    { level: 4, title: 'Intermediate', xpRequired: 600, color: 'text-purple-500' },
    { level: 5, title: 'Skilled', xpRequired: 1000, color: 'text-orange-500' },
    { level: 6, title: 'Expert', xpRequired: 1500, color: 'text-pink-500' },
    { level: 7, title: 'Master', xpRequired: 2500, color: 'text-yellow-500' },
    { level: 8, title: 'Grandmaster', xpRequired: 4000, color: 'text-red-500' },
    { level: 9, title: 'Legend', xpRequired: 6000, color: 'text-cyan-500' },
    { level: 10, title: 'Interview God', xpRequired: 10000, color: 'text-amber-400' },
];

const BADGES = [
    { id: 'first_mock', name: 'First Steps', description: 'Complete your first mock interview', icon: Star, unlocked: true },
    { id: 'streak_3', name: 'On Fire', description: '3-day practice streak', icon: Flame, unlocked: true },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day practice streak', icon: Trophy, unlocked: false },
    { id: 'streak_30', name: 'Monthly Champion', description: '30-day practice streak', icon: Crown, unlocked: false },
    { id: 'perfect_score', name: 'Perfectionist', description: 'Score 100% on a mock', icon: Target, unlocked: false },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a mock in under 10 minutes', icon: Zap, unlocked: false },
    { id: 'dsa_master', name: 'DSA Master', description: 'Complete 10 DSA problems', icon: Shield, unlocked: false },
    { id: 'all_types', name: 'Well Rounded', description: 'Try all interview types', icon: Medal, unlocked: false },
];

function calculateLevel(xp: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpRequired) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

function calculateProgress(xp: number) {
    const currentLevel = calculateLevel(xp);
    const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
    const nextLevel = LEVELS[currentLevelIndex + 1];

    if (!nextLevel) return 100; // Max level

    const xpInCurrentLevel = xp - currentLevel.xpRequired;
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
    return Math.round((xpInCurrentLevel / xpNeededForNext) * 100);
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [] as string[],
        totalMocksCompleted: 0,
        avgScore: 0,
    });

    // Fetch gamification stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/user/stats');
                if (response.ok) {
                    const data = await response.json();
                    if (data.data) {
                        setStats(data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        if (isAuthenticated) {
            fetchStats();
        }
    }, [isAuthenticated]);

    const xp = stats.xp;
    const streak = stats.currentStreak;
    const totalMocks = stats.totalMocksCompleted;
    const avgScore = stats.avgScore;
    const userBadges = stats.badges;

    const currentLevel = calculateLevel(xp);
    const progress = calculateProgress(xp);
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

    // Map badges with unlock status
    const badgesWithStatus = BADGES.map(badge => ({
        ...badge,
        unlocked: userBadges.includes(badge.id),
    }));

    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await authService.updateProfile({ name });
            setEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
        setSaving(false);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Hero Section with Level */}
            <Card className="bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10 border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
                <CardContent className="pt-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className={cn(
                                "w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary/30",
                                dmSans.className
                            )}>
                                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className={cn(
                                "absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold bg-background border-2 shadow-lg",
                                currentLevel.color
                            )}>
                                Lv.{currentLevel.level}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            {editing ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="max-w-xs"
                                    />
                                    <Button size="sm" onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <h1 className={cn("text-3xl font-bold flex items-center gap-2 justify-center md:justify-start", dmSans.className)}>
                                        {user?.name || 'Unnamed User'}
                                        <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary">
                                            <User className="h-4 w-4" />
                                        </button>
                                    </h1>
                                    <p className="text-muted-foreground">{user?.email}</p>
                                </div>
                            )}

                            {/* Level Title */}
                            <div className={cn("mt-2 flex items-center gap-2 justify-center md:justify-start", currentLevel.color)}>
                                <Sparkles className="h-5 w-5" />
                                <span className={cn("text-lg font-semibold", dmSans.className)}>{currentLevel.title}</span>
                            </div>

                            {/* XP Progress Bar */}
                            <div className="mt-4 max-w-md">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{xp} XP</span>
                                    {nextLevel && <span>{nextLevel.xpRequired} XP</span>}
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                {nextLevel && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {nextLevel.xpRequired - xp} XP to {nextLevel.title}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Streak */}
                        <div className="text-center p-4 bg-background/50 rounded-xl border">
                            <Flame className="h-8 w-8 text-orange-500 mx-auto mb-1" />
                            <p className={cn("text-3xl font-bold", dmSans.className)}>{streak}</p>
                            <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="pt-6 text-center">
                        <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className={cn("text-3xl font-bold", dmSans.className)}>{totalMocks}</p>
                        <p className="text-sm text-muted-foreground">Mocks Completed</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="pt-6 text-center">
                        <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className={cn("text-3xl font-bold", dmSans.className)}>{avgScore}%</p>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <CardContent className="pt-6 text-center">
                        <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className={cn("text-3xl font-bold", dmSans.className)}>{xp}</p>
                        <p className="text-sm text-muted-foreground">Total XP</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                    <CardContent className="pt-6 text-center">
                        <Award className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className={cn("text-3xl font-bold", dmSans.className)}>{userBadges.length}</p>
                        <p className="text-sm text-muted-foreground">Badges Earned</p>
                    </CardContent>
                </Card>
            </div>

            {/* Badges Section */}
            <Card>
                <CardHeader>
                    <CardTitle className={cn("flex items-center gap-2", dmSans.className)}>
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Badges & Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {badgesWithStatus.map((badge) => {
                            const Icon = badge.icon;
                            return (
                                <div
                                    key={badge.id}
                                    className={cn(
                                        "relative p-4 rounded-xl border text-center transition-all",
                                        badge.unlocked
                                            ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30"
                                            : "bg-muted/30 border-muted opacity-60"
                                    )}
                                >
                                    {!badge.unlocked && (
                                        <Lock className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Icon className={cn(
                                        "h-10 w-10 mx-auto mb-2",
                                        badge.unlocked ? "text-amber-500" : "text-muted-foreground"
                                    )} />
                                    <p className={cn("font-semibold text-sm", dmSans.className)}>{badge.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className={cn("flex items-center gap-2", dmSans.className)}>
                        <User className="h-5 w-5" />
                        Account Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Email</Label>
                        <Input value={user?.email || ''} disabled className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <Label>Subscription</Label>
                        <div className="mt-1 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                            <div>
                                <p className="font-medium">{user?.subscriptionTier || 'FREE'} Plan</p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.freeMocksRemaining || 0} free mocks remaining
                                </p>
                            </div>
                            <Button size="sm" variant="outline">Upgrade</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
