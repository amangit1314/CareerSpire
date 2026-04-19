'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Send,
    Bot,
    User,
    Lightbulb,
    Code,
    HelpCircle,
    RotateCw,
    RefreshCw,
    Target,
    X,
    Hourglass,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { tutorChat } from '@/app/actions/resource.actions';

interface Message {
    role: 'ai' | 'user';
    content: string;
}

interface InteractivePracticeProps {
    question: any;
    initialExplanation: string;
    category: string;
    topic: string;
}

function ThinkingDots() {
    // iOS-style typing indicator: three dots bouncing in sequence.
    // Custom keyframe gives a gentler arc than Tailwind's animate-bounce.
    return (
        <span className="inline-flex items-center gap-1" aria-hidden>
            <style>{`
                @keyframes thinkingBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
                    40% { transform: translateY(-0.25rem); opacity: 1; }
                }
            `}</style>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="block rounded-full bg-primary"
                    style={{
                        width: '0.375rem',
                        height: '0.375rem',
                        animation: 'thinkingBounce 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.15}s`,
                    }}
                />
            ))}
            <span className="sr-only">AI is thinking</span>
        </span>
    );
}

type QuickAction = {
    label: string;
    prompt: string;
    icon: typeof Lightbulb;
    /** When this chip should be visible. */
    availability: 'always' | 'after-user-message' | 'after-ai-explanation';
};

const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Give me a hint',
        prompt: 'I could use a small hint — just enough to unblock me, without giving away the solution.',
        icon: Lightbulb,
        availability: 'always',
    },
    {
        label: 'Show an example',
        prompt: 'Could you show me a small code example that illustrates this concept?',
        icon: Code,
        availability: 'always',
    },
    {
        label: 'Test my understanding',
        prompt: 'Can you ask me one focused question to check my understanding of this concept?',
        icon: HelpCircle,
        availability: 'after-user-message',
    },
    {
        label: 'Explain differently',
        prompt: 'Can you re-explain your last point in a different way, ideally with an analogy?',
        icon: RotateCw,
        availability: 'after-ai-explanation',
    },
];

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
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                'flex gap-3 sm:gap-4',
                                msg.role === 'user' ? 'flex-row-reverse' : '',
                            )}
                        >
                            <div
                                className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                                    msg.role === 'ai'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div
                                className={cn(
                                    'max-w-[85%] sm:max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm',
                                    msg.role === 'ai'
                                        ? 'bg-card border border-primary/10 rounded-tl-none'
                                        : 'bg-primary text-white rounded-tr-none',
                                )}
                            >
                                <ReactMarkdown
                                    components={{
                                        h1: ({ ...props }) => (
                                            <h3
                                                className={cn(
                                                    dmSans.className,
                                                    'text-base font-bold mt-4 mb-2 first:mt-0',
                                                )}
                                                {...props}
                                            />
                                        ),
                                        h2: ({ ...props }) => (
                                            <h3
                                                className={cn(
                                                    dmSans.className,
                                                    'text-base font-bold mt-4 mb-2 first:mt-0',
                                                )}
                                                {...props}
                                            />
                                        ),
                                        h3: ({ ...props }) => (
                                            <h4
                                                className={cn(
                                                    dmSans.className,
                                                    'text-sm font-bold mt-3 mb-1.5 first:mt-0',
                                                )}
                                                {...props}
                                            />
                                        ),
                                        h4: ({ ...props }) => (
                                            <h5
                                                className={cn(
                                                    dmSans.className,
                                                    'text-sm font-semibold mt-3 mb-1.5 first:mt-0',
                                                )}
                                                {...props}
                                            />
                                        ),
                                        p: ({ ...props }) => (
                                            <p className="mb-2.5 last:mb-0" {...props} />
                                        ),
                                        ul: ({ ...props }) => (
                                            <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
                                        ),
                                        ol: ({ ...props }) => (
                                            <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
                                        ),
                                        li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                                        strong: ({ ...props }) => (
                                            <strong className="font-semibold text-foreground" {...props} />
                                        ),
                                        code: ({ ...props }) => (
                                            <code
                                                className={cn(
                                                    'px-1.5 py-0.5 rounded font-mono text-[0.75rem]',
                                                    msg.role === 'ai'
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-white/15 text-white',
                                                )}
                                                {...props}
                                            />
                                        ),
                                        pre: ({ ...props }) => (
                                            <pre
                                                className={cn(
                                                    'p-3 rounded-lg overflow-x-auto my-2 text-[0.75rem] font-mono',
                                                    msg.role === 'ai'
                                                        ? 'bg-muted/60 border border-border/60'
                                                        : 'bg-white/10 border border-white/20',
                                                )}
                                                {...props}
                                            />
                                        ),
                                        blockquote: ({ ...props }) => (
                                            <blockquote
                                                className="border-l-2 border-primary/40 pl-3 my-2 italic text-muted-foreground"
                                                {...props}
                                            />
                                        ),
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
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

// ---------------------------------------------------------------------------
// Soft Nudge — appears after ~15 user messages. Pedagogy, not limit.
// ---------------------------------------------------------------------------

function SoftNudge({
    onTry,
    onHint,
    onDismiss,
}: {
    onTry: () => void;
    onHint: () => void;
    onDismiss: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 sm:px-5 pt-3 border-t border-primary/10"
        >
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-start gap-3">
                <div className="shrink-0 mt-0.5 p-1.5 rounded-md bg-primary/15">
                    <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                        You&apos;ve been on this one a while.
                    </p>
                    <p className="text-[0.6875rem] sm:text-xs text-muted-foreground mt-0.5">
                        Best way to learn is to try. Ready to take a shot, or want one more nudge?
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={onTry}
                            className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            <Target className="h-3 w-3" />
                            Take a shot
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={onHint}
                            className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium px-2.5 py-1 rounded-full border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                            <Lightbulb className="h-3 w-3" />
                            One more hint
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss suggestion"
                    className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Rate-limit pause screen — replaces the composer when daily cap is hit.
// Friendly, no "error" language.
// ---------------------------------------------------------------------------

function RateLimitPause({
    info,
}: {
    info: { used: number; limit: number; resetsAt: string };
}) {
    const resetsInText = formatTimeUntil(info.resetsAt);

    return (
        <div className="border-t border-primary/10 bg-primary/5 px-5 py-6">
            <div className="max-w-md mx-auto text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 mb-3">
                    <Hourglass className="h-5 w-5 text-primary" />
                </div>
                <h3 className={cn(dmSans.className, 'text-base sm:text-lg font-semibold mb-1')}>
                    That&apos;s a wrap for today
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    You&apos;ve had {info.used} tutor messages today (limit: {info.limit}). Your
                    conversation is saved — pick it back up {resetsInText}.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <a
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Upgrade for more
                    </a>
                    <a
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                        Back to dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}

function formatTimeUntil(iso: string): string {
    try {
        const target = new Date(iso).getTime();
        const now = Date.now();
        const diffMs = Math.max(0, target - now);
        const hours = Math.floor(diffMs / 3_600_000);
        const minutes = Math.floor((diffMs % 3_600_000) / 60_000);

        if (hours >= 1) return `in ~${hours}h`;
        if (minutes >= 5) return `in ~${minutes}m`;
        return 'in a moment';
    } catch {
        return 'tomorrow';
    }
}
