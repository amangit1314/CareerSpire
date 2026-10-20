"use server";

import { sendEmail } from "@/lib/supabase/email";
import { STATIC_PAGE_LAYOUT_CONTENT } from "@/config/content";

// Support pages (report-issue, request-feature, feedback) are public routes —
// no auth required. This just emails the submission to the app's own inbox;
// no DB table/admin UI, that's out of scope (see AGENTS.md decisions log).
const SUPPORT_INBOX = STATIC_PAGE_LAYOUT_CONTENT.CONTACT_EMAIL;

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

async function sendSupportEmail(
  subject: string,
  fields: Record<string, string>,
): Promise<void> {
  const rows = Object.entries(fields)
    .filter(([, v]) => v.trim().length > 0)
    .map(
      ([k, v]) =>
        `<p><strong>${escapeHtml(k)}:</strong><br/>${escapeHtml(v).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");

  await sendEmail({
    to: SUPPORT_INBOX,
    subject,
    html: `<div style="font-family: Arial, sans-serif;">${rows}</div>`,
  });
}

export async function submitReportIssueAction(fields: {
  name: string;
  email: string;
  area: string;
  description: string;
}): Promise<void> {
  if (!fields.description.trim()) throw new Error("Description is required");
  await sendSupportEmail(`[Report Issue] ${fields.area}`, fields);
}

export async function submitRequestFeatureAction(fields: {
  title: string;
  area: string;
  problem: string;
  solution: string;
}): Promise<void> {
  if (!fields.title.trim()) throw new Error("Title is required");
  await sendSupportEmail(`[Feature Request] ${fields.title}`, fields);
}

export async function submitFeedbackAction(fields: {
  rating: string;
  message: string;
}): Promise<void> {
  if (!fields.message.trim()) throw new Error("Message is required");
  await sendSupportEmail(
    `[Feedback] Rating: ${fields.rating || "n/a"}`,
    fields,
  );
}
