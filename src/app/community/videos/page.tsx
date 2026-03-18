'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Filter, Search, Eye, Heart, Play, Users, Calendar, Clock, TrendingUp, ChevronLeft } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { getPublicVideoInterviews } from '@/app/actions/video.actions';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';

type VideoInterview = {
  id: string;
  title: string;
  user: {
    name: string;
    image?: string;
  };
  company?: string;
  role?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  views: number;
  likes: number;
  thumbnailUrl?: string;
  createdAt: string;
  tags: string[];
};

export default function VideoMockInterviewsPage() {
  const [videos, setVideos] = useState<VideoInterview[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch videos
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        // Mock data - replace with actual API call
        const mockVideos: VideoInterview[] = [
          {
            id: '1',
            title: 'Senior Frontend Engineer Interview - FAANG',
            user: { name: 'Alex Chen', image: '' },
            company: 'Google',
            role: 'Senior Frontend Engineer',
            difficulty: 'hard',
            duration: 45,
            views: 12450,
            likes: 892,
            thumbnailUrl: '',
            createdAt: '2024-01-15',
            tags: ['React', 'System Design', 'JavaScript']
          },
          {
            id: '2',
            title: 'Junior Software Developer Mock Interview',
            user: { name: 'Sarah Miller', image: '' },
            company: 'Microsoft',
            role: 'Software Developer',
            difficulty: 'medium',
            duration: 30,
            views: 8450,
            likes: 423,
            thumbnailUrl: '',
            createdAt: '2024-01-20',
            tags: ['Python', 'Data Structures', 'Algorithms']
          },
          {
            id: '3',
            title: 'Product Manager Behavioral Interview',
            user: { name: 'David Park', image: '' },
            company: 'Meta',
            role: 'Product Manager',
            difficulty: 'medium',
            duration: 50,
            views: 15600,
            likes: 1023,
            thumbnailUrl: '',
            createdAt: '2024-01-18',
            tags: ['Product', 'Leadership', 'Strategy']
          },
          {
            id: '4',
            title: 'Backend System Design Interview',
            user: { name: 'Maria Garcia', image: '' },
            company: 'Amazon',
            role: 'Backend Engineer',
            difficulty: 'hard',
            duration: 60,
            views: 9800,
            likes: 756,
            thumbnailUrl: '',
            createdAt: '2024-01-22',
            tags: ['System Design', 'Scalability', 'AWS']
          },
          {
            id: '5',
            title: 'Entry Level Software Engineer',
            user: { name: 'John Doe', image: '' },
            company: 'Netflix',
            role: 'Software Engineer I',
            difficulty: 'easy',
            duration: 25,
            views: 5600,
            likes: 289,
            thumbnailUrl: '',
            createdAt: '2024-01-25',
            tags: ['Java', 'OOP', 'Basics']
          },
          {
            id: '6',
            title: 'Machine Learning Engineer Technical',
            user: { name: 'Lisa Wang', image: '' },
            company: 'OpenAI',
            role: 'ML Engineer',
            difficulty: 'hard',
            duration: 55,
            views: 13400,
            likes: 945,
            thumbnailUrl: '',
            createdAt: '2024-01-16',
            tags: ['ML', 'Python', 'Statistics']
          }
        ];

        setVideos(mockVideos);
        setFilteredVideos(mockVideos);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...videos];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.company?.toLowerCase().includes(query) ||
        video.role?.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query)) ||
        video.user.name.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(video => video.difficulty === difficultyFilter);
    }

    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      result = result.filter(video => {
        const videoDate = new Date(video.createdAt);
        return videoDate >= dateRange.from! && videoDate <= dateRange.to!;
      });
    }

    // Sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        result.sort((a, b) => (b.likes / b.views) - (a.likes / a.views));
        break;
    }

    setFilteredVideos(result);
  }, [videos, searchQuery, difficultyFilter, sortBy, dateRange]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/community">
                <ChevronLeft className="h-4 w-4" />
                Back to Community
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h1 className={cn(dmSans.className, "text-4xl font-bold mb-4")}>
                Video Mock Interviews
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Watch real interview recordings shared by our community. Learn from others' experiences and prepare for your own interviews.
              </p>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{videos.length}</span>
                  <span className="text-muted-foreground">interviews available</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Card className="glass border-primary/10 p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn(dmSans.className, "font-semibold")}>Ready to Record?</h3>
                  <Button size="sm" asChild className="shadow-primary/20 shadow-sm">
                    <Link href="/mock/video" className='dark:text-white'>
                      <Play className="h-4 w-4 mr-2" />
                      Start Recording
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Practice with our AI interviewer and optionally share your recording to help others.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="glass border-primary/10 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search interviews by title, company, role, or tags..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Viewed</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="mt-4 flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      'Date Range'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {dateRange?.from && (
                <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                  Clear Dates
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={cn(dmSans.className, "text-2xl font-semibold")}>
              Community Interviews
            </h2>
            <p className="text-muted-foreground">
              Showing {filteredVideos.length} of {videos.length} interviews
            </p>
          </div>

          <Tabs value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass border-primary/10 overflow-hidden group cursor-pointer hover:border-primary/30 transition-all h-full">
                  {/* Thumbnail */}
                  <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border",
                        getDifficultyColor(video.difficulty)
                      )}>
                        {video.difficulty.charAt(0).toUpperCase() + video.difficulty.slice(1)}
                      </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className={cn(dmSans.className, "font-semibold line-clamp-2 mb-2")}>
                        {video.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        {video.company && (
                          <span className="font-medium text-foreground">{video.company}</span>
                        )}
                        {video.role && (
                          <>
                            <span>•</span>
                            <span>{video.role}</span>
                          </>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {video.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary/5 text-primary rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {video.tags.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                            +{video.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats & User */}
                    <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{video.user.name}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{video.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{video.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(video.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass border-primary/10">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className={cn(dmSans.className, "text-2xl font-semibold mb-3")}>
                No Interviews Found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('all');
                  setDateRange(undefined);
                }}>
                  Clear All Filters
                </Button>
                <Button asChild>
                  <Link href="/mock/video" className='dark:text-white'>
                    <Play className="h-4 w-4 mr-2" />
                    Record Your Own
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}