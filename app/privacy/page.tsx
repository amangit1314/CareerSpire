import { Card, CardContent } from "@/components/ui/card";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Shield, Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center py-20 px-4">
            <Card className="glass border-primary/20 max-w-4xl w-full">
                <CardContent className="p-8 md:p-12 space-y-8">
                    <div className="space-y-4 text-center">
                        <h1 className={cn(dmSans.className, "text-4xl font-bold tracking-tight")}>
                            Privacy at Mocky
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your trust is our most valuable asset. We are committed to protecting your data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-8">
                        <div className="space-y-4 text-center p-6 rounded-xl bg-primary/5">
                            <Shield className="h-8 w-8 mx-auto text-primary" />
                            <h3 className="font-bold">Secure by Design</h3>
                            <p className="text-sm text-muted-foreground">Encryption at rest and in transit for all your interview data.</p>
                        </div>
                        <div className="space-y-4 text-center p-6 rounded-xl bg-primary/5">
                            <Lock className="h-8 w-8 mx-auto text-primary" />
                            <h3 className="font-bold">You Own Your Data</h3>
                            <p className="text-sm text-muted-foreground">We never sell your personal information to third parties.</p>
                        </div>
                        <div className="space-y-4 text-center p-6 rounded-xl bg-primary/5">
                            <Eye className="h-8 w-8 mx-auto text-primary" />
                            <h3 className="font-bold">Transparent</h3>
                            <p className="text-sm text-muted-foreground">Clear and simple privacy practices without the legalese.</p>
                        </div>
                    </div>

                    <div className="text-center pt-8">
                        <a href="/privacy-policy" className="text-primary hover:underline font-medium">
                            Read our full Privacy Policy &rarr;
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
