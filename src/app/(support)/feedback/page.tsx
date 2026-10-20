"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { FEEDBACK_PAGE_CONTENT } from "@/config/content";
import { submitFeedbackAction } from "@/app/actions/support.actions";
import { cn } from "@/lib/utils";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      toast.error("Please add a message before sending.");
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedbackAction({
        rating: rating ? String(rating) : "",
        message,
      });
      toast.success("Thanks for the feedback!");
      setRating(0);
      setMessage("");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send feedback. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StaticPageLayout
      title={FEEDBACK_PAGE_CONTENT.TITLE}
      subtitle={FEEDBACK_PAGE_CONTENT.SUBTITLE}
    >
      <div className="p-6 sm:p-8 rounded-xl border border-border bg-card/50 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            {FEEDBACK_PAGE_CONTENT.RATING_LABEL}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                aria-pressed={rating >= star}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    rating >= star
                      ? "text-primary fill-primary"
                      : "text-muted-foreground/30 hover:text-primary",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {FEEDBACK_PAGE_CONTENT.MESSAGE_LABEL}
          </label>
          <Textarea
            placeholder={FEEDBACK_PAGE_CONTENT.MESSAGE_PLACEHOLDER}
            className="min-h-[160px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button
          className="w-full font-semibold"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Sending…" : FEEDBACK_PAGE_CONTENT.SUBMIT}
        </Button>

        <p className="text-[0.6875rem] text-muted-foreground text-center">
          {FEEDBACK_PAGE_CONTENT.REQUEST_FEATURE_PROMPT}{" "}
          <a href={ROUTES.REQUEST_FEATURE} className="text-primary font-medium">
            {FEEDBACK_PAGE_CONTENT.REQUEST_FEATURE_LINK}
          </a>
          .
        </p>
      </div>
    </StaticPageLayout>
  );
}
