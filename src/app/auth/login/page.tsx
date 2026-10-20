"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { LOGIN_CONTENT } from "@/config/content";
import { LOGIN_MESSAGES } from "@/config/messages";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isSigningIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signIn({ email, password });
      const callback = searchParams.get("callback");
      router.push(
        callback && callback.startsWith("/") ? callback : ROUTES.DASHBOARD,
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : LOGIN_MESSAGES.SIGN_IN_FAILED_FALLBACK,
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className={`${dmSans.className} text-2xl`}>
            {LOGIN_CONTENT.TITLE}
          </CardTitle>
          <CardDescription>{LOGIN_CONTENT.DESCRIPTION}</CardDescription>
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
                {LOGIN_CONTENT.EMAIL_LABEL}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={LOGIN_CONTENT.EMAIL_PLACEHOLDER}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                {LOGIN_CONTENT.PASSWORD_LABEL}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={LOGIN_CONTENT.PASSWORD_PLACEHOLDER}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showPassword
                      ? LOGIN_CONTENT.HIDE_PASSWORD_LABEL
                      : LOGIN_CONTENT.SHOW_PASSWORD_LABEL
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-primary hover:underline"
                >
                  {LOGIN_CONTENT.FORGOT_PASSWORD_LINK}
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {LOGIN_CONTENT.SUBMIT_PENDING}
                </>
              ) : (
                LOGIN_CONTENT.SUBMIT
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {LOGIN_CONTENT.NO_ACCOUNT_PROMPT}
            </span>
            <Link href={ROUTES.SIGNUP} className="text-primary hover:underline">
              {LOGIN_CONTENT.SIGNUP_LINK}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
