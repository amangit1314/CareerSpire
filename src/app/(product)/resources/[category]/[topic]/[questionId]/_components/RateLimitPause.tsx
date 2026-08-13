import { Hourglass } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

// ---------------------------------------------------------------------------
// Rate-limit pause screen — replaces the composer when daily cap is hit.
// Friendly, no "error" language.
// ---------------------------------------------------------------------------

function formatTimeUntil(iso: string): string {
    try {
        const target = new Date(iso).getTime();
        const now = Date.now();
        const diffMs = Math.max(0, target - now);
        const hours = Math.floor(diffMs / 3_600_000);
        const minutes = Math.floor((diffMs % 3_600_000) / 60_000);

        if (hours >= 1) return `in ~${hours}h`;
        if (minutes >= 5) return `in ~${minutes}m`;
        return 'in a moment';
    } catch {
        return 'tomorrow';
    }
}

export function RateLimitPause({
    info,
}: {
    info: { used: number; limit: number; resetsAt: string };
}) {
    const resetsInText = formatTimeUntil(info.resetsAt);

    return (
        <div className="border-t border-primary/10 bg-primary/5 px-5 py-6">
            <div className="max-w-md mx-auto text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 mb-3">
                    <Hourglass className="h-5 w-5 text-primary" />
                </div>
                <h3 className={cn(dmSans.className, 'text-base sm:text-lg font-semibold mb-1')}>
                    That&apos;s a wrap for today
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    You&apos;ve had {info.used} tutor messages today (limit: {info.limit}). Your
                    conversation is saved — pick it back up {resetsInText}.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <a
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Upgrade for more
                    </a>
                    <a
                        href={ROUTES.DASHBOARD}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                        Back to dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
