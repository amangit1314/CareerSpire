"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { dmSans } from "@/lib/fonts";
import { ROUTES } from "@/config/routes";
import { SIGNUP_CONTENT } from "@/config/content";
import { MESSAGES, SIGNUP_MESSAGES } from "@/config/messages";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isSigningUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(MESSAGES.PASSWORDS_MISMATCH);
      return;
    }

    if (password.length < 8) {
      setError(SIGNUP_MESSAGES.PASSWORD_MIN_LENGTH);
      return;
    }

    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(SIGNUP_MESSAGES.PASSWORD_COMPLEXITY);
      return;
    }

    try {
      await signUp({ email, password });
      router.push(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : SIGNUP_MESSAGES.SIGN_UP_FAILED_FALLBACK,
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className={`${dmSans.className} text-2xl`}>
            {SIGNUP_CONTENT.TITLE}
          </CardTitle>
          <CardDescription>{SIGNUP_CONTENT.DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {SIGNUP_CONTENT.EMAIL_LABEL}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={SIGNUP_CONTENT.EMAIL_PLACEHOLDER}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                {SIGNUP_CONTENT.PASSWORD_LABEL}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={SIGNUP_CONTENT.PASSWORD_PLACEHOLDER}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showPassword
                      ? SIGNUP_CONTENT.HIDE_PASSWORD_LABEL
                      : SIGNUP_CONTENT.SHOW_PASSWORD_LABEL
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
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                {SIGNUP_CONTENT.CONFIRM_PASSWORD_LABEL}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={SIGNUP_CONTENT.PASSWORD_PLACEHOLDER}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? SIGNUP_CONTENT.HIDE_PASSWORD_LABEL
                      : SIGNUP_CONTENT.SHOW_PASSWORD_LABEL
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
              className="w-full dark:text-white"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {SIGNUP_CONTENT.SUBMIT_PENDING}
                </>
              ) : (
                SIGNUP_CONTENT.SUBMIT
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {SIGNUP_CONTENT.HAS_ACCOUNT_PROMPT}
            </span>
            <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
              {SIGNUP_CONTENT.LOGIN_LINK}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
