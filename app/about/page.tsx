'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Target, Users, Zap, Sparkles } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Mission Hero */}
            <section className="relative py-24 overflow-hidden border-b border-primary/5">
                <div className="absolute inset-0 mesh-gradient opacity-40 -z-10" />
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h1 className={cn(dmSans.className, "text-5xl md:text-6xl font-bold mb-8 tracking-tighter")}>
                            Democratizing <br />
                            <span className="text-primary italic">Elite</span> Preparation.
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We believe that landing a dream job shouldn't depend on who you know or being able to afford expensive personal coaches. We built an AI that brings elite-level interview mentorship to everyone, for free.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Vision Sections */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className={cn(dmSans.className, "text-3xl font-bold mb-6")}>Our Vision</h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed text-lg">
                            The tech industry is evolving at breakneck speed, but the way we prepare for interviews is still stuck in the past—manual, stressful, and often isolated.
                        </p>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            We envision a world where preparation is continuous, data-driven, and supportive. A world where you don't just "study for an interview," but you grow as an engineer through interactive dialogue and community insight.
                        </p>
                    </motion.div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10" />
                        <Card className="glass border-primary/10 overflow-hidden transform hover:-rotate-2 transition-transform duration-500">
                            <CardContent className="p-0">
                                <div className="aspect-square bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                                    <Sparkles className="h-32 w-32 text-primary animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-primary/5 border-y border-primary/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className={cn(dmSans.className, "text-3xl font-bold mb-4")}>Our Core Values</h2>
                        <p className="text-muted-foreground">The principles that guide every feature we build.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Heart,
                                title: "Student First",
                                desc: "Every decision starts with one question: Does this help the user learn faster and better?"
                            },
                            {
                                icon: Shield,
                                title: "Radical Transparency",
                                desc: "No hidden agendas. We share real interview experiences and data to give you the truth."
                            },
                            {
                                icon: Target,
                                title: "AI-Human Synergy",
                                desc: "We use AI to amplify human potential, not replace it. Our tools are built for mentors and learners alike."
                            }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="glass border-primary/10 h-full text-center hover:bg-primary/5 transition-colors">
                                    <CardContent className="p-8">
                                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                                            <value.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className={cn(dmSans.className, "text-xl font-bold mb-3")}>{value.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Story */}
            <section className="py-24 container mx-auto px-6 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className={cn(dmSans.className, "text-4xl font-bold")}>Join the Movement</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        We started as a small group of engineers helping each other out. Today, we're a global community of learners, mentors, and dreamers. Whether you're a fresher or a staff engineer, there's a place for you here.
                    </p>
                    <div className="pt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-white font-bold py-4 px-12 rounded-full shadow-2xl shadow-primary/30 transition-all"
                        >
                            Get Started for Free
                        </motion.button>
                    </div>
                </div>
            </section>
        </div>
    );
}
