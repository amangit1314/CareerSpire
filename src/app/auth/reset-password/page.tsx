"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { dmSans } from "@/lib/fonts";
import { resetPasswordAction } from "@/app/actions/auth.actions";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { RESET_PASSWORD_CONTENT } from "@/config/content";
import { MESSAGES, RESET_PASSWORD_MESSAGES } from "@/config/messages";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(RESET_PASSWORD_MESSAGES.INVALID_TOKEN);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      toast.error(MESSAGES.PASSWORDS_MISMATCH);
      return;
    }

    if (password.length < 8) {
      toast.error(RESET_PASSWORD_MESSAGES.PASSWORD_MIN_LENGTH);
      return;
    }

    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      toast.error(RESET_PASSWORD_MESSAGES.PASSWORD_COMPLEXITY);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPasswordAction({ token, password });
      setIsSuccess(true);
      toast.success(RESET_PASSWORD_MESSAGES.RESET_SUCCESS);
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : RESET_PASSWORD_MESSAGES.RESET_FAILED_FALLBACK;
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
          <CardTitle className={`${dmSans.className} text-2xl`}>
            {RESET_PASSWORD_CONTENT.SUCCESS_TITLE}
          </CardTitle>
          <CardDescription>
            {RESET_PASSWORD_CONTENT.SUCCESS_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full text-white">
            <Link href={ROUTES.LOGIN}>
              {RESET_PASSWORD_CONTENT.SUCCESS_LOGIN_LINK}
            </Link>
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
          <CardTitle className={`${dmSans.className} text-2xl`}>
            {RESET_PASSWORD_CONTENT.INVALID_LINK_TITLE}
          </CardTitle>
          <CardDescription>
            {RESET_PASSWORD_CONTENT.INVALID_LINK_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.FORGOT_PASSWORD}>
              {RESET_PASSWORD_CONTENT.INVALID_LINK_ACTION}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href={ROUTES.LOGIN}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {RESET_PASSWORD_CONTENT.SECTION_LABEL}
          </span>
        </div>
        <CardTitle className={`${dmSans.className} text-2xl`}>
          {RESET_PASSWORD_CONTENT.TITLE}
        </CardTitle>
        <CardDescription>{RESET_PASSWORD_CONTENT.DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">
              {RESET_PASSWORD_CONTENT.PASSWORD_LABEL}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={RESET_PASSWORD_CONTENT.PASSWORD_PLACEHOLDER}
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
                aria-label={
                  showPassword
                    ? RESET_PASSWORD_CONTENT.HIDE_PASSWORD_LABEL
                    : RESET_PASSWORD_CONTENT.SHOW_PASSWORD_LABEL
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {RESET_PASSWORD_CONTENT.CONFIRM_PASSWORD_LABEL}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={RESET_PASSWORD_CONTENT.PASSWORD_PLACEHOLDER}
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
                aria-label={
                  showConfirmPassword
                    ? RESET_PASSWORD_CONTENT.HIDE_PASSWORD_LABEL
                    : RESET_PASSWORD_CONTENT.SHOW_PASSWORD_LABEL
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full text-white"
            disabled={isLoading || !token}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {RESET_PASSWORD_CONTENT.SUBMIT_PENDING}
              </>
            ) : (
              RESET_PASSWORD_CONTENT.SUBMIT
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
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              {RESET_PASSWORD_CONTENT.LOADING}
            </p>
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
