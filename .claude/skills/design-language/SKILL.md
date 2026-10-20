---
name: "CareerSpire Design Language"
description: "Enforces this project's UI taste and design tokens when building or editing any page/component in CareerSpire. Use before writing or reviewing landing pages, marketing sections, hero sections, feature grids, or any new UI — prevents reintroducing mesh-gradient blobs, badge pills, icon-in-colored-box soup, and ad-hoc button overrides that read as generic AI-template output."
---

# CareerSpire Design Language

Full rationale and audit: `docs/architecture/DESIGN_LANGUAGE.md` — read it
once per session touching UI, don't re-derive it from scratch.

## Before writing any UI

1. Use existing tokens (`bg-background`, `text-foreground`, `bg-primary`,
   `border-border`, etc. from `globals.css` / `tailwind.config.ts`). Never
   raw hex/rgb.
2. Use `src/components/ui/button.tsx` variants (`size="lg"` + a `variant`)
   instead of writing inline `h-14 px-10 rounded-2xl ...` on every CTA.
3. Do NOT add: mesh-gradient blob backgrounds, `Sparkles`-in-a-pill badges,
   icon-in-a-colored-box feature cards (`w-10 h-10 rounded-lg bg-*-500/10`).
   These are the specific patterns already overused across this codebase —
   adding more increases the problem, it doesn't fit in.
4. Prefer a real product screenshot over an icon when illustrating a
   feature. If none is available yet, prefer typography/whitespace over a
   decorative icon.
5. One primary CTA per section — resist adding a badge + CTA + highlight
   strip all fighting for attention.

## When reviewing/editing existing pages

If a page already has the anti-patterns above (landing page, `about`,
`pricing`, `resources` hero all had the badge-pill pattern as of
2026-08-14), don't feel obligated to fix it as a drive-by — but never add
_more_ of the same pattern to it.
