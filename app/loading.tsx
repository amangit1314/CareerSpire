import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-primary/20" />
                <div className="w-32 h-6 rounded bg-muted" />
            </div>
            <Skeleton className="h-1 w-64 rounded-full" />
        </div>
    );
}
