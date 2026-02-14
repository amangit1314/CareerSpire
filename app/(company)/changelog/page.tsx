import { Card, CardContent } from "@/components/ui/card";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
    return (
        <div className="min-h-screen mesh-gradient py-20 px-4">
            <div className="container mx-auto max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <h1 className={cn(dmSans.className, "text-4xl font-bold tracking-tight")}>
                        Changelog
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        New updates and improvements to CareerSpire.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Entry 1 */}
                    <Card className="glass border-primary/20">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-6 md:items-start">
                                <div className="md:w-32 shrink-0">
                                    <span className="text-sm text-muted-foreground font-mono">Jan 25, 2026</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold">Speech Recognition Update</h2>
                                        <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-0">New</Badge>
                                    </div>
                                    <p className="text-muted-foreground">Fixed compatibility issues with SpeechRecognition API and improved voice detection accuracy during mock interviews.</p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        <li>Added global type definitions for Web Speech API</li>
                                        <li>Optimized silence detection algorithm</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Entry 2 */}
                    <Card className="glass border-primary/20">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-6 md:items-start">
                                <div className="md:w-32 shrink-0">
                                    <span className="text-sm text-muted-foreground font-mono">Jan 16, 2026</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold">AI-Powered Question Bank</h2>
                                        <Badge variant="secondary">Feature</Badge>
                                    </div>
                                    <p className="text-muted-foreground">Launched comprehensive resource section with AI-generated interview questions for JavaScript and Python.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass border-primary/20">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-6 md:items-start">
                                <div className="md:w-32 shrink-0">
                                    <span className="text-sm text-muted-foreground font-mono">Jan 01, 2026</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold">Public Launch</h2>
                                        <Badge variant="outline">Milestone</Badge>
                                    </div>
                                    <p className="text-muted-foreground">CareerSpire is now live! Start practicing your interviews with AI feedback.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
