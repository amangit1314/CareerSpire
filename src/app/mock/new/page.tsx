'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStartMock } from '@/hooks/useMock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, RefreshCw } from 'lucide-react';
import { QuestionType, Difficulty, ProgrammingLanguage, Framework } from '@/types/enums';
import { ErrorMessage } from '@/components/ui/error-message';

export default function NewMockPage() {
  const router = useRouter();
  const startMock = useStartMock();
  const [selectedType, setSelectedType] = useState<QuestionType>(QuestionType.DSA);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null)
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('Starting...');

  const handleStart = async () => {
    setError(null);
    setLoadingStatus('Initializing session...');

    try {
      // Small delay loop to simulate progress if it's too fast, 
      // but mainly to provide visual feedback during the LLM call.
      const statusInterval = setInterval(() => {
        setLoadingStatus(prev => {
          if (prev === 'Initializing session...') return 'Generating AI questions (Parallel Processing)...';
          if (prev === 'Generating AI questions (Parallel Processing)...') return 'This might take 60-90 seconds for high quality...';
          if (prev === 'This might take 60-90 seconds for high quality...') return 'Aggregating and validating questions...';
          return prev;
        });
      }, 7000);

      const session = await startMock.mutateAsync({
        type: selectedType,
        difficulty: selectedDifficulty,
        language: selectedLanguage,
        framework: selectedFramework,
      });

      clearInterval(statusInterval);
      router.push(`/mock/${session.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start mock interview. The AI service might be busy.');
    } finally {
      setLoadingStatus('Starting...');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Start Mock Interview</h1>
        <p className="text-muted-foreground">
          Choose your interview type and difficulty level
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Type</CardTitle>
          <CardDescription>Select the type of interview you want to practice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <ErrorMessage
              message={error}
              title="Startup Error"
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedType(QuestionType.DSA)}
              className={`p-4 border rounded-lg text-center transition-all ${selectedType === QuestionType.DSA
                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                : 'hover:bg-accent'
                }`}
            >
              <div className="font-semibold">DSA</div>
              <div className="text-xs text-muted-foreground mt-1">Data Structures & Algorithms</div>
            </button>
            <button
              onClick={() => setSelectedType(QuestionType.CODING)}
              className={`p-4 border rounded-lg text-center transition-all ${selectedType === QuestionType.CODING
                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                : 'hover:bg-accent'
                }`}
            >
              <div className="font-semibold">Coding</div>
              <div className="text-xs text-muted-foreground mt-1">Language Fundamentals</div>
            </button>
            <button
              onClick={() => setSelectedType(QuestionType.HR)}
              className={`p-4 border rounded-lg text-center transition-all ${selectedType === QuestionType.HR
                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                : 'hover:bg-accent'
                }`}
            >
              <div className="font-semibold">HR</div>
              <div className="text-xs text-muted-foreground mt-1">Behavioral Questions</div>
            </button>
            <a
              href="/mock/video"
              className="p-4 border rounded-lg text-center transition-all hover:bg-accent relative overflow-hidden group"
            >
              <div className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground dark:text-white rounded-full">
                {/* NEW */}
                beta
              </div>
              <div className="font-semibold">Video</div>
              <div className="text-xs text-muted-foreground mt-1">Live AI Interview</div>
            </a>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-4">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`p-3 border rounded-lg text-center transition-all ${selectedDifficulty === difficulty
                    ? 'border-primary bg-primary/10 ring-2 ring-primary'
                    : 'hover:bg-accent'
                    }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {selectedType === QuestionType.CODING && (
            <>
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">Language</label>
                <div className="grid grid-cols-2 gap-4">
                  {[ProgrammingLanguage.JAVASCRIPT, ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.PYTHON, ProgrammingLanguage.JAVA].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`p-3 border rounded-lg text-center transition-all
              ${selectedLanguage === lang
                          ? 'border-primary bg-primary/10 ring-2 ring-primary'
                          : 'hover:bg-accent'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <label className="text-sm font-medium mb-2 block">Framework (optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  {[Framework.NONE, Framework.NODE, Framework.REACT, Framework.ANGULAR, Framework.VUE, Framework.NEXT, Framework.NEST, Framework.SPRING_BOOT, Framework.FASTAPI, Framework.DJANGO]
                    .map(fw => (
                      <button
                        key={fw}
                        onClick={() => setSelectedFramework(fw === Framework.NONE ? null : fw)}
                        className={`p-3 border rounded-lg text-center transition-all
              ${selectedFramework === fw
                            ? 'border-primary bg-primary/10 ring-2 ring-primary'
                            : 'hover:bg-accent'}`}
                      >
                        {fw}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleStart}
            disabled={startMock.isPending}
            className="w-full mt-6 dark:text-white transition-all duration-300"
            size="lg"
            variant={error ? "outline" : "default"}
          >
            {startMock.isPending ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>{loadingStatus}</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Try Again</span>
              </div>
            ) : (
              <div className="flex items-center cursor-pointer">
                <Play className="mr-2 h-4 w-4" />
                <span>Start Mock Interview</span>
              </div>
            )}
          </Button>

          {startMock.isPending && (
            <p className="text-center text-xs text-muted-foreground animate-pulse mt-2">
              Our AI is crafting your personalized interview. Please stay on this page.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
