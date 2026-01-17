'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Code, Target } from 'lucide-react';
import { Question, Difficulty } from '@/types';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';

interface QuestionCardProps {
  question: Question;
  index: number;
  timeSpent?: number;
  isActive?: boolean;
  onSelect?: () => void;
}

export function QuestionCard({
  question,
  index,
  timeSpent,
  isActive = false,
  onSelect,
}: QuestionCardProps) {
  const difficultyColors = {
    [Difficulty.EASY]: 'bg-green-500/10 text-green-600 border-green-500/20',
    [Difficulty.MEDIUM]: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    [Difficulty.HARD]: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isActive && 'ring-2 ring-primary'
      )}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className={`${dmSans.className} text-lg`}>
            Question {index + 1}: {question.title}
          </CardTitle>
          <Badge
            className={cn(
              'border',
              difficultyColors[question.difficulty],
              dmSans.className
            )}
          >
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {question.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              <span>{question.topic}</span>
            </div>
            {timeSpent !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


/**
 * 'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Code, Target } from 'lucide-react';
import { Question, Difficulty } from '@/types';
import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';
import Link from 'next/link';

interface QuestionCardProps {
  question: Question;
  category: string;
  index: number;
  timeSpent?: number;
  isActive?: boolean;
  onSelect?: () => void;
}

export function QuestionCard({
  question,
  index,
  category,
  timeSpent,
  isActive = false,
  onSelect,
}: QuestionCardProps) {
  const difficultyColors = {
    [Difficulty.EASY]: 'bg-green-500/10 text-green-600 border-green-500/20',
    [Difficulty.MEDIUM]: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    [Difficulty.HARD]: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <Link href={`/resources/${category}/${question.topic}/${question.id}`}>
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          isActive && 'ring-2 ring-primary'
        )}
        onClick={onSelect}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className={`${dmSans.className} text-lg`}>
              Question {index + 1}: {question.title}
            </CardTitle>
            <Badge
              className={cn(
                'border',
                difficultyColors[question.difficulty],
                dmSans.className
              )}
            >
              {question.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {question.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                <span>{question.topic}</span>
              </div>
              {timeSpent !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

 */