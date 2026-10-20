"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { REQUEST_FEATURE_PAGE_CONTENT } from "@/config/content";
import { submitRequestFeatureAction } from "@/app/actions/support.actions";

const AREAS = [
  "Mock Interviews",
  "Practice Hub / DSA Problems",
  "AI Tutor",
  "Learning Tracks / Resources",
  "Video Interviews",
  "Community",
  "Gamification (XP, Coins, Streaks)",
  "Billing / Pricing",
  "Dashboard / Analytics",
  "Other",
];

export default function RequestFeaturePage() {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Please give the feature a title.");
      return;
    }
    setSubmitting(true);
    try {
      await submitRequestFeatureAction({ title, area, problem, solution });
      toast.success("Thanks — your feature request was sent.");
      setTitle("");
      setArea(AREAS[0]);
      setProblem("");
      setSolution("");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send request. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StaticPageLayout
      title={REQUEST_FEATURE_PAGE_CONTENT.TITLE}
      subtitle={REQUEST_FEATURE_PAGE_CONTENT.SUBTITLE}
    >
      <div className="p-6 sm:p-8 rounded-xl border border-border bg-card/50 space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {REQUEST_FEATURE_PAGE_CONTENT.FEATURE_TITLE_LABEL}
          </label>
          <Input
            placeholder={REQUEST_FEATURE_PAGE_CONTENT.FEATURE_TITLE_PLACEHOLDER}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {REQUEST_FEATURE_PAGE_CONTENT.AREA_LABEL}
          </label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {REQUEST_FEATURE_PAGE_CONTENT.PROBLEM_LABEL}
          </label>
          <Textarea
            placeholder={REQUEST_FEATURE_PAGE_CONTENT.PROBLEM_PLACEHOLDER}
            className="min-h-[100px]"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {REQUEST_FEATURE_PAGE_CONTENT.SOLUTION_LABEL}
          </label>
          <Textarea
            placeholder={REQUEST_FEATURE_PAGE_CONTENT.SOLUTION_PLACEHOLDER}
            className="min-h-[120px]"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
          />
        </div>

        <Button
          className="w-full font-semibold"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Sending…" : REQUEST_FEATURE_PAGE_CONTENT.SUBMIT}
        </Button>

        <p className="text-[0.6875rem] text-muted-foreground text-center">
          {REQUEST_FEATURE_PAGE_CONTENT.ROADMAP_PROMPT_PREFIX}{" "}
          <a href="/roadmap" className="text-primary font-medium">
            {REQUEST_FEATURE_PAGE_CONTENT.ROADMAP_LINK}
          </a>{" "}
          {REQUEST_FEATURE_PAGE_CONTENT.ROADMAP_PROMPT_SUFFIX}
        </p>
      </div>
    </StaticPageLayout>
  );
}
