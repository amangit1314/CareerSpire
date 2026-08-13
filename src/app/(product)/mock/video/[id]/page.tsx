'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AIInterviewer } from '@/components/AIInterviewer';
import { VideoRecorder, VideoRecorderHandle } from '@/components/VideoRecorder';
import { ChevronRight, Clock, Loader2, Mic, MicOff } from 'lucide-react';
import { saveVideoRecording, toggleVideoPublic, submitVideoAnswer } from '@/app/actions/video.actions';
import { getMockSessionAction } from '@/app/actions/mock.actions';
import { createMediaUploadUrlAction } from '@/app/actions/media.actions';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { HRQuestion, MockSession } from '@/types';
import type { AnswerFeedback } from './types';
import { LoadingScreen } from './_components/LoadingScreen';
import { SessionNotFoundScreen } from './_components/SessionNotFoundScreen';
import { CompleteScreen } from './_components/CompleteScreen';

// Speech Recognition Type (for convenience) — Window.webkitSpeechRecognition
// is declared in src/types/global.d.ts, no cast needed.
const Recognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

interface MappedQuestion extends HRQuestion {
    id: string;
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
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptRef = useRef('');
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [answerFeedbacks, setAnswerFeedbacks] = useState<AnswerFeedback[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const questionStartTimeRef = useRef(0);
    useEffect(() => { questionStartTimeRef.current = questionStartTime; }, [questionStartTime]);

    const resetSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (isVoiceMode && phase === 'answering') {
            silenceTimerRef.current = setTimeout(() => {
                // Only auto-finish if at least 60 seconds have passed
                const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
                if (elapsed >= 60) {
                    console.log('Silence detected after 1min+ — auto-finishing answer');
                    handleFinishAnswer();
                }
                // Otherwise ignore silence — user is still within minimum time
            }, 3500); // 3.5 seconds of silence
        }
    }, [isVoiceMode, phase]);

    useEffect(() => {
        if (Recognition && isVoiceMode) {
            const rec = new Recognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event: SpeechRecognitionEvent) => {
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
        expectedTimeMinutes: q.expectedTimeMinutes || 3,
    }));
    const currentQuestion = mappedQuestions[currentQuestionIndex] || null;
    const progress = mappedQuestions.length > 0 ? ((currentQuestionIndex) / mappedQuestions.length) * 100 : 0;

    // Extract round metadata from session (stored in codingQuestions)
    const interviewMeta = (session?.codingQuestions as unknown as Array<{ mode?: string; rounds?: Array<{ name: string; type: string; startIndex: number; count: number }> }>)?.[0];
    const rounds = interviewMeta?.rounds || [];
    const currentRound = rounds.find(r => currentQuestionIndex >= r.startIndex && currentQuestionIndex < r.startIndex + r.count);

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

    const handleSpeechComplete = useCallback(() => {
        // AI finished asking, now user can answer
        setPhase('answering');
        setQuestionStartTime(Date.now());
        if (isVoiceMode && recognition) {
            try {
                recognition.start();
            } catch (e) { console.error('Recognition error:', e); }
        }
    }, [isVoiceMode, recognition]);

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
            // Try to upload video recording (optional — scores are already saved per-question)
            if (recordedBlobs.length > 0) {
                try {
                    const combinedBlob = new Blob(recordedBlobs, { type: 'video/webm' });

                    const { uploadUrl, path } = await createMediaUploadUrlAction({
                        fileName: `interview-${sessionId}.webm`,
                        contentType: 'video/webm',
                        size: combinedBlob.size
                    });

                    const uploadRes = await fetch(uploadUrl, {
                        method: 'PUT',
                        body: combinedBlob,
                        headers: { 'Content-Type': 'video/webm' }
                    });

                    if (uploadRes.ok) {
                        await saveVideoRecording(user.id, sessionId, path);
                    } else {
                        console.warn('Video upload failed, saving session without recording');
                        await saveVideoRecording(user.id, sessionId, '');
                    }
                } catch (uploadError) {
                    console.warn('Video storage unavailable, saving session without recording:', uploadError);
                    // Still mark session as completed even without video
                    await saveVideoRecording(user.id, sessionId, '');
                }
            } else {
                // No video recorded — just mark session complete
                await saveVideoRecording(user.id, sessionId, '');
            }

            router.push(`/dashboard`);
        } catch (error) {
            console.error('Failed to save interview:', error);
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
        return <LoadingScreen />;
    }

    if (!session || mappedQuestions.length === 0 || !currentQuestion) {
        return <SessionNotFoundScreen onGoBack={() => router.push('/mock/video')} />;
    }

    if (phase === 'complete') {
        return (
            <CompleteScreen
                questionCount={mappedQuestions.length}
                elapsedTimeLabel={formatTime(elapsedTime)}
                answerFeedbacks={answerFeedbacks}
                isEvaluating={isEvaluating}
                isPublic={isPublic}
                isUploading={isUploading}
                onTogglePublic={handleTogglePublic}
                onViewCommunity={() => router.push('/community/videos')}
                onFinish={handleFinishInterview}
            />
        );
    }

    return (
        <div className="min-h-screen mesh-gradient">
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {currentRound && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                {currentRound.name}
                            </span>
                        )}
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
                                            minDuration={60}
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
                                            ? "Speak naturally. After 1 min, the AI will auto-advance when you pause."
                                            : "Answer for at least 1 minute, then click Stop to submit."
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
