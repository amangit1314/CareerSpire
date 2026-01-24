'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Bot, User, ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { getTutorResponse } from '@/app/actions/resource.actions';

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

export function InteractivePractice({ question, initialExplanation, category, topic }: InteractivePracticeProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: initialExplanation }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        let userMessage = input.trim();

        // Auto-detect code in user message if not already wrapped in backticks
        const isLikelyCode = (text: string) => {
            const codePatterns = [
                /[{};]/, // Basic syntax
                /\b(function|const|let|var|class|if|for|while|import|export|return)\b/, // Keywords
                /\b(console\.log|await|async|Promise|setTimeout)\b/, // Common JS/TS
                /\b(def|import|from|print|if __name__ == "__main__":)\b/ // Common Python
            ];
            return codePatterns.some(pattern => pattern.test(text)) && !text.includes('```');
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

        if (isLikelyCode(userMessage)) {
            userMessage = `\`\`\`${getLanguage()}\n${userMessage}\n\`\`\``;
        }

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        try {
            // Map context for feedback
            const feedback = await getTutorResponse(
                {
                    title: question.title,
                    description: question.description,
                    topic: question.topic,
                    expectedAnswerFormat: question.expectedAnswerFormat,
                },
                userMessage
            );

            let aiResponse = "";
            if (feedback.isCodeCorrect || feedback.score > 70) {
                aiResponse = `**Fantastic job!** ${feedback.approachSummary}\n\n**Strengths:**\n- ${feedback.strengths.join('\n- ')}\n\n**Key Takeaways:**\n${feedback.correctedCode}`;
            } else {
                aiResponse = `**Good attempt!** ${feedback.approachSummary}\n\n**Things to think about:**\n- ${feedback.improvements.join('\n- ')}\n\nWould you like to try refining your answer based on this?`;
            }

            // Ensure Corrected Code is wrapped in backticks if it's not (failsafe)
            if (feedback.correctedCode && !feedback.correctedCode.includes('```') && isLikelyCode(feedback.correctedCode)) {
                aiResponse = aiResponse.replace(feedback.correctedCode, `\`\`\`${getLanguage()}\n${feedback.correctedCode}\n\`\`\``);
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to get response from AI');
            setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I hit a snag. Could you try saying that again?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto glass rounded-2xl overflow-hidden border-primary/10">
            {/* Header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className={cn(dmSans.className, "font-semibold")}>AI Tutor: {topic}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Practice Mode</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-background/50">{question.difficulty}</Badge>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-grow p-6">
                <div className="space-y-6">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4",
                                msg.role === 'user' ? "flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 dark:text-white",
                                msg.role === 'ai' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed prose dark:prose-invert",
                                msg.role === 'ai'
                                    ? "bg-primary/5 border border-primary/10 rounded-tl-none"
                                    : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10 dark:text-white prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-code:text-primary-foreground"
                            )}>
                                <ReactMarkdown components={{
                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    code: ({ node, ...props }) => <code className="bg-primary/10 px-1 rounded font-mono text-xs" {...props} />,
                                    pre: ({ node, ...props }) => <pre className="bg-muted/50 p-3 rounded-lg overflow-x-auto my-2" {...props} />
                                }}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl rounded-tl-none">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-primary/10 bg-primary/5">
                <div className="flex gap-2 items-end">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type your answer or paste code (Shift+Enter for new line)..."
                        className="bg-background border-primary/10 focus-visible:ring-primary min-h-[50px] max-h-[200px] resize-none"
                        disabled={isTyping}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={isTyping || !input.trim()}
                        className="h-10 w-10 shrink-0 shadow-lg shadow-primary/20 dark:text-white mb-1"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
}
