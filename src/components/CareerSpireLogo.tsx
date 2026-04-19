import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';

interface CareerSpireLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
}

const sizeMap = {
    sm: { tile: 'w-7 h-7 rounded-[0.5rem]', text: 'text-lg', gap: 'gap-2' },
    md: { tile: 'w-9 h-9 rounded-[0.625rem]', text: 'text-xl sm:text-2xl', gap: 'gap-2.5' },
    lg: { tile: 'w-11 h-11 rounded-[0.75rem]', text: 'text-2xl sm:text-3xl', gap: 'gap-3' },
    xl: { tile: 'w-14 h-14 rounded-[0.875rem]', text: 'text-3xl sm:text-4xl', gap: 'gap-3' },
} as const;

export function CareerSpireLogo({ className, size = 'md', showText = true }: CareerSpireLogoProps) {
    const s = sizeMap[size];

    return (
        <div className={cn('flex items-center', s.gap, className)}>
            {/* Active mark — CS letter monogram (professional, geometric) */}
            <MonogramMark className={s.tile} />

            {/* Previous experiments — kept as fallbacks. */}
            {/* <SpiralMark className={s.tile} /> */}
            {/* <SpireMark className={s.tile} /> */}

            {showText && (
                <span
                    className={cn(
                        'font-bold tracking-tight bg-clip-text text-transparent select-none',
                        'bg-gradient-to-r from-primary via-primary to-primary/85',
                        s.text,
                        dmSans.className,
                    )}
                >
                    Career<span className="font-black">Spire</span>
                </span>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Active: CS Monogram mark — clean & minimal
// A geometric C wraps a balanced S, both drawn as flat white strokes with
// identical weight and rounded caps. No gradients, no masks, no shadows —
// just two confident shapes on a premium gradient tile.
// ---------------------------------------------------------------------------

function MonogramMark({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                'relative inline-flex items-center justify-center overflow-hidden',
                'shadow-md shadow-primary/25',
                'ring-1 ring-white/10',
                className,
            )}
            style={{
                background:
                    'linear-gradient(140deg, oklch(0.66 0.22 262) 0%, oklch(0.48 0.25 265) 100%)',
            }}
        >
            <svg
                viewBox="0 0 40 40"
                className="relative h-[64%] w-[64%]"
                fill="none"
                stroke="white"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* C — clean geometric arc opening to the right */}
                <path d="M 29 11 A 12 12 0 1 0 29 29" />

                {/* S — two-curve inflection, nested inside the C with equal
                    stroke weight for a unified monogram. */}
                <path d="M 24 14 C 17 13, 14.5 17, 18.5 20 C 22 22.5, 22 26, 15 27" />
            </svg>
        </span>
    );
}

// ---------------------------------------------------------------------------
// Fallback: 3D ribbon spiral mark
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SpiralMark({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                'relative inline-flex items-center justify-center overflow-hidden',
                'shadow-lg shadow-primary/30',
                'ring-1 ring-white/15 dark:ring-white/10',
                className,
            )}
            style={{
                background:
                    'linear-gradient(140deg, oklch(0.72 0.21 262) 0%, oklch(0.55 0.26 262) 55%, oklch(0.40 0.24 270) 100%)',
            }}
        >
            {/* Glassy top highlight */}
            <span
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 100%)',
                }}
            />

            {/* Soft radial bloom behind the spiral, gives the mark its glow */}
            <span
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                    background:
                        'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)',
                }}
            />

            {/* The spiral mark */}
            <svg
                viewBox="0 0 40 40"
                className="relative h-[68%] w-[68%]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="spiralRibbon" x1="0" y1="0" x2="40" y2="40">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="55%" stopColor="white" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.55" />
                    </linearGradient>
                    <linearGradient id="spiralHighlight" x1="0" y1="0" x2="0" y2="40">
                        <stop offset="0%" stopColor="white" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    <filter id="spiralShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" />
                        <feOffset dx="0" dy="0.6" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main ribbon spiral — direction reversed so the inner curl is the
                    quiet open end, and the OUTER side trails out into a cursive-S
                    flourish that descends to the bottom of the tile. */}
                <path
                    d="M 18.4 20.8
                       C 19.2 23.6, 23 24.4, 25 21.5
                       C 27 18.5, 25.5 14.6, 21.5 13
                       C 16.5 11, 10.5 15, 11.5 21
                       C 12.5 27.5, 22 30, 28 26
                       C 34 22, 33.5 14, 27.5 11.8
                       C 31.5 11.5, 34 14.2, 32.2 17.6
                       C 30.4 21, 27.6 20.8, 28.4 24.6
                       C 29.2 28.4, 32 29.4, 29 31.5"
                    stroke="url(#spiralRibbon)"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    filter="url(#spiralShadow)"
                />

                {/* Top-edge highlight stroke — sits on the cursive-S top curl
                    (the brightest catching surface in the new design). */}
                <path
                    d="M 27.5 11.8 C 31.5 11.5, 34 14.2, 32.2 17.6"
                    stroke="url(#spiralHighlight)"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.85"
                />

                {/* Tail dot — punctuates the bottom of the cursive-S */}
                <circle cx="29" cy="31.5" r="1.55" fill="white" />
            </svg>
        </span>
    );
}

// ---------------------------------------------------------------------------
// Previous: "Ascending Spire" mark.
// Kept here as a fallback. To restore: swap the mark used in the main
// component above (uncomment SpireMark, comment out SpiralMark).
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SpireMark({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                'relative inline-flex items-center justify-center overflow-hidden',
                'shadow-lg shadow-primary/30',
                'ring-1 ring-white/15 dark:ring-white/10',
                className,
            )}
            style={{
                background:
                    'linear-gradient(140deg, oklch(0.70 0.22 262) 0%, oklch(0.55 0.26 262) 55%, oklch(0.42 0.24 268) 100%)',
            }}
        >
            <span
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 100%)',
                }}
            />
            <span
                className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 w-2/3 h-1/2 rounded-full blur-md opacity-70"
                style={{
                    background:
                        'radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0))',
                }}
            />
            <svg
                viewBox="0 0 40 40"
                className="relative h-[62%] w-[62%]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect x="10" y="29" width="20" height="3" rx="1.5" fill="white" fillOpacity="0.55" />
                <rect x="14" y="23" width="12" height="3" rx="1.5" fill="white" fillOpacity="0.78" />
                <path
                    d="M20 6 L30 19 L26.2 19 L20 11 L13.8 19 L10 19 Z"
                    fill="white"
                />
                <circle cx="20" cy="3" r="1.4" fill="white" />
            </svg>
        </span>
    );
}
