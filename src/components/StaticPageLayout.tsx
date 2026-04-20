'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dmSans, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import {
    Shield,
    FileText,
    CreditCard,
    XCircle,
    Cookie,
    Scale,
    ChevronRight,
    Mail,
} from 'lucide-react';

interface StaticPageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    lastUpdated?: string;
}

const LEGAL_NAV = [
    { name: 'Privacy Policy', href: '/privacy-policy', icon: Shield },
    { name: 'Terms of Service', href: '/terms-of-service', icon: FileText },
    { name: 'Refund & Billing', href: '/refund-billing', icon: CreditCard },
    { name: 'Cancellation', href: '/cancellation-policy', icon: XCircle },
    { name: 'Cookie Policy', href: '/cookie-policy', icon: Cookie },
    { name: 'License', href: '/license', icon: Scale },
] as const;

export function StaticPageLayout({
    title,
    subtitle,
    children,
    className,
    lastUpdated,
}: StaticPageLayoutProps) {
    const pathname = usePathname();
    const isLegalPage = LEGAL_NAV.some((item) => pathname === item.href);

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 pt-10 sm:pt-14 pb-24 sm:pb-32">

                {/* ── Header ── */}
                <header className="mb-8 sm:mb-10 max-w-4xl">
                    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                        {isLegalPage && (
                            <>
                                <span className="text-muted-foreground">Legal</span>
                                <ChevronRight className="h-3 w-3 shrink-0" />
                            </>
                        )}
                        <span className="font-medium text-foreground truncate">{title}</span>
                    </nav>

                    <h1 className={cn(dmSans.className, 'text-3xl sm:text-4xl font-bold tracking-tight')}>
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {lastUpdated && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground border border-border/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Updated {lastUpdated}
                        </div>
                    )}
                </header>

                {/* ── Body ── */}
                {isLegalPage ? (
                    <div className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-4 md:gap-12 lg:gap-16">
                        {/* Sidebar — stacks above content on mobile, left column on md+ */}
                        <aside>
                            <div className="md:sticky md:top-20">
                                {/* Nav links — horizontal pills on mobile, vertical list on md+ */}
                                <p className={cn(dmSans.className, 'hidden md:block text-[0.625rem] uppercase tracking-[0.18em] font-bold text-muted-foreground/40 mb-3 px-3')}>
                                    Legal
                                </p>

                                <div className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                                    {LEGAL_NAV.map((item) => {
                                        const active = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-[0.8125rem] whitespace-nowrap md:whitespace-normal transition-colors',
                                                    // Mobile: pill style
                                                    'border md:border-0',
                                                    // Shared
                                                    active
                                                        ? 'bg-primary/10 text-primary font-semibold border-primary/20 md:border-0'
                                                        : 'text-muted-foreground border-border md:border-0 hover:bg-muted/40 hover:text-foreground',
                                                )}
                                            >
                                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Contact card */}
                                <div className="hidden md:block mt-6 rounded-xl border border-border/60 bg-card/40 p-4">
                                    <p className={cn(dmSans.className, 'text-xs font-bold mb-1')}>Questions?</p>
                                    <p className="text-[0.6875rem] text-muted-foreground leading-relaxed mb-2.5">
                                        Reach out for any legal or billing inquiries.
                                    </p>
                                    <a
                                        href="mailto:gitaman8481@gmail.com"
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <Mail className="h-3 w-3 shrink-0" />
                                        gitaman8481@gmail.com
                                    </a>
                                </div>
                            </div>
                        </aside>

                        {/* Content */}
                        <article className={cn(inter.className, 'min-w-0 max-w-3xl pb-12', className)}>
                            <div className="legal-content space-y-2.5">
                                {children}
                            </div>
                        </article>
                    </div>
                ) : (
                    <article className={cn(inter.className, 'pb-12', className)}>
                        <div className="legal-content space-y-2.5">
                            {children}
                        </div>
                    </article>
                )}
            </div>

            <style jsx global>{`
                .legal-content section {
                    padding-bottom: 1.25rem;
                    border-bottom: 1px solid hsl(var(--border) / 0.3);
                }
                .legal-content section:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .legal-content h2 {
                    font-size: 1.125rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: hsl(var(--foreground));
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                }
                .legal-content h3 {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: hsl(var(--foreground) / 0.85);
                    margin-top: 1rem;
                    margin-bottom: 0.25rem;
                    line-height: 1.4;
                }
                .legal-content p {
                    font-size: 0.875rem;
                    line-height: 1.75;
                    color: hsl(var(--muted-foreground));
                    margin-bottom: 0.5rem;
                }
                .legal-content ul,
                .legal-content ol {
                    padding-left: 1.5rem;
                    margin: 0.375rem 0 0.625rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                }
                .legal-content ul {
                    list-style: disc;
                }
                .legal-content ol {
                    list-style: decimal;
                }
                .legal-content ul li,
                .legal-content ol li {
                    font-size: 0.875rem;
                    line-height: 1.7;
                    color: hsl(var(--muted-foreground));
                }
                .legal-content ul li::marker {
                    color: hsl(var(--primary) / 0.5);
                }
                .legal-content ol li::marker {
                    color: hsl(var(--muted-foreground) / 0.5);
                    font-weight: 500;
                }
                .legal-content strong {
                    font-weight: 600;
                    color: hsl(var(--foreground));
                }
                .legal-content a {
                    color: hsl(var(--primary));
                    font-weight: 500;
                    text-decoration: none;
                }
                .legal-content a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
