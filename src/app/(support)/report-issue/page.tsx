"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_ISSUE_PAGE_CONTENT } from "@/config/content";
import { submitReportIssueAction } from "@/app/actions/support.actions";

const AREAS = [
  "Mock Interview (Text)",
  "Mock Interview (Video)",
  "Practice Hub / Code Editor",
  "AI Tutor Chat",
  "Learning Tracks / Resources",
  "Billing / Payments",
  "Authentication / Account",
  "Community / Sharing",
  "UI / Display Issue",
  "Other",
];

export default function ReportIssuePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!description.trim()) {
      toast.error("Please describe the issue.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReportIssueAction({ name, email, area, description });
      toast.success("Thanks — we got your report and will look into it.");
      setName("");
      setEmail("");
      setArea(AREAS[0]);
      setDescription("");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send report. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StaticPageLayout
      title={REPORT_ISSUE_PAGE_CONTENT.TITLE}
      subtitle={REPORT_ISSUE_PAGE_CONTENT.SUBTITLE}
    >
      <div className="p-6 sm:p-8 rounded-xl border border-border bg-card/50 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              {REPORT_ISSUE_PAGE_CONTENT.NAME_LABEL}
            </label>
            <Input
              placeholder={REPORT_ISSUE_PAGE_CONTENT.NAME_PLACEHOLDER}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              {REPORT_ISSUE_PAGE_CONTENT.EMAIL_LABEL}
            </label>
            <Input
              type="email"
              placeholder={REPORT_ISSUE_PAGE_CONTENT.EMAIL_PLACEHOLDER}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {REPORT_ISSUE_PAGE_CONTENT.AREA_LABEL}
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
            {REPORT_ISSUE_PAGE_CONTENT.DESCRIPTION_LABEL}
          </label>
          <Textarea
            placeholder={REPORT_ISSUE_PAGE_CONTENT.DESCRIPTION_PLACEHOLDER}
            className="min-h-[140px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button
          className="w-full font-semibold"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Sending…" : REPORT_ISSUE_PAGE_CONTENT.SUBMIT}
        </Button>

        <p className="text-[0.6875rem] text-muted-foreground text-center">
          {REPORT_ISSUE_PAGE_CONTENT.EMAIL_PROMPT}{" "}
          <a
            href="mailto:gitaman8481@gmail.com"
            className="text-primary font-medium"
          >
            gitaman8481@gmail.com
          </a>
          .
        </p>
      </div>
    </StaticPageLayout>
  );
}
