"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, TrendingUp, ChevronLeft } from "lucide-react";
import { getPublicVideoInterviews } from "@/app/actions/video.actions";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import {
  ANY_DIFFICULTY,
  VideoSortOption,
  type VideoInterview,
  type AnyDifficulty,
  type Difficulty,
} from "@/types";
import { VideoCard } from "./_components/VideoCard";
import { VideoFilters } from "./_components/VideoFilters";
import { EmptyState } from "./_components/EmptyState";
import { ROUTES } from "@/config/routes";
import { VIDEO_WALL_CONTENT } from "@/config/content";

export default function VideoMockInterviewsPage() {
  const [videos, setVideos] = useState<VideoInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    AnyDifficulty | Difficulty
  >(ANY_DIFFICULTY);
  const [sortBy, setSortBy] = useState<VideoSortOption>(VideoSortOption.RECENT);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch videos
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        const result = await getPublicVideoInterviews(1, 50);
        setVideos(result.videos);
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Apply filters
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Search filter — only presenter name is available on this data shape
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((video) =>
        video.user.name?.toLowerCase().includes(query),
      );
    }

    // Difficulty filter
    if (difficultyFilter !== ANY_DIFFICULTY) {
      result = result.filter(
        (video) => video.difficulty?.toUpperCase() === difficultyFilter,
      );
    }

    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      result = result.filter((video) => {
        const videoDate = new Date(video.createdAt);
        return videoDate >= dateRange.from! && videoDate <= dateRange.to!;
      });
    }

    // Sorting
    switch (sortBy) {
      case VideoSortOption.RECENT:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case VideoSortOption.POPULAR:
        result.sort((a, b) => b.views - a.views);
        break;
      case VideoSortOption.TRENDING:
        result.sort(
          (a, b) =>
            (b.views > 0 ? b.likes / b.views : 0) -
            (a.views > 0 ? a.likes / a.views : 0),
        );
        break;
    }

    return result;
  }, [videos, searchQuery, difficultyFilter, sortBy, dateRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter(ANY_DIFFICULTY);
    setDateRange(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href={ROUTES.COMMUNITY}>
                <ChevronLeft className="h-4 w-4" />
                {VIDEO_WALL_CONTENT.BACK_TO_COMMUNITY}
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h1 className={cn(dmSans.className, "text-4xl font-bold mb-4")}>
                {VIDEO_WALL_CONTENT.TITLE}
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                {VIDEO_WALL_CONTENT.DESCRIPTION}
              </p>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{videos.length}</span>
                  <span className="text-muted-foreground">
                    {VIDEO_WALL_CONTENT.INTERVIEWS_AVAILABLE}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Card className="glass border-primary/10 p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn(dmSans.className, "font-semibold")}>
                    {VIDEO_WALL_CONTENT.READY_TO_RECORD}
                  </h3>
                  <Button
                    size="sm"
                    asChild
                    className="shadow-primary/20 shadow-sm"
                  >
                    <Link href={ROUTES.MOCK_VIDEO} className="dark:text-white">
                      <Play className="h-4 w-4 mr-2" />
                      {VIDEO_WALL_CONTENT.START_RECORDING}
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {VIDEO_WALL_CONTENT.RECORD_HINT}
                </p>
              </Card>
            </div>
          </div>
        </div>

        <VideoFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={cn(dmSans.className, "text-2xl font-semibold")}>
              {VIDEO_WALL_CONTENT.RESULTS_TITLE}
            </h2>
            <p className="text-muted-foreground">
              {VIDEO_WALL_CONTENT.RESULTS_SUMMARY(
                filteredVideos.length,
                videos.length,
              )}
            </p>
          </div>

          <Tabs
            value={sortBy}
            onValueChange={(value) => setSortBy(value as VideoSortOption)}
          >
            <TabsList>
              <TabsTrigger value={VideoSortOption.RECENT}>
                {VIDEO_WALL_CONTENT.SORT_RECENT}
              </TabsTrigger>
              <TabsTrigger value={VideoSortOption.POPULAR}>
                {VIDEO_WALL_CONTENT.SORT_POPULAR}
              </TabsTrigger>
              <TabsTrigger value={VideoSortOption.TRENDING}>
                {VIDEO_WALL_CONTENT.SORT_TRENDING}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="aspect-video rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState onClearFilters={clearFilters} />
        )}
      </div>
    </div>
  );
}
