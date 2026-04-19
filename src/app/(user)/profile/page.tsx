'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { changePasswordAction, deleteAccountAction } from '@/app/actions/auth.actions';
import { getUserPracticeStats, type UserPracticeStats } from '@/app/actions/practice.actions';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
    Trophy,
    Flame,
    Star,
    Target,
    Zap,
    Award,
    Lock,
    Crown,
    Sparkles,
    Medal,
    Shield,
    Edit3,
    KeyRound,
    AlertTriangle,
    X,
    Trash2,
    Loader2,
    ChevronRight,
    Coins,
    Hash,
} from 'lucide-react';

const LEVELS = [
    { level: 1, title: 'Beginner', xpRequired: 0 },
    { level: 2, title: 'Novice', xpRequired: 100 },
    { level: 3, title: 'Apprentice', xpRequired: 300 },
    { level: 4, title: 'Intermediate', xpRequired: 600 },
    { level: 5, title: 'Skilled', xpRequired: 1000 },
    { level: 6, title: 'Expert', xpRequired: 1500 },
    { level: 7, title: 'Master', xpRequired: 2500 },
    { level: 8, title: 'Grandmaster', xpRequired: 4000 },
    { level: 9, title: 'Legend', xpRequired: 6000 },
    { level: 10, title: 'Interview God', xpRequired: 10000 },
];

const BADGES = [
    { id: 'first_mock', name: 'First Steps', description: 'Complete first mock', icon: Star },
    { id: 'streak_3', name: 'On Fire', description: '3-day streak', icon: Flame },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: Trophy },
    { id: 'streak_30', name: 'Monthly Champ', description: '30-day streak', icon: Crown },
    { id: 'perfect_score', name: 'Perfectionist', description: '100% on a mock', icon: Target },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Mock under 10 min', icon: Zap },
    { id: 'dsa_master', name: 'DSA Master', description: '10 DSA problems', icon: Shield },
    { id: 'all_types', name: 'Well Rounded', description: 'All interview types', icon: Medal },
];

function getLevel(xp: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpRequired) return LEVELS[i];
    }
    return LEVELS[0];
}

function getProgress(xp: number) {
    const cur = getLevel(xp);
    const idx = LEVELS.findIndex((l) => l.level === cur.level);
    const next = LEVELS[idx + 1];
    if (!next) return 100;
    return Math.round(((xp - cur.xpRequired) / (next.xpRequired - cur.xpRequired)) * 100);
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    const [gamification, setGamification] = useState({ xp: 0, currentStreak: 0, longestStreak: 0, badges: [] as string[], totalMocksCompleted: 0, avgScore: 0 });
    const [practice, setPractice] = useState<UserPracticeStats>({ isAnonymous: true, xp: 0, coins: 0, currentStreak: 0, longestStreak: 0, problemsSolved: 0, rank: null });

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetch('/api/user/stats').then((r) => r.ok ? r.json() : null).then((d) => d?.data && setGamification(d.data)).catch(() => {});
        getUserPracticeStats().then(setPractice).catch(() => {});
    }, [isAuthenticated]);

    useEffect(() => { if (user?.name) setName(user.name); }, [user]);
    useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/auth/login'); }, [isLoading, isAuthenticated, router]);

    const handleSave = async () => {
        setSaving(true);
        try { await authService.updateProfile({ name }); setEditing(false); toast.success('Profile updated'); }
        catch (error: unknown) { toast.error(error instanceof Error ? error.message : 'Failed to update'); }
        setSaving(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return; }
        if (newPassword.length < 6) { toast.error('Min 6 characters'); return; }
        setIsChangingPassword(true);
        try {
            await changePasswordAction({ currentPassword, newPassword });
            toast.success('Password changed');
            setShowChangePassword(false);
            setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
        } catch (error: unknown) { toast.error(error instanceof Error ? error.message : 'Failed'); }
        finally { setIsChangingPassword(false); }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try { await deleteAccountAction(); toast.success('Account deleted'); router.push('/'); }
        catch (error: unknown) { toast.error(error instanceof Error ? error.message : 'Failed'); setIsDeleting(false); }
    };

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-8 space-y-4">
                <Skeleton className="h-36 w-full rounded-xl" />
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
            </div>
        );
    }

    const level = getLevel(gamification.xp);
    const progress = getProgress(gamification.xp);
    const nextLevel = LEVELS.find((l) => l.level === level.level + 1);
    const displayName = user?.name || user?.email?.split('@')[0] || 'Member';
    const initial = (user?.name || user?.email)?.charAt(0).toUpperCase() ?? 'U';

    const stats = [
        { label: 'Problems Solved', value: practice.problemsSolved, icon: Target, accent: 'text-blue-500 bg-blue-500/10' },
        { label: 'Current Streak', value: `${practice.currentStreak}d`, icon: Flame, accent: 'text-orange-500 bg-orange-500/10' },
        { label: 'Coins', value: practice.coins, icon: Coins, accent: 'text-amber-500 bg-amber-500/10' },
        { label: 'Total XP', value: gamification.xp, icon: Zap, accent: 'text-purple-500 bg-purple-500/10' },
        { label: 'Rank', value: practice.rank ? `#${practice.rank}` : '—', icon: Hash, accent: 'text-cyan-500 bg-cyan-500/10' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5">

                {/* ── Profile Header ── */}
                <section className="rounded-xl border border-border bg-card px-6 sm:px-8 py-6 sm:py-7">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                        {/* Avatar */}
                        <div className={cn(
                            dmSans.className,
                            'h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70',
                            'flex items-center justify-center text-2xl font-bold text-white shrink-0',
                        )}>
                            {initial}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-[14rem] h-9 text-base font-bold" autoFocus />
                                    <Button size="sm" onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className={cn(dmSans.className, 'text-xl sm:text-2xl font-bold truncate')}>{displayName}</h1>
                                    <button onClick={() => setEditing(true)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-primary/10 text-primary">
                                    <Sparkles className="h-3 w-3" />
                                    Lv.{level.level} {level.title}
                                </span>
                                {practice.currentStreak > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-orange-500/10 text-orange-500">
                                        <Flame className="h-3 w-3" />
                                        {practice.currentStreak}d streak
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-muted text-muted-foreground">
                                    {user?.subscriptionTier === 'PRO' ? <><Crown className="h-3 w-3 text-amber-500" /> Pro</> : <><Shield className="h-3 w-3" /> Free</>}
                                </span>
                            </div>
                        </div>

                        {/* XP progress — right side */}
                        <div className="shrink-0 w-full sm:w-56">
                            <div className="flex items-baseline justify-between mb-1.5">
                                <span className={cn(dmSans.className, 'text-base font-bold text-primary')}>{gamification.xp} XP</span>
                                {nextLevel && <span className="text-xs text-muted-foreground">/ {nextLevel.xpRequired}</span>}
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full bg-primary rounded-full"
                                />
                            </div>
                            {nextLevel && (
                                <p className="text-[0.625rem] text-muted-foreground mt-1.5">
                                    {nextLevel.xpRequired - gamification.xp} XP to {nextLevel.title}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {stats.map((s) => (
                        <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                            <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', s.accent.split(' ')[1])}>
                                <s.icon className={cn('h-4 w-4', s.accent.split(' ')[0])} />
                            </div>
                            <div className="min-w-0">
                                <p className={cn(dmSans.className, 'text-base font-bold leading-none tabular-nums')}>{s.value}</p>
                                <p className="text-[0.5625rem] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Achievements ── */}
                <section className="rounded-xl border border-border bg-card">
                    <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <h2 className={cn(dmSans.className, 'text-sm font-bold')}>Achievements</h2>
                        <span className="text-[0.625rem] text-muted-foreground ml-auto tabular-nums">
                            {gamification.badges.length}/{BADGES.length}
                        </span>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {BADGES.map((badge) => {
                            const unlocked = gamification.badges.includes(badge.id);
                            const Icon = badge.icon;
                            return (
                                <div
                                    key={badge.id}
                                    className={cn(
                                        'relative rounded-lg border p-3 text-center transition-colors',
                                        unlocked ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-muted/20 opacity-50',
                                    )}
                                >
                                    {!unlocked && <Lock className="absolute top-2 right-2 h-2.5 w-2.5 text-muted-foreground" />}
                                    <div className={cn('h-9 w-9 rounded-lg mx-auto flex items-center justify-center mb-2', unlocked ? 'bg-amber-500/15' : 'bg-muted/40')}>
                                        <Icon className={cn('h-5 w-5', unlocked ? 'text-amber-500' : 'text-muted-foreground/50')} />
                                    </div>
                                    <p className={cn(dmSans.className, 'text-xs font-bold leading-tight')}>{badge.name}</p>
                                    <p className="text-[0.5625rem] text-muted-foreground leading-tight mt-0.5">{badge.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Account & Plan ── */}
                <div className="grid lg:grid-cols-2 gap-3">
                    <section className="rounded-xl border border-border bg-card">
                        <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            <h2 className={cn(dmSans.className, 'text-sm font-bold')}>Account</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-[0.6875rem] text-muted-foreground font-medium uppercase tracking-wider">Email</label>
                                <p className="text-sm font-medium mt-0.5">{user?.email}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowChangePassword(true)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-sm font-medium transition-colors cursor-pointer"
                            >
                                Change Password
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-card">
                        <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
                            <Crown className="h-4 w-4 text-muted-foreground" />
                            <h2 className={cn(dmSans.className, 'text-sm font-bold')}>Plan</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className={cn(dmSans.className, 'text-base font-bold')}>
                                        {user?.subscriptionTier === 'PRO' ? 'Pro' : 'Free'} Plan
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {user?.subscriptionTier === 'PRO'
                                            ? 'Unlimited AI interviews & exclusive paths'
                                            : `${user?.freeMocksRemaining ?? 0} free mock${(user?.freeMocksRemaining ?? 0) === 1 ? '' : 's'} remaining`}
                                    </p>
                                </div>
                                {user?.subscriptionTier !== 'PRO' && (
                                    <Link href="/pricing">
                                        <Button size="sm" className="shrink-0">
                                            Upgrade <Crown className="ml-1.5 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── Danger Zone ── */}
                <section className="rounded-xl border border-red-500/20 bg-red-500/[0.03]">
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <h2 className={cn(dmSans.className, 'text-sm font-bold text-red-500')}>Delete Account</h2>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-lg">
                                Permanently remove your account and all data. This cannot be undone.
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} className="shrink-0">
                            Delete Account
                        </Button>
                    </div>
                </section>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {showChangePassword && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-card border border-border shadow-2xl rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b flex items-center justify-between">
                                <h2 className={cn(dmSans.className, 'text-base font-bold')}>Change Password</h2>
                                <button onClick={() => setShowChangePassword(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={handleChangePassword} className="p-5 space-y-3.5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                                    <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmNewPassword" className="text-xs">Confirm New Password</Label>
                                    <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className="h-10" />
                                </div>
                                <Button type="submit" className="w-full h-10 mt-2" disabled={isChangingPassword}>
                                    {isChangingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Password'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-card border border-red-500/20 shadow-2xl rounded-xl overflow-hidden">
                            <div className="p-6 text-center space-y-4">
                                <div className="h-12 w-12 bg-red-500/10 rounded-xl mx-auto flex items-center justify-center">
                                    <Trash2 className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className={cn(dmSans.className, 'text-lg font-bold mb-1')}>Delete Account?</h2>
                                    <p className="text-sm text-muted-foreground">This is <span className="text-red-500 font-semibold">permanent</span>. All progress and data will be lost.</p>
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="w-full">
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="w-full">Cancel</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
