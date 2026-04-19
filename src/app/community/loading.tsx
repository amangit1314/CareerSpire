export default function CommunityLoading() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 py-8 space-y-8">
                <div className="h-44 rounded-2xl bg-muted animate-pulse" />
                <div className="h-12 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
