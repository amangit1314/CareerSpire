'use client';

import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Video, Square, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoRecorderHandle {
    startRecording: () => void;
    stopRecording: () => void;
}

interface VideoRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    maxDuration?: number; // in seconds
    className?: string;
    autoStart?: boolean;
}

export const VideoRecorder = forwardRef<VideoRecorderHandle, VideoRecorderProps>(({
    onRecordingComplete,
    maxDuration = 300, // 5 minutes default
    className,
    autoStart = false
}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Initialize stream
    useEffect(() => {
        initStream();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setDuration(d => {
                    if (d >= maxDuration) {
                        stopRecording();
                        return d;
                    }
                    return d + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused, maxDuration]);

    const initStream = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Failed to access camera and microphone');
            console.error('Stream init error:', err);
        }
    };

    const supportedMediaRecorder = useRef<MediaRecorder | null>(null);

    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording
    }));

    useEffect(() => {
        if (autoStart && stream && !isRecording && !recordedBlob) {
            startRecording();
        }
    }, [autoStart, stream, isRecording, recordedBlob]);

    const startRecording = useCallback(() => {
        if (!stream) return;

        chunksRef.current = [];
        setRecordedBlob(null);
        setDuration(0);

        const mimeTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4'
        ];

        const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

        if (!supportedType) {
            setError('No supported video format found in this browser');
            return;
        }

        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: supportedType
        });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setRecordedBlob(blob);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // Collect data every second
        setIsRecording(true);
        setIsPaused(false);
    }, [stream]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    }, [isRecording]);

    const togglePause = useCallback(() => {
        if (!mediaRecorderRef.current) return;

        if (isPaused) {
            mediaRecorderRef.current.resume();
        } else {
            mediaRecorderRef.current.pause();
        }
        setIsPaused(!isPaused);
    }, [isPaused]);

    const resetRecording = useCallback(() => {
        setRecordedBlob(null);
        setDuration(0);
        setIsRecording(false);
        setIsPaused(false);
        chunksRef.current = [];

        // Re-attach live stream to video
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const submitRecording = useCallback(() => {
        if (recordedBlob) {
            onRecordingComplete(recordedBlob);
        }
    }, [recordedBlob, onRecordingComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = (duration / maxDuration) * 100;

    if (error) {
        return (
            <div className={cn("flex items-center justify-center p-8 text-center", className)}>
                <div className="space-y-4">
                    <Video className="h-12 w-12 mx-auto text-destructive" />
                    <p className="text-destructive">{error}</p>
                    <Button onClick={initStream} variant="outline">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Video Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                <video
                    ref={videoRef}
                    autoPlay={!recordedBlob}
                    muted={!recordedBlob}
                    controls={!!recordedBlob}
                    playsInline
                    className="w-full h-full object-cover -scale-x-100"
                    src={recordedBlob ? URL.createObjectURL(recordedBlob) : undefined}
                />

                {/* Recording indicator */}
                {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <motion.div
                            animate={{ opacity: isPaused ? 0.5 : [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="h-3 w-3 rounded-full bg-red-500"
                        />
                        <span className="text-white text-sm font-medium drop-shadow-lg">
                            {isPaused ? 'PAUSED' : 'REC'}
                        </span>
                    </div>
                )}

                {/* Duration display */}
                <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-black/50 text-white text-sm font-mono">
                        {formatTime(duration)} / {formatTime(maxDuration)}
                    </span>
                </div>

                {/* Progress bar */}
                {isRecording && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <motion.div
                            className={cn("h-full", progressPercentage > 90 ? "bg-red-500" : "bg-primary")}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                {!isRecording && !recordedBlob && (
                    <Button
                        onClick={startRecording}
                        size="lg"
                        className="gap-2 shadow-lg shadow-primary/20"
                    >
                        <Video className="h-5 w-5" />
                        Start Recording
                    </Button>
                )}

                {isRecording && (
                    <>
                        <Button
                            onClick={togglePause}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                        >
                            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <Button
                            onClick={stopRecording}
                            variant="destructive"
                            size="lg"
                            className="gap-2"
                        >
                            <Square className="h-5 w-5" />
                            Stop
                        </Button>
                    </>
                )}

                {recordedBlob && (
                    <>
                        <Button
                            onClick={resetRecording}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Re-record
                        </Button>
                        <Button
                            onClick={submitRecording}
                            size="lg"
                            className="gap-2 shadow-lg shadow-primary/20"
                        >
                            Submit Recording
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
});
