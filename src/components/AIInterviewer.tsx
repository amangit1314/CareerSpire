'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIInterviewerProps {
    question: string;
    onSpeechComplete?: () => void;
    autoSpeak?: boolean;
    className?: string;
}

export function AIInterviewer({
    question,
    onSpeechComplete,
    autoSpeak = true,
    className
}: AIInterviewerProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentWord, setCurrentWord] = useState('');

    // Use a ref for onSpeechComplete to avoid re-creating speak on every parent render
    const onSpeechCompleteRef = useRef(onSpeechComplete);
    onSpeechCompleteRef.current = onSpeechComplete;

    // Track the current question being spoken to prevent cancel-triggered onend loops
    const activeQuestionRef = useRef<string | null>(null);

    // Speak the question using Web Speech API
    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window && !isMuted) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech

            // Mark this question as active — only fire onSpeechComplete for this one
            activeQuestionRef.current = text;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Get available voices and prefer a natural-sounding one
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Daniel')
            ) || voices[0];

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            const spokenText = text;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                setCurrentWord('');
                // Only fire callback if this utterance is still the active one
                // (prevents cancelled utterances from triggering the callback)
                if (activeQuestionRef.current === spokenText) {
                    activeQuestionRef.current = null;
                    onSpeechCompleteRef.current?.();
                }
            };

            // Highlight current word (approximate)
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const word = text.substring(event.charIndex, event.charIndex + event.charLength);
                    setCurrentWord(word);
                }
            };

            window.speechSynthesis.speak(utterance);
        }
    }, [isMuted]); // No longer depends on onSpeechComplete

    // Auto-speak when question changes
    useEffect(() => {
        if (autoSpeak && question) {
            // Small delay to ensure voices are loaded
            const timer = setTimeout(() => speak(question), 500);
            return () => clearTimeout(timer);
        }
    }, [question, autoSpeak, speak]);

    // Load voices on mount
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    const toggleMute = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
        setIsMuted(!isMuted);
    };

    const replayQuestion = () => {
        if (question) {
            speak(question);
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-6", className)}>
            {/* AI Avatar */}
            <motion.div
                animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
            >
                <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-primary/60",
                    "shadow-xl shadow-primary/30",
                    isSpeaking && "ring-4 ring-primary/50 ring-offset-4 ring-offset-background"
                )}>
                    <Bot className="h-12 w-12 text-primary-foreground" />
                </div>

                {/* Speaking indicator */}
                <AnimatePresence>
                    {isSpeaking && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                        >
                            <Volume2 className="h-4 w-4 text-white animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Question Display */}
            <div className="max-w-2xl w-full text-center space-y-4">
                <motion.div
                    key={question}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6"
                >
                    <p className="text-lg leading-relaxed">
                        {question.split(' ').map((word, i) => (
                            <span
                                key={i}
                                className={cn(
                                    "transition-colors duration-200",
                                    word.replace(/[.,?!]/g, '') === currentWord && "text-primary font-semibold"
                                )}
                            >
                                {word}{' '}
                            </span>
                        ))}
                    </p>
                </motion.div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleMute}
                        className="gap-2"
                    >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        {isMuted ? 'Unmute' : 'Mute'}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={replayQuestion}
                        disabled={isSpeaking}
                        className="gap-2"
                    >
                        Replay Question
                    </Button>
                </div>
            </div>
        </div>
    );
}
