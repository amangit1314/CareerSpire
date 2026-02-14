import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
            <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card className="h-[600px]">
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-full w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
