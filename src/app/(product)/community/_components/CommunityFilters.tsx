"use client";

import { Search, Video, FileText, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommunityContentType,
  CommunityOutcome,
  type CommunityFilterState,
} from "@/types";
import { COMMUNITY_FILTERS_CONTENT } from "@/config/content";

export type Filters = CommunityFilterState;

interface CommunityFiltersProps {
  filters: CommunityFilterState;
  facets: { companies: string[] };
  onChange: (patch: Partial<CommunityFilterState>) => void;
}

const TYPE_OPTIONS: {
  value: CommunityFilterState["type"];
  label: string;
  icon: typeof Video;
}[] = [
  {
    value: CommunityContentType.ALL,
    label: COMMUNITY_FILTERS_CONTENT.TYPE_ALL,
    icon: Sparkles,
  },
  {
    value: CommunityContentType.EXPERIENCES,
    label: COMMUNITY_FILTERS_CONTENT.TYPE_EXPERIENCES,
    icon: FileText,
  },
  {
    value: CommunityContentType.VIDEOS,
    label: COMMUNITY_FILTERS_CONTENT.TYPE_VIDEOS,
    icon: Video,
  },
];

const OUTCOME_OPTIONS: {
  value: CommunityFilterState["outcome"];
  label: string;
  color: string;
}[] = [
  {
    value: CommunityOutcome.ALL,
    label: COMMUNITY_FILTERS_CONTENT.OUTCOME_ANY,
    color: "text-foreground",
  },
  {
    value: CommunityOutcome.OFFERED,
    label: COMMUNITY_FILTERS_CONTENT.OUTCOME_OFFERED,
    color: "text-success",
  },
  {
    value: CommunityOutcome.REJECTED,
    label: COMMUNITY_FILTERS_CONTENT.OUTCOME_REJECTED,
    color: "text-destructive",
  },
  {
    value: CommunityOutcome.PENDING,
    label: COMMUNITY_FILTERS_CONTENT.OUTCOME_PENDING,
    color: "text-warning",
  },
];

export function CommunityFilters({
  filters,
  facets,
  onChange,
}: CommunityFiltersProps) {
  const hasActiveFilters =
    filters.type !== CommunityContentType.ALL ||
    filters.company !== "" ||
    filters.outcome !== CommunityOutcome.ALL ||
    filters.search !== "";

  const clearAll = () =>
    onChange({
      type: CommunityContentType.ALL,
      company: "",
      outcome: CommunityOutcome.ALL,
      search: "",
    });

  return (
    <div className="space-y-3">
      {/* Search + outcome pill — one row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={COMMUNITY_FILTERS_CONTENT.SEARCH_PLACEHOLDER}
            className={cn(
              "w-full pl-9 pr-9 py-2 rounded-lg text-sm",
              "bg-background border border-border",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
              "transition-colors",
            )}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: "" })}
              aria-label={COMMUNITY_FILTERS_CONTENT.CLEAR_SEARCH_ARIA}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Outcome select */}
        <select
          value={filters.outcome}
          onChange={(e) =>
            onChange({
              outcome: e.target.value as CommunityFilterState["outcome"],
            })
          }
          className={cn(
            "text-sm px-3 py-2 rounded-lg cursor-pointer",
            "bg-background border border-border",
            "focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
            "transition-colors",
          )}
        >
          {OUTCOME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Type chips + company chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Content type */}
        {TYPE_OPTIONS.map((opt) => {
          const active = filters.type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ type: opt.value })}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors cursor-pointer",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-foreground/70 hover:bg-primary/10 hover:text-primary",
              )}
            >
              <opt.icon className="h-3 w-3" />
              {opt.label}
            </button>
          );
        })}

        {facets.companies.length > 0 && (
          <>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden />
            <span className="text-[0.625rem] uppercase tracking-wider text-muted-foreground font-semibold mr-1">
              {COMMUNITY_FILTERS_CONTENT.COMPANY_LABEL}
            </span>
            {facets.companies.slice(0, 8).map((c) => {
              const active = filters.company.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ company: active ? "" : c })}
                  className={cn(
                    "text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors cursor-pointer",
                    active
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "bg-muted/60 text-foreground/70 hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  {c}
                </button>
              );
            })}
          </>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 text-[0.6875rem] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
            {COMMUNITY_FILTERS_CONTENT.CLEAR}
          </button>
        )}
      </div>
    </div>
  );
}
