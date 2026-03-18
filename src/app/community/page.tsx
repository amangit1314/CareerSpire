'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, FileText, Users, TrendingUp, Play, Heart, Eye, ChevronRight, Plus, Building2, Star } from 'lucide-react';
import { getPublicVideoInterviews } from '@/app/actions/video.actions';
import { getRecentExperiences, getCommunityStats } from '@/app/actions/community.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Briefcase, MapPin, Calendar, Award } from 'lucide-react';

export default function CommunityPage() {
    const [videos, setVideos] = useState<any[]>([]);
    const [experiences, setExperiences] = useState<any[]>([]);
    const [communityStats, setCommunityStats] = useState({
        videoCount: 0,
        experienceCount: 0,
        userCount: 0,
        successRate: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingExp, setIsLoadingExp] = useState(true);

    useEffect(() => {
        loadVideos();
        loadExperiences();
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getCommunityStats();
            setCommunityStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadVideos = async () => {
        try {
            const data = await getPublicVideoInterviews(1, 6);
            setVideos(data.videos);
        } catch (error) {
            console.error('Failed to load videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadExperiences = async () => {
        try {
            const data = await getRecentExperiences(6);
            setExperiences(data as any);
        } catch (error) {
            console.error('Failed to load experiences:', error);
        } finally {
            setIsLoadingExp(false);
        }
    };

    const formatStatValue = (val: number) => {
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toString();
    };

    const stats = [
        { label: 'Video Interviews', value: formatStatValue(communityStats.videoCount), icon: Video },
        { label: 'Experiences Shared', value: formatStatValue(communityStats.experienceCount), icon: FileText },
        { label: 'Active Members', value: formatStatValue(communityStats.userCount), icon: Users },
        { label: 'Success Rate', value: `${communityStats.successRate}%`, icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen mesh-gradient">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className={cn(dmSans.className, "text-4xl md:text-5xl font-bold mb-4")}>
                        Community Hub
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Learn from real interview experiences, watch video mock interviews,
                        and share your own journey to help others succeed.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="glass rounded-xl p-6 text-center border-primary/10"
                        >
                            <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <p className={cn(dmSans.className, "text-3xl font-bold")}>{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="videos" className="space-y-8">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                        <TabsTrigger value="videos" className="gap-2">
                            <Video className="h-4 w-4" />
                            Video Interviews
                        </TabsTrigger>
                        <TabsTrigger value="experiences" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Experiences
                        </TabsTrigger>
                    </TabsList>

                    {/* Videos Tab */}
                    <TabsContent value="videos">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className={cn(dmSans.className, "text-2xl font-semibold")}>
                                    Recent Video Interviews
                                </h2>
                                <Button variant="ghost" asChild>
                                    <Link href="/community/videos" className="gap-2">
                                        View All <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />
                                    ))}
                                </div>
                            ) : videos.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {videos.map((video, i) => (
                                        <motion.div
                                            key={video.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <VideoCard video={video} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <Card className="glass border-primary/10">
                                    <CardContent className="py-12 text-center">
                                        <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground">No public interviews yet</p>
                                        <Button asChild className="mt-4 dark:text-white">
                                            <Link href="/mock/video">Be the first to share!</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Experiences Tab */}
                    <TabsContent value="experiences">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className={cn(dmSans.className, "text-2xl font-semibold")}>
                                    Interview Experiences
                                </h2>
                                <div className="flex gap-2">
                                    <Button variant="outline" asChild className="glass">
                                        <Link href="/community/experiences/new">
                                            <Plus className="h-4 w-4 mr-2" /> Share Yours
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" asChild>
                                        <Link href="/community/experiences" className="gap-2 dark:text-white">
                                            View All <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {isLoadingExp ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-[200px] rounded-xl bg-muted animate-pulse" />
                                    ))}
                                </div>
                            ) : experiences.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {experiences.map((exp, i) => (
                                        <motion.div
                                            key={exp.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <ExperienceCard experience={exp} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <Card className="glass border-primary/10">
                                    <CardContent className="py-12 text-center">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground mb-4">
                                            No experiences shared yet. Be the first!
                                        </p>
                                        <Button asChild className='dark:text-white'>
                                            <Link href="/community/experiences/new">Share Your Experience</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-16"
                >
                    <Card className="glass border-primary/20 overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h3 className={cn(dmSans.className, "text-2xl md:text-3xl font-bold mb-4")}>
                                        Ready to Practice?
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Start a video mock interview now. Our AI interviewer will
                                        ask you real behavioral questions, and you can choose to
                                        share your recording with the community.
                                    </p>
                                    <Button asChild size="lg" className="shadow-lg shadow-primary/20 dark:text-white">
                                        <Link href="/mock/video">
                                            <Video className="mr-2 h-5 w-5" />
                                            Start Video Interview
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex justify-center">
                                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
                                        <Play className="h-16 w-16 text-primary-foreground dark:text-white ml-2" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

// Experience Card Component
function ExperienceCard({ experience }: { experience: any }) {
    return (
        <Link href={`/community/experiences/${experience.id}`}>
            <Card className="glass border-primary/10 overflow-hidden group cursor-pointer hover:border-primary/30 transition-all h-full">
                <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{experience.company}</h3>
                                <p className="text-xs text-muted-foreground">{experience.role}</p>
                            </div>
                        </div>
                        <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] uppercase font-bold",
                            experience.outcome === 'offered' ? "bg-green-500/10 text-green-500" :
                                experience.outcome === 'rejected' ? "bg-red-500/10 text-red-500" :
                                    "bg-blue-500/10 text-blue-500"
                        )}>
                            {experience.outcome}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            <span>{experience.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Award className="h-3.5 w-3.5 text-primary" />
                            <span>{experience.rounds} Rounds</span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow italic">
                        "{experience.tips.substring(0, 150)}..."
                    </p>

                    <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                {experience.user?.image ? (
                                    <img src={experience.user.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="h-3 w-3 text-primary" />
                                )}
                            </div>
                            <span className="text-xs font-medium">{experience.user?.name || 'Anonymous'}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                            {new Date(experience.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

// Video Card Component
function VideoCard({ video }: { video: any }) {
    return (
        <Card className="glass border-primary/10 overflow-hidden group cursor-pointer hover:border-primary/30 transition-all">
            <div className="aspect-video relative bg-muted">
                {video.thumbnailUrl ? (
                    <img
                        src={video.thumbnailUrl}
                        alt="Interview thumbnail"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                        <Play className="h-8 w-8 text-primary-foreground ml-1" />
                    </div>
                </div>

                {/* Difficulty badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                        {video.difficulty}
                    </span>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {video.user?.image ? (
                            <img src={video.user.image} alt="" className="w-full h-full rounded-full" />
                        ) : (
                            <Users className="h-4 w-4 text-primary" />
                        )}
                    </div>
                    <span className="text-sm font-medium">{video.user?.name || 'Anonymous'}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {video.likes}
                        </span>
                    </div>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}
