import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Single-typeface system (design decision, see docs/DECISIONS.md): the app
// renders in Inter everywhere, at exactly two weights (400/600 — enforced
// globally via the --font-weight-* overrides in globals.css) and three
// semantic sizes (.text-display/.text-heading/.text-body).
//
// `dmSans` is kept as an alias to Inter, not a second font family, purely so
// the ~30 existing call sites importing it don't need a mechanical rename.
// New code should import `inter` directly; this alias may be deleted once
// those call sites are migrated.
export const dmSans = inter;
