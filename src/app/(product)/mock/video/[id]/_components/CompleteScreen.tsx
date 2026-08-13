import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Lock, Share2, Unlock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { AnswerFeedback } from '../types';

interface CompleteScreenProps {
    questionCount: number;
    elapsedTimeLabel: string;
    answerFeedbacks: AnswerFeedback[];
    isEvaluating: boolean;
    isPublic: boolean;
    isUploading: boolean;
    onTogglePublic: () => void;
    onViewCommunity: () => void;
    onFinish: () => void;
}

export function CompleteScreen({
    questionCount,
    elapsedTimeLabel,
    answerFeedbacks,
    isEvaluating,
    isPublic,
    isUploading,
    onTogglePublic,
    onViewCommunity,
    onFinish,
}: CompleteScreenProps) {
    const avgScore = answerFeedbacks.length > 0
        ? Math.round(answerFeedbacks.reduce((s, f) => s + f.score, 0) / answerFeedbacks.length)
        : null;

    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg mx-4"
            >
                <Card className="glass border-primary/20">
                    <CardContent className="p-8 text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
                        >
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </motion.div>

                        <div>
                            <h2 className={cn(dmSans.className, "text-2xl font-bold mb-2")}>
                                Interview Complete!
                            </h2>
                            <p className="text-muted-foreground">
                                Great job! You answered {questionCount} questions in {elapsedTimeLabel}.
                            </p>
                        </div>

                        {/* AI Feedback Summary */}
                        {answerFeedbacks.length > 0 && (
                            <div className="space-y-3 text-left">
                                <h3 className="font-semibold text-center">Performance Summary</h3>
                                {avgScore !== null && (
                                    <div className="text-center mb-2">
                                        <span className={cn(
                                            "text-3xl font-bold",
                                            avgScore >= 70 ? "text-green-500" : avgScore >= 40 ? "text-yellow-500" : "text-red-500"
                                        )}>
                                            {avgScore}
                                        </span>
                                        <span className="text-muted-foreground">/100</span>
                                    </div>
                                )}
                                {answerFeedbacks.map((af, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Q{af.questionIndex + 1}</span>
                                            <span className={cn(
                                                "text-sm font-bold",
                                                af.score >= 70 ? "text-green-500" : af.score >= 40 ? "text-yellow-500" : "text-red-500"
                                            )}>
                                                {af.score}/100
                                            </span>
                                        </div>
                                        {af.feedback?.strengths?.length > 0 && (
                                            <p className="text-xs text-green-600">+ {af.feedback.strengths[0]}</p>
                                        )}
                                        {af.feedback?.improvements?.length > 0 && (
                                            <p className="text-xs text-orange-600">- {af.feedback.improvements[0]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isEvaluating && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Evaluating your last answer...
                            </div>
                        )}

                        {/* Visibility Toggle */}
                        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                            <p className="text-sm font-medium">Share with Community?</p>
                            <Button
                                variant={isPublic ? "default" : "outline"}
                                onClick={onTogglePublic}
                                className="gap-2"
                            >
                                {isPublic ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                {isPublic ? 'Public - Others can view' : 'Private - Only you'}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Making your interview public helps others learn from your experience
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={onViewCommunity}
                                className="flex-1"
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                View Community
                            </Button>
                            <Button
                                onClick={onFinish}
                                disabled={isUploading}
                                className="flex-1 shadow-lg shadow-primary/20"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Finish & Save'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
