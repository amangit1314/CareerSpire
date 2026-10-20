# Design Language

What "product-grade" means for this app, and the specific patterns that
signal the opposite ("AI slop"). Written after auditing the token system
(good, keep) against actual page composition (inconsistent, the real
problem) on 2026-08-14.

## Foundation (already good — don't touch)

- Colors: OKLCH tokens in `globals.css` (`--primary`, `--background`,
  `--card`, `--muted`, `--border`, ...), wired through `tailwind.config.ts`.
  Light/dark both defined. Use these tokens, never raw hex/rgb.
- Radius scale: `--radius` (0.625rem) with `-sm/md/lg/xl/2xl/3xl/4xl`
  derived from it. One knob controls the whole app's roundedness.
- Buttons: `src/components/ui/button.tsx` (shadcn `cva`) already defines
  `default/destructive/outline/secondary/ghost/link` × `default/sm/lg/icon`.
  This is the actual system — use it.

## Anti-patterns found repeated across the app (fix on sight, don't add more)

Confirmed via grep, not guesswork — these appear in **9+ files each**, not
just the landing page:

1. **Mesh-gradient blob backgrounds** (`.mesh-gradient` + blurred
   `rounded-full` divs behind hero sections). This is the single most
   recognizable "AI-generated template" tell in 2026 SaaS design.
2. **Badge pills** — `rounded-full bg-primary/10 border border-primary/20`
   wrapping a `Sparkles` icon + label ("AI-Powered X"). Decorative, says
   nothing a reader couldn't infer from the page itself.
3. **Icon-in-colored-box soup** — `w-10 h-10 rounded-lg bg-{color}-500/10`
   wrapping a Lucide icon, one per feature card, each a different color.
   Reads as a bento-grid template, not a considered hierarchy.
4. **Ad-hoc button overrides** — `h-14 px-10 rounded-2xl ...` written
   inline instead of using `Button`'s `size="lg"` + a variant. Every hero
   CTA reinvents its own button instead of extending the one system.

## What "product-grade" looks like instead (Linear / Vercel / Raycast / Stripe pattern)

- **Real product screenshots do the talking**, not icon decoration. A
  feature claim next to an actual screenshot of that feature is more
  credible than any icon.
- Tight typography carries hierarchy — don't lean on color/icons/badges to
  do a heading's job.
- One primary CTA per section. Not a CTA plus three feature links plus a
  badge plus a highlight strip.
- Motion is restrained and purposeful (entrance fades, scroll-linked
  progress) — not layered ambient background animation.

## Applying this

- New UI work: check this doc before reaching for a badge pill, icon-box,
  or gradient blob — if the instinct is "add visual interest," the fix is
  usually _remove_ something, not add a decoration.
- Existing pages with these patterns (landing page confirmed; `about`,
  `pricing`, and `resources` hero also use the badge-pill pattern per grep)
  aren't all being redone right now — this doc exists so the next touch to
  any of them moves in one direction instead of adding more variance.
