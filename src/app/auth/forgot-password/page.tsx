"use client";

import { useState } from "react";
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
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { dmSans } from "@/lib/fonts";
import { requestPasswordResetAction } from "@/app/actions/auth.actions";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { FORGOT_PASSWORD_CONTENT } from "@/config/content";
import { FORGOT_PASSWORD_MESSAGES } from "@/config/messages";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await requestPasswordResetAction({ email });
      setIsSubmitted(true);
      toast.success(result.message);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : FORGOT_PASSWORD_MESSAGES.REQUEST_FAILED_FALLBACK,
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className={`${dmSans.className} text-2xl`}>
              {FORGOT_PASSWORD_CONTENT.SUBMITTED_TITLE}
            </CardTitle>
            <CardDescription>
              {FORGOT_PASSWORD_CONTENT.SUBMITTED_DESCRIPTION_PREFIX}{" "}
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {FORGOT_PASSWORD_CONTENT.SUBMITTED_HINT}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.LOGIN}>
                {FORGOT_PASSWORD_CONTENT.BACK_TO_LOGIN}
              </Link>
            </Button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-muted-foreground hover:text-primary underline"
            >
              {FORGOT_PASSWORD_CONTENT.TRY_ANOTHER_EMAIL}
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
              {FORGOT_PASSWORD_CONTENT.SECTION_LABEL}
            </span>
          </div>
          <CardTitle className={`${dmSans.className} text-2xl`}>
            {FORGOT_PASSWORD_CONTENT.TITLE}
          </CardTitle>
          <CardDescription>
            {FORGOT_PASSWORD_CONTENT.DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {FORGOT_PASSWORD_CONTENT.EMAIL_LABEL}
              </Label>
              <div className="flex justify-start items-center relative mt-1">
                <Input
                  id="email"
                  type="email"
                  placeholder={FORGOT_PASSWORD_CONTENT.EMAIL_PLACEHOLDER}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {FORGOT_PASSWORD_CONTENT.SUBMIT_PENDING}
                </>
              ) : (
                FORGOT_PASSWORD_CONTENT.SUBMIT
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4">
          <div className="text-sm text-muted-foreground">
            {FORGOT_PASSWORD_CONTENT.REMEMBER_PASSWORD_PROMPT}{" "}
            <Link
              href={ROUTES.LOGIN}
              className="text-primary hover:underline font-medium"
            >
              {FORGOT_PASSWORD_CONTENT.LOGIN_LINK}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
