'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AIInterviewer } from '@/components/AIInterviewer';
import { VideoRecorder, VideoRecorderHandle } from '@/components/VideoRecorder';
import { ChevronRight, Clock, CheckCircle2, Loader2, Share2, Lock, Unlock, Mic, MicOff } from 'lucide-react';
import { saveVideoRecording, toggleVideoPublic, submitVideoAnswer } from '@/app/actions/video.actions';
import { getMockSessionAction } from '@/app/actions/mock.actions';
import { createMediaUploadUrlAction } from '@/app/actions/media.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { HRQuestion, MockSession } from '@/types';

// Speech Recognition Type (for convenience)
const Recognition = typeof window !== 'undefined' ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

interface MappedQuestion extends HRQuestion {
    id: string;
}

interface AnswerFeedback {
    questionIndex: number;
    score: number;
    feedback: any;
}

export default function VideoInterviewSession() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const sessionId = params.id as string;
    const recorderRef = useRef<VideoRecorderHandle>(null);

    const [session, setSession] = useState<MockSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [phase, setPhase] = useState<'question' | 'answering' | 'complete' | 'bridging'>('question');
    const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isVoiceMode, setIsVoiceMode] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptRef = useRef('');
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [answerFeedbacks, setAnswerFeedbacks] = useState<AnswerFeedback[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const resetSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (isVoiceMode && phase === 'answering') {
            silenceTimerRef.current = setTimeout(() => {
                console.log('Silence detected - auto-finishing answer');
                handleFinishAnswer();
            }, 3500); // 3.5 seconds of silence
        }
    }, [isVoiceMode, phase]);

    useEffect(() => {
        if (Recognition && isVoiceMode) {
            const rec = new Recognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event: any) => {
                resetSilenceTimer();
                let finalText = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalText += event.results[i][0].transcript + ' ';
                    }
                }
                if (finalText) {
                    setTranscript(prev => {
                        const updated = prev + finalText;
                        transcriptRef.current = updated;
                        return updated;
                    });
                }
            };

            rec.onend = () => {
                // Restart if still in answering phase and voice mode is on
                if (phase === 'answering' && isVoiceMode) {
                    try { rec.start(); } catch (e) { }
                }
            };

            setRecognition(rec);
        }

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, [isVoiceMode, phase, resetSilenceTimer]);

    useEffect(() => {
        if (isAuthLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login?callback=' + encodeURIComponent(window.location.pathname));
            return;
        }

        async function loadSession() {
            try {
                const data = await getMockSessionAction(user!.id, sessionId);
                setSession(data);
                setIsPublic(data.isPublic || false);
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSession();
    }, [sessionId, user, isAuthenticated, isAuthLoading, router]);

    // Map DB questions to HRQuestion shape for VIDEO sessions
    const rawQuestions = session?.questions || [];
    const mappedQuestions: MappedQuestion[] = rawQuestions.map(q => ({
        id: q.id,
        question: q.description,
        category: q.topic,
        guidance: q.hints?.[0] || '',
        expectedTimeMinutes: (q as any).expectedTimeMinutes || 10,
    }));
    const currentQuestion = mappedQuestions[currentQuestionIndex] || null;
    const progress = mappedQuestions.length > 0 ? ((currentQuestionIndex) / mappedQuestions.length) * 100 : 0;

    // Timer
    useEffect(() => {
        if (phase === 'complete' || isLoading) return;
        const timer = setInterval(() => {
            setElapsedTime(t => t + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, isLoading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSpeechComplete = () => {
        // AI finished asking, now user can answer
        setPhase('answering');
        setQuestionStartTime(Date.now());
        if (isVoiceMode && recognition) {
            try {
                recognition.start();
            } catch (e) { console.error('Recognition error:', e); }
        }
    };

    const handleRecordingComplete = useCallback((blob: Blob) => {
        setRecordedBlobs(prev => [...prev, blob]);

        // Capture transcript before clearing
        const capturedTranscript = transcriptRef.current;
        const qIndex = currentQuestionIndex;
        const questionId = mappedQuestions[qIndex]?.id;
        setTranscript('');
        transcriptRef.current = '';

        if (recognition) {
            try { recognition.stop(); } catch (e) { }
        }

        // Move to bridging phrase or complete
        const isNextQuestion = currentQuestionIndex < mappedQuestions.length - 1;
        setPhase(isNextQuestion ? 'bridging' : 'complete');

        // Evaluate answer in background (non-blocking)
        if (user && questionId && capturedTranscript) {
            const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
            setIsEvaluating(true);
            submitVideoAnswer(user.id, sessionId, questionId, capturedTranscript, timeSpent)
                .then(result => {
                    setAnswerFeedbacks(prev => [...prev, {
                        questionIndex: qIndex,
                        score: result.score,
                        feedback: result.feedback,
                    }]);
                })
                .catch(err => {
                    console.error('Failed to evaluate answer:', err);
                })
                .finally(() => {
                    setIsEvaluating(false);
                });
        }

        if (isNextQuestion) {
            // Bridging delay
            setTimeout(() => {
                setCurrentQuestionIndex(i => i + 1);
                setPhase('question');
            }, 3000); // 3 seconds of bridging/AI response
        }
    }, [currentQuestionIndex, mappedQuestions, recognition, user, sessionId, questionStartTime]);

    const handleFinishAnswer = () => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording();
        }
    };

    const handleFinishInterview = async () => {
        if (!user) return;
        setIsUploading(true);
        try {
            // Combine all blobs into one video
            const combinedBlob = new Blob(recordedBlobs, { type: 'video/webm' });

            // 1. Get signed upload URL
            const { uploadUrl, path } = await createMediaUploadUrlAction({
                fileName: `interview-${sessionId}.webm`,
                contentType: 'video/webm',
                size: combinedBlob.size
            });

            // 2. Upload to Supabase Storage
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: combinedBlob,
                headers: {
                    'Content-Type': 'video/webm'
                }
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            // 3. Save resulting path to session
            await saveVideoRecording(user.id, sessionId, path);

            // Redirect to dashboard
            router.push(`/dashboard`);
        } catch (error) {
            console.error('Failed to save recording:', error);
            alert('Failed to save interview. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleTogglePublic = async () => {
        if (!user) return;
        try {
            const newStatus = await toggleVideoPublic(user.id, sessionId);
            setIsPublic(newStatus);
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen mesh-gradient flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Preparing your interview...</p>
                </div>
            </div>
        );
    }

    if (!session || mappedQuestions.length === 0 || !currentQuestion) {
        return (
            <div className="min-h-screen mesh-gradient flex items-center justify-center">
                <Card className="glass border-primary/20 max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-destructive" />
                        </div>
                        <div>
                            <h2 className={cn(dmSans.className, "text-xl font-bold")}>Session Not Found</h2>
                            <p className="text-muted-foreground mt-2">The interview session you requested could not be found or has no questions.</p>
                        </div>
                        <Button onClick={() => router.push('/mock/video')} className="w-full text-white">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (phase === 'complete') {
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
                                    Great job! You answered {mappedQuestions.length} questions in {formatTime(elapsedTime)}.
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
                                    onClick={handleTogglePublic}
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
                                    onClick={() => router.push('/community/videos')}
                                    className="flex-1"
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    View Community
                                </Button>
                                <Button
                                    onClick={handleFinishInterview}
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

    return (
        <div className="min-h-screen mesh-gradient">
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {mappedQuestions.length}
                        </div>
                        <Progress value={progress} className="w-32 h-2" />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
                    </div>
                </div>

                {/* Main Interview Area */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* AI Interviewer Panel */}
                    <Card className="glass border-primary/10">
                        <CardContent className="p-6">
                            <div className="flex justify-end mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                                    className={cn("gap-2", isVoiceMode ? "text-primary bg-primary/10" : "text-muted-foreground")}
                                >
                                    {isVoiceMode ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                    {isVoiceMode ? 'Voice Mode: ON' : 'Voice Mode: OFF'}
                                </Button>
                            </div>

                            <AIInterviewer
                                question={
                                    phase === 'bridging'
                                        ? "Got it. Let's move to the next question."
                                        : currentQuestion.question
                                }
                                onSpeechComplete={handleSpeechComplete}
                                autoSpeak={phase === 'question' || phase === 'bridging'}
                            />

                            {/* Question metadata */}
                            {phase !== 'bridging' && (
                                <div className="mt-6 p-4 rounded-xl bg-muted/50">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium">{currentQuestion.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-2">
                                        <span className="text-muted-foreground">Expected time</span>
                                        <span className="font-medium">{currentQuestion.expectedTimeMinutes} min</span>
                                    </div>
                                    {currentQuestion.guidance && (
                                        <div className="mt-3 pt-3 border-t border-border">
                                            <p className="text-xs text-muted-foreground">
                                                Tip: {currentQuestion.guidance}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Video Recording Panel */}
                    <Card className="glass border-primary/10">
                        <CardContent className="p-6">
                            <AnimatePresence mode="wait">
                                {(phase === 'question' || phase === 'bridging') && (
                                    <motion.div
                                        key="waiting"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="aspect-video flex items-center justify-center bg-muted rounded-xl"
                                    >
                                        <div className="text-center space-y-2">
                                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                                            <p className="text-muted-foreground">
                                                {phase === 'bridging' ? 'Processing answer...' : 'Listen to the question...'}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {phase === 'answering' && (
                                    <motion.div
                                        key="recording"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <VideoRecorder
                                            ref={recorderRef}
                                            onRecordingComplete={handleRecordingComplete}
                                            maxDuration={currentQuestion.expectedTimeMinutes * 60}
                                            autoStart={true}
                                        />

                                        <div className="mt-6 p-4 border rounded-xl bg-primary/5 border-primary/10">
                                            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                                                <Mic className="h-4 w-4" />
                                                Live Transcript
                                            </div>
                                            <p className="text-sm text-muted-foreground italic">
                                                {transcript || "Waiting for your answer..."}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Next Question Button (visible after recording) */}
                            {phase === 'answering' && (
                                <div className="mt-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {isVoiceMode
                                            ? "Speak naturally. The AI will transition automatically when you stop."
                                            : "Click 'Submit Recording' once you've finished answering."
                                        }
                                    </p>
                                    {!isVoiceMode && (
                                        <Button onClick={handleFinishAnswer} className="shadow-lg shadow-primary/20">
                                            Submit Answer <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
