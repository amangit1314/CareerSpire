// Split out of tutor.ts (a 'use server' module): Next's server-actions
// convention only allows a 'use server' file to export async functions —
// any other export (this enum included) gets silently stripped from the
// client bundle, which is what broke the build (`TutorChatFailureReason`
// "doesn't exist" even though it's right there in tutor.ts). Plain
// value/type exports live here instead, in a normal module.

/** Discriminant for `TutorChatResult`'s failure branches. */
export enum TutorChatFailureReason {
  RateLimited = "rate_limited",
  Transport = "transport",
}

/**
 * Discriminated return type for tutorChat.
 * - ok=true: markdown reply
 * - ok=false + reason=RateLimited: user hit daily cap (frontend shows soft pause)
 * - ok=false + reason=Transport: transient LLM/network failure
 */
export type TutorChatResult =
  | {
      ok: true;
      content: string;
      usage: { used: number; limit: number | null; remaining: number | null };
    }
  | {
      ok: false;
      reason: TutorChatFailureReason.RateLimited;
      usage: { used: number; limit: number; resetsAt: string };
    }
  | {
      ok: false;
      reason: TutorChatFailureReason.Transport;
      message: string;
    };
