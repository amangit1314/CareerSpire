'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { FeedItem } from '@/app/actions/community.actions';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import {
    Building2,
    Play,
    Eye,
    Heart,
    Award,
    Video as VideoIcon,
    FileText,
    Sparkles,
    ThumbsUp,
} from 'lucide-react';

function formatRelative(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

const outcomeTone: Record<
    string,
    { rail: string; text: string; bg: string; ring: string; label: string }
> = {
    offered: {
        rail: 'before:bg-success',
        text: 'text-success',
        bg: 'bg-success/10',
        ring: 'ring-success/20',
        label: 'Offered',
    },
    accepted: {
        rail: 'before:bg-success',
        text: 'text-success',
        bg: 'bg-success/10',
        ring: 'ring-success/20',
        label: 'Offered',
    },
    rejected: {
        rail: 'before:bg-destructive',
        text: 'text-destructive',
        bg: 'bg-destructive/10',
        ring: 'ring-destructive/20',
        label: 'Rejected',
    },
    pending: {
        rail: 'before:bg-warning',
        text: 'text-warning',
        bg: 'bg-warning/10',
        ring: 'ring-warning/20',
        label: 'Pending',
    },
    ghosted: {
        rail: 'before:bg-muted-foreground',
        text: 'text-muted-foreground',
        bg: 'bg-muted',
        ring: 'ring-border',
        label: 'Ghosted',
    },
};

export function FeedCard({ item }: { item: FeedItem }) {
    if (item.kind === 'experience') return <ExperienceCard item={item} />;
    return <VideoCard item={item} />;
}

function ExperienceCard({
    item,
}: {
    item: Extract<FeedItem, { kind: 'experience' }>;
}) {
    const tone = outcomeTone[item.outcome.toLowerCase()] ?? outcomeTone.pending;

    return (
        <Link
            href={`/community/experiences/${item.id}`}
            className={cn(
                'group relative block h-full rounded-xl overflow-hidden',
                'bg-card border border-border',
                'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
                'transition-all cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                // Outcome rail on the left edge
                'before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1',
                tone.rail,
            )}
        >
            <div className="p-4 sm:p-5 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3
                                className={cn(
                                    dmSans.className,
                                    'text-sm sm:text-base font-bold truncate',
                                )}
                            >
                                {item.company}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                                {item.role}
                            </p>
                        </div>
                    </div>
                    <span
                        className={cn(
                            'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ring-1',
                            tone.bg,
                            tone.text,
                            tone.ring,
                        )}
                    >
                        {tone.label}
                    </span>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-[0.6875rem] text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                        <Award className="h-3 w-3 text-primary" />
                        {item.rounds} {item.rounds === 1 ? 'round' : 'rounds'}
                    </span>
                    <span className="inline-flex items-center gap-1 capitalize">
                        <Sparkles className="h-3 w-3" />
                        {item.difficulty.toLowerCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 capitalize">
                        <FileText className="h-3 w-3" />
                        {item.interviewType}
                    </span>
                </div>

                {/* Tips preview */}
                <blockquote className="relative text-xs sm:text-sm text-foreground/85 italic leading-relaxed mb-4 line-clamp-3 pl-3 border-l-2 border-primary/30 flex-1">
                    {item.tips}
                </blockquote>

                {/* Footer */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Avatar user={item.user} />
                        <span className="text-xs font-medium truncate">
                            {item.user?.name ?? 'Anonymous'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[0.6875rem] text-muted-foreground">
                        {item.likes > 0 && (
                            <span className="inline-flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {item.likes}
                            </span>
                        )}
                        <span>{formatRelative(item.createdAt)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function VideoCard({ item }: { item: Extract<FeedItem, { kind: 'video' }> }) {
    return (
        <Link
            href={`/community/videos/${item.id}`}
            className={cn(
                'group relative block h-full rounded-xl overflow-hidden',
                'bg-card border border-border',
                'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
                'transition-all cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
        >
            {/* Thumbnail */}
            <div className="aspect-video relative bg-muted overflow-hidden">
                {item.thumbnailUrl ? (
                    <Image
                        src={item.thumbnailUrl}
                        alt="Interview recording"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                        <VideoIcon className="h-10 w-10 text-primary/40" />
                    </div>
                )}

                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-300">
                        <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                </div>

                {/* Kind badge — identify the card type at a glance */}
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-[0.625rem] font-semibold uppercase tracking-wider">
                    <VideoIcon className="h-2.5 w-2.5" />
                    Video
                </span>

                {/* Difficulty */}
                <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-[0.625rem] font-semibold uppercase tracking-wider">
                    {item.difficulty}
                </span>
            </div>

            {/* Footer */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3 min-w-0">
                    <Avatar user={item.user} />
                    <span
                        className={cn(
                            dmSans.className,
                            'text-sm font-semibold truncate',
                        )}
                    >
                        {item.user?.name ?? 'Anonymous'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-[0.6875rem] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {item.likes}
                        </span>
                    </div>
                    <span>{formatRelative(item.createdAt)}</span>
                </div>
            </div>
        </Link>
    );
}

function Avatar({ user }: { user: { name: string | null; image: string | null } | null }) {
    if (user?.image) {
        return (
            <div className="shrink-0 h-6 w-6 rounded-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={user.image}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }
    const initial = user?.name?.[0]?.toUpperCase() ?? '?';
    return (
        <div className="shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[0.625rem] font-bold">
            {initial}
        </div>
    );
}
