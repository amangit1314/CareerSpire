'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mic, MicOff, VideoOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPreflightCheckProps {
    onReady: () => void;
    onCancel: () => void;
}

type PermissionStatus = 'pending' | 'granted' | 'denied' | 'error';

export function VideoPreflightCheck({ onReady, onCancel }: VideoPreflightCheckProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('pending');
    const [micStatus, setMicStatus] = useState<PermissionStatus>('pending');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        checkPermissions();
        return () => {
            // Cleanup stream on unmount
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const checkPermissions = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });

            setStream(mediaStream);
            setCameraStatus('granted');
            setMicStatus('granted');

            // Attach to video element
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Audio level monitoring
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(mediaStream);
            microphone.connect(analyser);
            analyser.fftSize = 256;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(Math.min(100, avg * 2));
                requestAnimationFrame(checkAudioLevel);
            };
            checkAudioLevel();

        } catch (error: unknown) {
            console.error('Permission error:', error);

            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                setCameraStatus('denied');
                setMicStatus('denied');
            } else {
                setCameraStatus('error');
                setMicStatus('error');
            }
        }
    };

    const allReady = cameraStatus === 'granted' && micStatus === 'granted';

    const getStatusIcon = (status: PermissionStatus) => {
        switch (status) {
            case 'pending':
                return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
            case 'granted':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'denied':
            case 'error':
                return <XCircle className="h-5 w-5 text-destructive" />;
        }
    };

    const handleStart = () => {
        if (allReady) {
            onReady();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-scroll overflow-hidden mx-4 glass border-primary/20">
                <div className="max-h-[80vh] overflow-y-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Pre-Interview Check</CardTitle>
                        <CardDescription>
                            Let's make sure your camera and microphone are working properly
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Video Preview */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                            {cameraStatus === 'granted' ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover -scale-x-100"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <VideoOff className="h-12 w-12 mx-auto text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {cameraStatus === 'pending' ? 'Requesting camera access...' :
                                                cameraStatus === 'denied' ? 'Camera access denied' :
                                                    'Camera not available'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Audio level indicator overlay */}
                            {micStatus === 'granted' && (
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-green-500"
                                            animate={{ width: `${audioLevel}%` }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </div>
                                    <p className="text-xs text-white/80 mt-1 text-center">Microphone Level</p>
                                </div>
                            )}
                        </div>

                        {/* Permission Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                                cameraStatus === 'granted' ? 'border-green-500/50 bg-green-500/10' :
                                    cameraStatus === 'denied' ? 'border-destructive/50 bg-destructive/10' :
                                        'border-border'
                            )}>
                                <Camera className="h-5 w-5" />
                                <div className="flex-1">
                                    <p className="font-medium">Camera</p>
                                    <p className="text-xs text-muted-foreground">
                                        {cameraStatus === 'granted' ? 'Ready' :
                                            cameraStatus === 'pending' ? 'Checking...' : 'Not available'}
                                    </p>
                                </div>
                                {getStatusIcon(cameraStatus)}
                            </div>

                            <div className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                                micStatus === 'granted' ? 'border-green-500/50 bg-green-500/10' :
                                    micStatus === 'denied' ? 'border-destructive/50 bg-destructive/10' :
                                        'border-border'
                            )}>
                                {micStatus === 'granted' ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                <div className="flex-1">
                                    <p className="font-medium">Microphone</p>
                                    <p className="text-xs text-muted-foreground">
                                        {micStatus === 'granted' ? 'Ready' :
                                            micStatus === 'pending' ? 'Checking...' : 'Not available'}
                                    </p>
                                </div>
                                {getStatusIcon(micStatus)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleStart}
                                disabled={!allReady}
                                className="flex-1 shadow-lg shadow-primary/20 dark:text-white"
                            >
                                {allReady ? 'Start Interview' : 'Waiting for permissions...'}
                            </Button>
                        </div>

                        {/* Permission denied help */}
                        <AnimatePresence>
                            {(cameraStatus === 'denied' || micStatus === 'denied') && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                                >
                                    <p className="text-sm text-destructive font-medium mb-2">
                                        Permission Required
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Please allow camera and microphone access in your browser settings, then refresh this page.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </div>
            </Card>
        </motion.div>
    );
}
