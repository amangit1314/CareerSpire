'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, RefreshCw } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { tutorChat } from '@/app/actions/resource.actions';
import type { Question } from '@/types';
import { ThinkingDots } from './_components/ThinkingDots';
import { SoftNudge } from './_components/SoftNudge';
import { RateLimitPause } from './_components/RateLimitPause';
import { MessageBubble, type Message } from './_components/MessageBubble';
import { QUICK_ACTIONS } from './quickActions';

interface InteractivePracticeProps {
    question: Question;
    initialExplanation: string;
    category: string;
    topic: string;
}

const titleCase = (str: string) =>
    str
        .split(/[\s-_]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

export function InteractivePractice({
    question,
    initialExplanation,
    category,
    topic,
}: InteractivePracticeProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: initialExplanation },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [nudgeDismissed, setNudgeDismissed] = useState(false);
    const [rateLimitInfo, setRateLimitInfo] = useState<{
        used: number;
        limit: number;
        resetsAt: string;
    } | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Soft nudge triggers after this many *user* messages in the session.
    const SOFT_NUDGE_AT = 15;

    // Scroll the INTERNAL Radix ScrollArea viewport — not the document.
    // Using `scrollIntoView` would also scroll ancestor containers
    // (including the page), which caused the whole page to bounce.
    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]',
        ) as HTMLElement | null;
        if (!viewport) return;
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }, [messages, isTyping]);

    // Context for deciding which quick-action chips should be visible.
    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    const hasAiExplanation = messages.some(
        (m, i) => m.role === 'ai' && i > 0, // the AI message(s) beyond the opener
    );
    const availableActions = QUICK_ACTIONS.filter((a) => {
        if (a.availability === 'always') return true;
        if (a.availability === 'after-user-message') return userMessageCount > 0;
        if (a.availability === 'after-ai-explanation') return hasAiExplanation;
        return true;
    });

    const shouldShowSoftNudge =
        userMessageCount >= SOFT_NUDGE_AT && !nudgeDismissed && !isTyping;

    const isLikelyCode = (text: string) => {
        const codePatterns = [
            /[{};]/,
            /\b(function|const|let|var|class|if|for|while|import|export|return)\b/,
            /\b(console\.log|await|async|Promise|setTimeout)\b/,
            /\b(def|import|from|print|if __name__ == "__main__":)\b/,
        ];
        return codePatterns.some((p) => p.test(text)) && !text.includes('```');
    };

    const getLanguage = () => {
        if (question.language) return question.language.toLowerCase();
        const cat = category.toLowerCase();
        if (cat.includes('python')) return 'python';
        if (cat.includes('typescript') || cat.includes('ts')) return 'typescript';
        if (cat.includes('javascript') || cat.includes('js')) return 'javascript';
        if (cat.includes('java')) return 'java';
        return 'javascript';
    };

    const send = async (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed || isTyping) return;

        let userMessage = trimmed;
        if (isLikelyCode(userMessage)) {
            userMessage = `\`\`\`${getLanguage()}\n${userMessage}\n\`\`\``;
        }

        setInput('');
        const nextMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(nextMessages);
        setIsTyping(true);

        try {
            const result = await tutorChat(
                {
                    title: question.title,
                    description: question.description,
                    topic: question.topic,
                    difficulty: question.difficulty,
                    hints: question.hints,
                    codeSnippet: question.codeSnippet ?? null,
                    language: question.language ?? null,
                    expectedAnswerFormat: question.expectedAnswerFormat,
                },
                // Exclude the message we just added — the backend reads it
                // separately from `userMessage`, history is prior context.
                nextMessages.slice(0, -1),
                userMessage,
            );

            if (result.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'ai', content: result.content },
                ]);
                return;
            }

            if (result.reason === 'rate_limited') {
                // Roll back the user message so they don't see it "hanging"
                // without a response — the pause screen takes over.
                setMessages((prev) => prev.slice(0, -1));
                setRateLimitInfo(result.usage);
                return;
            }

            // transport failure → single friendly AI bubble, no toast
            setMessages((prev) => [
                ...prev,
                { role: 'ai', content: result.message },
            ]);
        } catch (error) {
            // Only reached on real network/runtime errors (server action
            // failed to invoke).
            console.error('Chat transport error:', error);
            toast.error('Connection issue — please try again in a moment');
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content: "Looks like I lost connection for a moment. Could you send that again?",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const resetConversation = () => {
        setMessages([{ role: 'ai', content: initialExplanation }]);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full glass rounded-2xl overflow-hidden border border-primary/10">
            {/* Header */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-primary/10 flex items-center justify-between bg-primary/5 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/15 rounded-lg shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h3
                            className={cn(
                                dmSans.className,
                                'font-semibold text-sm sm:text-base truncate',
                            )}
                        >
                            AI Tutor · {titleCase(topic)}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                            </span>
                            <p className="text-[0.625rem] text-muted-foreground uppercase tracking-wider font-medium">
                                Practice Mode · Live
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={resetConversation}
                    disabled={isTyping || messages.length <= 1}
                    aria-label="Reset conversation"
                    title="Reset conversation"
                    className={cn(
                        'inline-flex items-center gap-1.5 text-[0.6875rem] font-medium px-2.5 py-1.5 rounded-lg shrink-0',
                        'border border-border bg-background/40 hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                        'transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
                    )}
                >
                    <RefreshCw className="h-3 w-3" />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </div>

            {/* Chat Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-grow">
                <div className="p-4 sm:p-6 space-y-5">
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} />
                    ))}
                    {isTyping && (
                        <div className="flex gap-3 sm:gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div
                                className="bg-card border border-primary/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5"
                                role="status"
                                aria-label="AI is thinking"
                            >
                                <ThinkingDots />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Rate-limited: replace the entire composer with a friendly pause */}
            {rateLimitInfo ? (
                <RateLimitPause info={rateLimitInfo} />
            ) : (
                <>
                    {/* Soft Nudge — appears after a long conversation, non-blocking */}
                    {shouldShowSoftNudge && (
                        <SoftNudge
                            onTry={() => {
                                send('I want to take a shot at the solution now. Ready for me to share my approach.');
                                setNudgeDismissed(true);
                            }}
                            onHint={() => {
                                send('Can I have the next hint?');
                                setNudgeDismissed(true);
                            }}
                            onDismiss={() => setNudgeDismissed(true)}
                        />
                    )}

                    {/* Quick Actions — only those that make sense in current context */}
                    {availableActions.length > 0 && (
                        <div className="px-4 sm:px-5 pt-3 border-t border-primary/10 bg-primary/5">
                            <div className="flex flex-wrap gap-1.5">
                                {availableActions.map((action) => (
                                    <button
                                        key={action.label}
                                        type="button"
                                        disabled={isTyping}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => send(action.prompt)}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 text-[0.6875rem] sm:text-xs font-medium px-2.5 py-1.5 rounded-full',
                                            'bg-background/60 border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                                            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                                        )}
                                    >
                                        <action.icon className="h-3 w-3" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="px-4 sm:px-5 py-3 sm:py-4 bg-primary/5">
                        <div className="flex gap-2 items-end">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        send(input);
                                    }
                                }}
                                placeholder="Type your answer or paste code (Shift+Enter for new line)…"
                                className="bg-background border-primary/15 focus-visible:ring-primary min-h-[3rem] max-h-[12.5rem] resize-none text-sm"
                                disabled={isTyping}
                            />
                            <Button
                                size="icon"
                                onClick={() => send(input)}
                                disabled={isTyping || !input.trim()}
                                className="h-10 w-10 shrink-0 shadow-md shadow-primary/20 text-primary-foreground mb-1 cursor-pointer"
                                aria-label="Send message"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[0.625rem] text-center text-muted-foreground mt-2">
                            AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
