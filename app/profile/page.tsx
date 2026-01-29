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
import { dmSans, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
    Shield,
    Edit3,
    Camera,
    Settings,
    ShieldCheck
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
    { id: 'first_mock', name: 'First Steps', description: 'Complete your first mock interview', icon: Star },
    { id: 'streak_3', name: 'On Fire', description: '3-day practice streak', icon: Flame },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day practice streak', icon: Trophy },
    { id: 'streak_30', name: 'Monthly Champion', description: '30-day practice streak', icon: Crown },
    { id: 'perfect_score', name: 'Perfectionist', description: 'Score 100% on a mock', icon: Target },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a mock in under 10 minutes', icon: Zap },
    { id: 'dsa_master', name: 'DSA Master', description: 'Complete 10 DSA problems', icon: Shield },
    { id: 'all_types', name: 'Well Rounded', description: 'Try all interview types', icon: Medal },
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
            <div className="container mx-auto px-4 py-16 space-y-12">
                <Skeleton className="h-[300px] w-full rounded-3xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
            </div>
        );
    }

    const currentLevel = calculateLevel(stats.xp);
    const progress = calculateProgress(stats.xp);
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
    const displayName = user?.name || user?.email?.split('@')[0] || 'Member';

    return (
        <div className="min-h-screen pt-24 pb-20 overflow-hidden relative">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 space-y-12">
                {/* Hero Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glass-card border-primary/20 overflow-hidden relative shadow-2xl shadow-primary/5 rounded-3xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <CardContent className="p-8 md:p-12">
                            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className={cn(
                                        "w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-primary/20 transform group-hover:rotate-3 transition-transform duration-300",
                                        dmSans.className
                                    )}>
                                        {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-3 -right-3 px-4 py-2 rounded-2xl text-xs font-black bg-background border-2 shadow-xl shadow-black/10",
                                        currentLevel.color
                                    )}>
                                        LV.{currentLevel.level}
                                    </div>
                                    <Button size="icon" variant="ghost" className="absolute -top-2 -left-2 rounded-xl bg-background/50 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Main User Details */}
                                <div className="flex-1 text-center lg:text-left space-y-4">
                                    <div className="space-y-1">
                                        {editing ? (
                                            <div className="flex items-center gap-3 justify-center lg:justify-start">
                                                <Input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="max-w-xs bg-muted/30 border-primary/20 h-12 text-xl font-bold"
                                                    autoFocus
                                                />
                                                <Button h-12 onClick={handleSave} disabled={saving} className="shadow-lg shadow-primary/20 dark:text-white">
                                                    {saving ? 'Saving...' : 'Save'}
                                                </Button>
                                                <Button h-12 variant="ghost" onClick={() => setEditing(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 justify-center lg:justify-start">
                                                <h1 className={cn("text-4xl md:text-5xl font-black tracking-tight", dmSans.className)}>
                                                    {displayName}
                                                </h1>
                                                <button onClick={() => setEditing(true)} className="p-2 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors">
                                                    <Edit3 className="h-6 w-6" />
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-xl text-muted-foreground/80 font-medium">{user?.email}</p>
                                    </div>

                                    {/* Level & Title */}
                                    <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                                        <div className={cn("px-4 py-1.5 rounded-full bg-primary/5 inline-flex items-center gap-2 font-bold", currentLevel.color)}>
                                            <Sparkles className="h-4 w-4" />
                                            {currentLevel.title}
                                        </div>
                                        <div className="px-4 py-1.5 rounded-full bg-muted/50 inline-flex items-center gap-2 font-bold text-muted-foreground">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            {stats.currentStreak} Day Streak
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full max-w-md pt-4">
                                        <div className="flex justify-between text-sm font-bold mb-2">
                                            <span className="text-primary">{stats.xp} XP</span>
                                            {nextLevel && <span className="text-muted-foreground/60">{nextLevel.xpRequired} XP</span>}
                                        </div>
                                        <div className="h-4 bg-muted/30 rounded-full overflow-hidden p-1 border border-primary/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full"
                                            />
                                        </div>
                                        {nextLevel && (
                                            <p className="text-xs font-bold text-muted-foreground mt-3 uppercase tracking-widest text-center lg:text-left">
                                                {nextLevel.xpRequired - stats.xp} XP to unlocked <span className={currentLevel.color}>{nextLevel.title}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Member Tier & Tier Icon */}
                                <div className="hidden xl:flex flex-col items-center p-6 rounded-3xl bg-secondary/5 border border-secondary/10 shadow-inner">
                                    <div className="p-4 rounded-full bg-secondary/10 mb-3">
                                        {user?.subscriptionTier === 'PRO' ? (
                                            <Crown className="h-10 w-10 text-secondary" />
                                        ) : (
                                            <Shield className="h-10 w-10 text-primary/40" />
                                        )}
                                    </div>
                                    <span className="font-black text-sm uppercase tracking-widest">{user?.subscriptionTier || 'Free'} Tier</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Growth Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Mocks Completed', value: stats.totalMocksCompleted, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                        { label: 'Average Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/5' },
                        { label: 'Total XP', value: stats.xp, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                        { label: 'Badges Earned', value: stats.badges.length, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="glass-card border-none hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group rounded-3xl overflow-hidden">
                                <CardContent className="p-6 text-center space-y-3">
                                    <div className={cn("w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:-translate-y-1", stat.bg)}>
                                        <stat.icon className={cn("h-7 w-7", stat.color)} />
                                    </div>
                                    <div>
                                        <p className={cn("text-3xl font-black tracking-tight", dmSans.className)}>{stat.value}</p>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Badges Section */}
                <Card className="glass-card border-primary/10 rounded-3xl overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className={cn("flex items-center gap-3 text-2xl font-black tracking-tight", dmSans.className)}>
                            <div className="p-2 rounded-xl bg-amber-500/10">
                                <Trophy className="h-6 w-6 text-amber-500" />
                            </div>
                            Hall of Fame
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {BADGES.map((badge) => {
                                const isUnlocked = stats.badges.includes(badge.id);
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={badge.id}
                                        className={cn(
                                            "relative p-6 rounded-3xl border transition-all duration-300 group",
                                            isUnlocked
                                                ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 shadow-lg shadow-amber-500/5 scale-100"
                                                : "bg-muted/5 border-muted opacity-40 grayscale hover:grayscale-0"
                                        )}
                                    >
                                        {!isUnlocked && (
                                            <div className="absolute top-4 right-4 bg-muted p-1.5 rounded-lg">
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                            isUnlocked ? "bg-amber-500/20 shadow-lg shadow-amber-200/20" : "bg-muted/20"
                                        )}>
                                            <Icon className={cn(
                                                "h-10 w-10",
                                                isUnlocked ? "text-amber-500 drop-shadow-sm" : "text-muted-foreground/50"
                                            )} />
                                        </div>
                                        <div className="text-center">
                                            <p className={cn("font-black tracking-tight mb-1", dmSans.className)}>{badge.name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-tight">
                                                {badge.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings Section */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <Card className="glass-card border-none rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className={cn("flex items-center gap-3 text-2xl font-black tracking-tight", dmSans.className)}>
                                <div className="p-2 rounded-xl bg-blue-500/10">
                                    <Settings className="h-6 w-6 text-blue-500" />
                                </div>
                                Account Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1">Registered Email</label>
                                <div className="relative">
                                    <Input value={user?.email || ''} disabled className="h-12 bg-muted/20 border-border/50 pl-11" />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                </div>
                                <p className="text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-bold">Email address is permanent and linked to your performance data</p>
                            </div>

                            <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/20 hover:bg-primary/5 transition-colors font-bold tracking-tight">
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className={cn("flex items-center gap-3 text-2xl font-black tracking-tight", dmSans.className)}>
                                <div className="p-2 rounded-xl bg-purple-500/10">
                                    <ShieldCheck className="h-6 w-6 text-purple-500" />
                                </div>
                                Subscription Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-black text-2xl tracking-tight uppercase">{user?.subscriptionTier || 'FREE'} PLAN</p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-primary/5">
                                        <Star className="h-3 w-3 text-primary" />
                                        <span className="text-xs font-black tracking-tight">{user?.freeMocksRemaining || 0} Sessions Left</span>
                                    </div>
                                </div>
                                <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/20 font-black tracking-tight dark:text-white group">
                                    Full Access
                                    <Crown className="ml-2 h-4 w-4 transform group-hover:scale-125 transition-transform" />
                                </Button>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground/60 text-center uppercase tracking-widest leading-relaxed">
                                Upgrade to <span className="text-primary">Mocky Pro</span> for unlimited AI interviews and exclusive company paths.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
