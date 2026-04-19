'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Briefcase,
    Building2,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    HelpCircle,
    Link as LinkIcon,
    Star,
    CheckCircle2,
    Lightbulb
} from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Difficulty } from '@/types/enums';
import { createInterviewExperience } from '@/app/actions/community.actions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Round {
    title: string;
    description: string;
    questions: { title: string; link?: string }[];
}

export default function NewExperiencePage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [interviewType, setInterviewType] = useState('onsite');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
    const [outcome, setOutcome] = useState('offered');
    const [tips, setTips] = useState('');
    const [rounds, setRounds] = useState<Round[]>([
        { title: 'Round 1: Technical', description: '', questions: [{ title: '', link: '' }] }
    ]);

    const addRound = () => {
        setRounds([...rounds, { title: `Round ${rounds.length + 1}: `, description: '', questions: [{ title: '', link: '' }] }]);
    };

    const removeRound = (index: number) => {
        setRounds(rounds.filter((_, i) => i !== index));
    };

    const updateRound = (index: number, field: keyof Round, value: any) => {
        const newRounds = [...rounds];
        newRounds[index] = { ...newRounds[index], [field]: value };
        setRounds(newRounds);
    };

    const addQuestion = (roundIndex: number) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].questions.push({ title: '', link: '' });
        setRounds(newRounds);
    };

    const updateQuestion = (roundIndex: number, questionIndex: number, field: 'title' | 'link', value: string) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].questions[questionIndex][field] = value;
        setRounds(newRounds);
    };

    const removeQuestion = (roundIndex: number, questionIndex: number) => {
        const newRounds = [...rounds];
        newRounds[roundIndex].questions = newRounds[roundIndex].questions.filter((_, i) => i !== questionIndex);
        setRounds(newRounds);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error('Session expired. Please log in again.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createInterviewExperience({
                company,
                role,
                interviewType,
                difficulty,
                outcome,
                rounds: rounds.length,
                questions: rounds,
                tips,
            });
            toast.success('Experience shared successfully!');
            router.push('/community');
        } catch (error) {
            console.error(error);
            toast.error('Failed to share experience. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-screen mesh-gradient flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary animate-spin rounded-full" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
                <Card className="glass max-w-md w-full text-center p-8">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className={cn(dmSans.className, "text-2xl font-bold mb-2")}>Authentication Required</h2>
                    <p className="text-muted-foreground mb-8">
                        Please log in to share your interview experience with the community.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button asChild className="dark:text-white">
                            <Link href="/auth/signin">Log In</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/community">Back to Community</Link>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen mesh-gradient py-12 px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-8 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Community
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="text-center md:text-left mb-10">
                        <h1 className={cn(dmSans.className, "text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground")}>
                            Share Your Journey
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Empower others by detailing your interview process. Your experience could be the key to someone else's success.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Info */}
                        <Card className="glass border-primary/10 overflow-hidden">
                            <CardHeader className="border-b border-primary/5 bg-primary/5">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    The Fundamentals
                                </CardTitle>
                                <CardDescription>Basic details about the opportunity</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input
                                        id="company"
                                        placeholder="e.g. Google, Meta, Startup XYZ"
                                        className="glass-input"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role / Position</Label>
                                    <Input
                                        id="role"
                                        placeholder="e.g. Software Engineer, Frontend Dev"
                                        className="glass-input"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Interview Type</Label>
                                    <Select value={interviewType} onValueChange={setInterviewType}>
                                        <SelectTrigger className="glass-input">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="glass">
                                            <SelectItem value="onsite">Onsite</SelectItem>
                                            <SelectItem value="remote">Remote (Video)</SelectItem>
                                            <SelectItem value="phone">Phone Screen</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                                        <SelectTrigger className="glass-input">
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent className="glass">
                                            <SelectItem value={Difficulty.EASY}>Easy</SelectItem>
                                            <SelectItem value={Difficulty.MEDIUM}>Medium</SelectItem>
                                            <SelectItem value={Difficulty.HARD}>Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Outcome</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {['Offered', 'Rejected', 'Accepted', 'Declined', 'Pending'].map((opt) => (
                                            <Button
                                                key={opt}
                                                type="button"
                                                variant={outcome.toLowerCase() === opt.toLowerCase() ? 'default' : 'outline'}
                                                className={cn(
                                                    "w-full capitalize",
                                                    outcome.toLowerCase() === opt.toLowerCase() ? "dark:text-white" : "glass"
                                                )}
                                                onClick={() => setOutcome(opt.toLowerCase())}
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2: Interview Rounds */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className={cn(dmSans.className, "text-2xl font-semibold flex items-center gap-2")}>
                                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
                                    Interview Rounds
                                </h3>
                                <Button type="button" onClick={addRound} variant="outline" size="sm" className="glass gap-2">
                                    <Plus className="h-4 w-4" /> Add Round
                                </Button>
                            </div>

                            <AnimatePresence>
                                {rounds.map((round, rIndex) => (
                                    <motion.div
                                        key={rIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="relative"
                                    >
                                        <Card className="glass border-primary/10 overflow-hidden">
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                {rounds.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeRound(rIndex)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Round Title</Label>
                                                    <Input
                                                        placeholder="e.g. DSA & Problem Solving"
                                                        className="glass-input font-medium"
                                                        value={round.title}
                                                        onChange={(e) => updateRound(rIndex, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description / Experience</Label>
                                                    <Textarea
                                                        placeholder="Describe what happened in this round..."
                                                        className="glass-input min-h-[100px]"
                                                        value={round.description}
                                                        onChange={(e) => updateRound(rIndex, 'description', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-4 pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Specific Questions Asked</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs hover:bg-primary/10 text-primary"
                                                            onClick={() => addQuestion(rIndex)}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" /> Add Question
                                                        </Button>
                                                    </div>

                                                    {round.questions.map((q, qIndex) => (
                                                        <div key={qIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-4 rounded-lg bg-primary/5 border border-primary/10">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-[10px] font-bold text-muted-foreground">QUESTION</Label>
                                                                    {round.questions.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeQuestion(rIndex, qIndex)}
                                                                            className="text-destructive hover:text-destructive/80"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <Input
                                                                    placeholder="e.g. Reverse a Linked List"
                                                                    className="bg-background/50 border-white/10"
                                                                    value={q.title}
                                                                    onChange={(e) => updateQuestion(rIndex, qIndex, 'title', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-muted-foreground">LINK (LEETCODE/GFG)</Label>
                                                                <div className="relative">
                                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                                    <Input
                                                                        placeholder="https://leetcode.com/problems/..."
                                                                        className="pl-9 bg-background/50 border-white/10"
                                                                        value={q.link}
                                                                        onChange={(e) => updateQuestion(rIndex, qIndex, 'link', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Section 3: Final Tips */}
                        <Card className="glass border-primary/10">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                                    Preparation Strategy & Tips
                                </CardTitle>
                                <CardDescription>What helped you the most? Any advice for fellow candidates?</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Textarea
                                    placeholder="Share your preparation resources, common mistakes to avoid, and general advice..."
                                    className="glass-input min-h-[200px]"
                                    value={tips}
                                    onChange={(e) => setTips(e.target.value)}
                                    required
                                />
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-4 pb-12">
                            <Button
                                type="button"
                                variant="ghost"
                                className="glass"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                className="dark:text-white px-8 h-12 text-md shadow-lg shadow-primary/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full mr-2" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Publish Experience
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
