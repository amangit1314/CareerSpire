import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PricingLoading() {
    return (
        <div className="container mx-auto px-4 py-20 space-y-12">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="flex justify-center">
                    <Skeleton className="h-6 w-96" />
                </div>
            </div>

            <div className="flex justify-center mb-10">
                <Skeleton className="h-12 w-64 rounded-xl" />
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-[500px] border-primary/10">
                        <CardHeader className="text-center space-y-4">
                            <div className="flex justify-center">
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <div className="flex justify-center">
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex justify-center">
                                <Skeleton className="h-12 w-32" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <div key={j} className="flex gap-2">
                                        <Skeleton className="h-5 w-5 rounded-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-11 w-full rounded-xl" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
