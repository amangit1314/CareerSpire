'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { resetPasswordAction } from '@/app/actions/auth.actions';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            toast.error('Password must contain uppercase, lowercase, and a number');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await resetPasswordAction({ token, password });
            setIsSuccess(true);
            toast.success('Password reset successfully');
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to reset password';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className={`${dmSans.className} text-2xl`}>Password Updated</CardTitle>
                    <CardDescription>
                        Your password has been reset successfully. You will be redirected to the login page shortly.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full text-white">
                        <Link href="/auth/login">Login Now</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (error && !token) {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className={`${dmSans.className} text-2xl`}>Invalid Link</CardTitle>
                    <CardDescription>
                        The password reset link is invalid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/auth/forgot-password">Request New Link</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Authentication</span>
                </div>
                <CardTitle className={`${dmSans.className} text-2xl`}>New Password</CardTitle>
                <CardDescription>
                    Please enter your new password below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-10 pr-10"
                            />
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="pl-10 pr-10"
                            />
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full text-white" disabled={isLoading || !token}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Suspense fallback={
                <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Loading...</p>
                </Card>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
