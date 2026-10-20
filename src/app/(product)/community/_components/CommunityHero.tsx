"use client";

import Link from "next/link";
import type { CommunityStats } from "@/app/actions/community.actions";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Plus, Video as VideoIcon, Users } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { COMMUNITY_HERO_CONTENT } from "@/config/content";

interface CommunityHeroProps {
  stats: CommunityStats;
}

export function CommunityHero({ stats }: CommunityHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 sm:p-8">
      <div className="relative max-w-3xl">
        <span className="inline-flex items-center gap-1.5 text-primary text-[0.6875rem] font-semibold uppercase tracking-wider mb-3">
          <Users className="h-3 w-3" />
          {COMMUNITY_HERO_CONTENT.EYEBROW}
        </span>

        <h1
          className={cn(
            dmSans.className,
            "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
          )}
        >
          {COMMUNITY_HERO_CONTENT.TITLE}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          {COMMUNITY_HERO_CONTENT.DESCRIPTION}
        </p>

        {/* CTA pair */}
        <div className="flex flex-wrap gap-2 mt-5">
          <Link
            href={ROUTES.COMMUNITY_NEW_EXPERIENCE}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {COMMUNITY_HERO_CONTENT.SHARE_EXPERIENCE}
          </Link>
          <Link
            href={ROUTES.MOCK_VIDEO}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <VideoIcon className="h-4 w-4 text-primary" />
            {COMMUNITY_HERO_CONTENT.RECORD_VIDEO}
          </Link>
        </div>
      </div>

      {/* Activity ribbon — inline, typographic, no boxes */}
      <ActivityRibbon stats={stats} />
    </section>
  );
}

function ActivityRibbon({ stats }: { stats: CommunityStats }) {
  return (
    <div className="relative mt-6 pt-5 border-t border-border/60">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Live pulse */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-muted-foreground">
            {COMMUNITY_HERO_CONTENT.LIVE}
          </span>
        </div>

        {/* Inline stats — number + label on separate lines for density */}
        <InlineStat
          value={stats.newThisWeek}
          label={COMMUNITY_HERO_CONTENT.NEW_THIS_WEEK}
          emphasize
        />
        <Separator />
        <InlineStat
          value={stats.offersReported}
          label={COMMUNITY_HERO_CONTENT.OFFERS_REPORTED}
        />
        <Separator />
        <InlineStat
          value={stats.memberCount}
          label={COMMUNITY_HERO_CONTENT.MEMBERS}
        />

        {/* Trending companies, inline */}
        {stats.topCompanies.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-muted-foreground mr-0.5">
                {COMMUNITY_HERO_CONTENT.TRENDING}
              </span>
              {stats.topCompanies.slice(0, 4).map((c) => (
                <Link
                  key={c.name}
                  href={`${ROUTES.COMMUNITY}?company=${encodeURIComponent(c.name)}`}
                  className="text-xs font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InlineStat({
  value,
  label,
  emphasize,
}: {
  value: number;
  label: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={cn(
          dmSans.className,
          "font-bold tabular-nums leading-none",
          emphasize
            ? "text-primary text-lg sm:text-xl"
            : "text-foreground text-base sm:text-lg",
        )}
      >
        {formatValue(value)}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function Separator() {
  return (
    <span className="hidden sm:inline-block h-4 w-px bg-border" aria-hidden />
  );
}

function formatValue(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return v.toString();
}
