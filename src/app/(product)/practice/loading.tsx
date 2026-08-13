export default function PracticeLoading() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6">
                {/* Hero skeleton */}
                <div className="h-48 rounded-2xl bg-muted animate-pulse" />
                {/* Daily challenge skeleton */}
                <div className="h-20 rounded-xl bg-muted animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        {/* Filter bar */}
                        <div className="h-12 rounded-lg bg-muted animate-pulse" />
                        {/* Problem list */}
                        <div className="rounded-xl border border-border overflow-hidden bg-card">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-14 border-b border-border last:border-b-0 animate-pulse bg-muted/30"
                                />
                            ))}
                        </div>
                    </div>
                    <aside className="lg:col-span-4">
                        <div className="h-72 rounded-xl bg-muted animate-pulse" />
                    </aside>
                </div>
            </div>
        </div>
    );
}
