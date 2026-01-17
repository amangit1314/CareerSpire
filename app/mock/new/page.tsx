'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStartMock } from '@/hooks/useMock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play } from 'lucide-react';
import { QuestionType, Difficulty } from '@/types/enums';

export default function NewMockPage() {
  const router = useRouter();
  const startMock = useStartMock();
  const [selectedType, setSelectedType] = useState<QuestionType>(QuestionType.DSA);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);

  const handleStart = async () => {
    try {
      const session = await startMock.mutateAsync({
        type: selectedType,
        difficulty: selectedDifficulty,
      });
      router.push(`/mock/${session.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to start mock interview');
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
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedType(QuestionType.DSA)}
              className={`p-4 border rounded-lg text-center transition-all ${
                selectedType === QuestionType.DSA
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'hover:bg-accent'
              }`}
            >
              <div className="font-semibold">DSA</div>
              <div className="text-xs text-muted-foreground mt-1">Data Structures & Algorithms</div>
            </button>
            <button
              onClick={() => setSelectedType(QuestionType.CODING)}
              className={`p-4 border rounded-lg text-center transition-all ${
                selectedType === QuestionType.CODING
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'hover:bg-accent'
              }`}
            >
              <div className="font-semibold">Coding</div>
              <div className="text-xs text-muted-foreground mt-1">Language Fundamentals</div>
            </button>
            <button
              onClick={() => setSelectedType(QuestionType.HR)}
              className={`p-4 border rounded-lg text-center transition-all ${
                selectedType === QuestionType.HR
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'hover:bg-accent'
              }`}
            >
              <div className="font-semibold">HR</div>
              <div className="text-xs text-muted-foreground mt-1">Behavioral Questions</div>
            </button>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-4">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    selectedDifficulty === difficulty
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  {difficulty.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStart}
            disabled={startMock.isPending}
            className="w-full mt-6"
            size="lg"
          >
            {startMock.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Mock Interview
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
