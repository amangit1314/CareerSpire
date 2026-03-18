'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiManager } from '@/lib/api-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { dmSans } from '@/lib/fonts';
import {
  Search,
  Database,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  BookOpen,
  Loader2,
} from 'lucide-react';

interface QuestionBankResult {
  skill: string;
  niche: string;
  topics: string[];
  questions: Array<{
    id: number;
    topic: string;
    question: string;
    type: string;
    difficulty: string;
    answer_guide: string;
  }>;
  fromCache: boolean;
  hitCount: number;
}

const NICHE_OPTIONS = [
  { value: 'programming', label: 'Programming' },
  { value: 'hr', label: 'HR Interview' },
  { value: 'government', label: 'Government Exams' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  hard: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function QuestionBankPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [skill, setSkill] = useState('');
  const [niche, setNiche] = useState('programming');
  const [result, setResult] = useState<QuestionBankResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);

  if (authLoading) {
    return <QuestionBankSkeleton />;
  }

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!skill.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setExpandedIds(new Set());
    setFilterTopic(null);
    setFilterDifficulty(null);

    try {
      const response = await apiManager.post<QuestionBankResult>('/question-bank/search', {
        skill: skill.trim(),
        niche,
      });

      if (response.error) {
        const msg = typeof response.error === 'string' ? response.error : response.error.message;
        setError(msg);
      } else if (response.data) {
        setResult(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleExpand(id: number) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredQuestions = result?.questions.filter(q => {
    if (filterTopic && q.topic !== filterTopic) return false;
    if (filterDifficulty && q.difficulty.toLowerCase() !== filterDifficulty) return false;
    return true;
  }) ?? [];

  // Group by topic
  const groupedByTopic: Record<string, typeof filteredQuestions> = {};
  for (const q of filteredQuestions) {
    if (!groupedByTopic[q.topic]) groupedByTopic[q.topic] = [];
    groupedByTopic[q.topic].push(q);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className={`${dmSans.className} text-3xl font-bold mb-2`}>Question Bank</h1>
        <p className="text-muted-foreground">
          Search any skill to get 30+ curated interview questions. Cached for instant access.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter a skill (e.g. React, System Design, UPSC Polity)"
                value={skill}
                onChange={e => setSkill(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="flex gap-2">
              {NICHE_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={niche === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNiche(opt.value)}
                  disabled={isLoading}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <Button type="submit" disabled={isLoading || !skill.trim()} className="h-11 px-6">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && <SearchingSkeleton />}

      {/* Error */}
      {error && (
        <Card className="mb-8 border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Header with cache indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className={`${dmSans.className} text-2xl font-semibold`}>{result.skill}</h2>
              <Badge variant="outline" className="text-xs">
                {result.fromCache ? (
                  <><Database className="h-3 w-3 mr-1" /> Served from cache</>
                ) : (
                  <><Sparkles className="h-3 w-3 mr-1" /> AI generated</>
                )}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {result.questions.length} questions | {result.hitCount} searches
            </span>
          </div>

          {/* Topic chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={filterTopic === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterTopic(null)}
            >
              All Topics
            </Badge>
            {result.topics.map(topic => (
              <Badge
                key={topic}
                variant={filterTopic === topic ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterTopic(filterTopic === topic ? null : topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2 mb-6">
            <Badge
              variant={filterDifficulty === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterDifficulty(null)}
            >
              All Levels
            </Badge>
            {['easy', 'medium', 'hard'].map(d => (
              <Badge
                key={d}
                variant="outline"
                className={`cursor-pointer ${filterDifficulty === d ? DIFFICULTY_COLORS[d] : ''}`}
                onClick={() => setFilterDifficulty(filterDifficulty === d ? null : d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Badge>
            ))}
          </div>

          {/* Start Mock Button */}
          <div className="mb-6">
            <Button onClick={() => router.push('/mock/new')} className="gap-2">
              <Play className="h-4 w-4" />
              Start Mock on this skill
            </Button>
          </div>

          {/* Questions grouped by topic */}
          {Object.entries(groupedByTopic).map(([topic, questions]) => (
            <div key={topic} className="mb-6">
              <h3 className={`${dmSans.className} text-lg font-semibold mb-3 flex items-center gap-2`}>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                {topic}
                <span className="text-sm font-normal text-muted-foreground">({questions.length})</span>
              </h3>
              <div className="space-y-3">
                {questions.map(q => (
                  <Card key={q.id} className="overflow-hidden">
                    <button
                      className="w-full text-left p-4 flex items-start justify-between gap-3"
                      onClick={() => toggleExpand(q.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[q.difficulty.toLowerCase()] || ''}`}>
                            {q.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {q.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{q.question}</p>
                      </div>
                      {expandedIds.has(q.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </button>
                    {expandedIds.has(q.id) && (
                      <div className="px-4 pb-4 pt-0 border-t">
                        <div className="mt-3 p-3 rounded-md bg-muted/50">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Answer Guide</p>
                          <p className="text-sm whitespace-pre-wrap">{q.answer_guide}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No questions match the selected filters.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function QuestionBankSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Skeleton className="h-9 w-64 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />
      <Skeleton className="h-24 w-full mb-8 rounded-lg" />
    </div>
  );
}

function SearchingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}
