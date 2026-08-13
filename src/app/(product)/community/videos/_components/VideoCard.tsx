import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Eye, Heart, Play, Users } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { VideoInterview } from '../types';

function getDifficultyColor(difficulty: string | null) {
  switch (difficulty?.toUpperCase()) {
    case 'EASY': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'HARD': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-primary/10 text-primary border-primary/20';
  }
}

interface VideoCardProps {
  video: VideoInterview;
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass border-primary/10 overflow-hidden group cursor-pointer hover:border-primary/30 transition-all h-full">
        {/* Thumbnail */}
        <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Play className="h-8 w-8 text-primary ml-1" />
            </div>
          </div>

          {video.difficulty && (
            <div className="absolute top-3 left-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold border",
                getDifficultyColor(video.difficulty)
              )}>
                {video.difficulty.charAt(0).toUpperCase() + video.difficulty.slice(1).toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className={cn(dmSans.className, "font-semibold line-clamp-2 mb-2")}>
              {video.user.name || 'Anonymous'}&apos;s Interview
            </h3>
          </div>

          {/* Stats & User */}
          <div className="flex items-center justify-between pt-4 border-t border-primary/5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{video.user.name || 'Anonymous'}</span>
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
  );
}
