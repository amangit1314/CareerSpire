'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Mic, Camera, ArrowRight, Sparkles, Users, Shield, Loader2 } from 'lucide-react';
import { VideoPreflightCheck } from '@/components/VideoPreflightCheck';
import { startVideoMock } from '@/app/actions/video.actions';
import { Difficulty } from '@/types/enums';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function VideoMockPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [showPreflight, setShowPreflight] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
    const [isStarting, setIsStarting] = useState(false);

    const handlePreflightReady = async () => {
        if (!isAuthenticated || !user) {
            router.push('/auth/login?callback=/mock/video');
            return;
        }

        setIsStarting(true);
        try {
            const session = await startVideoMock(user.id, selectedDifficulty);
            router.push(`/mock/video/${session.id}`);
        } catch (error: any) {
            alert(error.message || 'Failed to start video interview');
            setShowPreflight(false);
        } finally {
            setIsStarting(false);
        }
    };

    const features = [
        {
            icon: Video,
            title: 'AI-Powered Questions',
            description: 'Our AI interviewer asks real behavioral questions used in top tech companies'
        },
        {
            icon: Mic,
            title: 'Voice Recognition',
            description: 'Speak naturally - the AI listens and provides feedback on your responses'
        },
        {
            icon: Users,
            title: 'Community Learning',
            description: 'Share your interview to help others learn, or keep it private for self-review'
        },
        {
            icon: Shield,
            title: 'Safe Practice Space',
            description: 'Make mistakes without real-world consequences - that\'s how we grow'
        },
    ];

    return (
        <>
            <div className="min-h-screen mesh-gradient">
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-sm font-medium text-primary mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span>New Feature</span>
                        </div>

                        <h1 className={cn(dmSans.className, "text-4xl md:text-5xl font-bold mb-4")}>
                            Video Mock Interview
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Practice with our AI interviewer in a realistic video interview setting.
                            Get instant feedback and improve your communication skills.
                        </p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass border-primary/10 overflow-hidden">
                            <CardHeader className="text-center pb-2">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
                                    <Camera className="h-10 w-10 text-primary-foreground dark:text-white" />
                                </div>
                                <CardTitle className={cn(dmSans.className, "text-2xl")}>
                                    Ready to Practice?
                                </CardTitle>
                                <CardDescription>
                                    You'll need a working camera and microphone
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                {/* Difficulty Selection */}
                                <div>
                                    <label className="text-sm font-medium mb-3 block text-center">
                                        Select Difficulty Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((difficulty) => (
                                            <button
                                                key={difficulty}
                                                onClick={() => setSelectedDifficulty(difficulty)}
                                                className={cn(
                                                    "p-4 border rounded-xl text-center transition-all",
                                                    selectedDifficulty === difficulty
                                                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                                                        : "hover:bg-accent border-border"
                                                )}
                                            >
                                                <span className="font-medium">{difficulty}</span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {difficulty === Difficulty.EASY && '~15 min, 3 questions'}
                                                    {difficulty === Difficulty.MEDIUM && '~25 min, 5 questions'}
                                                    {difficulty === Difficulty.HARD && '~40 min, 7 questions'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Start Button */}
                                <Button
                                    onClick={() => setShowPreflight(true)}
                                    size="lg"
                                    disabled={isStarting}
                                    className={cn(
                                        dmSans.className,
                                        "w-full text-lg py-7 rounded-xl shadow-xl shadow-primary/20 dark:text-white",
                                        "hover:shadow-primary/30 transition-all group"
                                    )}
                                >
                                    {isStarting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Initializing Interview...
                                        </>
                                    ) : (
                                        <>
                                            <Video className="mr-2 h-5 w-5" />
                                            Start Video Interview
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>

                                {/* Features Grid */}
                                <div className="grid md:grid-cols-2 gap-4 pt-4">
                                    {features.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + i * 0.1 }}
                                            className="flex gap-3 p-4 rounded-xl bg-muted/50"
                                        >
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <feature.icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{feature.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Community Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-muted-foreground text-sm mb-2">
                            Join thousands of engineers practicing video interviews
                        </p>
                        <Button variant="ghost" asChild>
                            <a href="/community/videos" className="gap-2">
                                <Users className="h-4 w-4" />
                                Browse Community Interviews
                            </a>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Preflight Check Modal */}
            {showPreflight && (
                <VideoPreflightCheck
                    onReady={handlePreflightReady}
                    onCancel={() => setShowPreflight(false)}
                />
            )}
        </>
    );
}
