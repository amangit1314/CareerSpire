"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStartMock } from "@/features/mock/hooks/useMock";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Play, RefreshCw } from "lucide-react";
import {
  QuestionType,
  Difficulty,
  ProgrammingLanguage,
  Framework,
} from "@/types/enums";
import { ErrorMessage } from "@/components/ui/error-message";
import { ROUTES } from "@/config/routes";
import { NEW_MOCK_CONTENT } from "@/config/content";
import { NEW_MOCK_MESSAGES } from "@/config/messages";

export default function NewMockPage() {
  const router = useRouter();
  const startMock = useStartMock();
  const [selectedType, setSelectedType] = useState<QuestionType>(
    QuestionType.DSA,
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(
    Difficulty.EASY,
  );
  const [selectedLanguage, setSelectedLanguage] =
    useState<ProgrammingLanguage | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>(
    NEW_MOCK_CONTENT.STATUS_STARTING,
  );

  const handleStart = async () => {
    setError(null);
    setLoadingStatus(NEW_MOCK_CONTENT.STATUS_INITIALIZING);

    try {
      // Small delay loop to simulate progress if it's too fast,
      // but mainly to provide visual feedback during the LLM call.
      const statusInterval = setInterval(() => {
        setLoadingStatus((prev) => {
          if (prev === NEW_MOCK_CONTENT.STATUS_INITIALIZING)
            return NEW_MOCK_CONTENT.STATUS_GENERATING;
          if (prev === NEW_MOCK_CONTENT.STATUS_GENERATING)
            return NEW_MOCK_CONTENT.STATUS_SLOW_NOTICE;
          if (prev === NEW_MOCK_CONTENT.STATUS_SLOW_NOTICE)
            return NEW_MOCK_CONTENT.STATUS_AGGREGATING;
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
      setError(
        err instanceof Error
          ? err.message
          : NEW_MOCK_MESSAGES.START_FAILED_FALLBACK,
      );
    } finally {
      setLoadingStatus(NEW_MOCK_CONTENT.STATUS_STARTING);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{NEW_MOCK_CONTENT.TITLE}</h1>
        <p className="text-muted-foreground">{NEW_MOCK_CONTENT.SUBTITLE}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{NEW_MOCK_CONTENT.CARD_TITLE}</CardTitle>
          <CardDescription>{NEW_MOCK_CONTENT.CARD_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <ErrorMessage
              message={error}
              title={NEW_MOCK_CONTENT.STARTUP_ERROR_TITLE}
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedType(QuestionType.DSA)}
              className={`p-4 border rounded-lg text-center transition-all ${
                selectedType === QuestionType.DSA
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-accent"
              }`}
            >
              <div className="font-semibold">
                {NEW_MOCK_CONTENT.TYPE_DSA_LABEL}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {NEW_MOCK_CONTENT.TYPE_DSA_DESCRIPTION}
              </div>
            </button>
            <button
              onClick={() => setSelectedType(QuestionType.CODING)}
              className={`p-4 border rounded-lg text-center transition-all ${
                selectedType === QuestionType.CODING
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-accent"
              }`}
            >
              <div className="font-semibold">
                {NEW_MOCK_CONTENT.TYPE_CODING_LABEL}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {NEW_MOCK_CONTENT.TYPE_CODING_DESCRIPTION}
              </div>
            </button>
            <button
              onClick={() => setSelectedType(QuestionType.HR)}
              className={`p-4 border rounded-lg text-center transition-all ${
                selectedType === QuestionType.HR
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-accent"
              }`}
            >
              <div className="font-semibold">
                {NEW_MOCK_CONTENT.TYPE_HR_LABEL}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {NEW_MOCK_CONTENT.TYPE_HR_DESCRIPTION}
              </div>
            </button>
            <Link
              href={ROUTES.MOCK_VIDEO}
              className="p-4 border rounded-lg text-center transition-all hover:bg-accent relative overflow-hidden group"
            >
              <div className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground dark:text-white rounded-full">
                {NEW_MOCK_CONTENT.TYPE_VIDEO_BADGE}
              </div>
              <div className="font-semibold">
                {NEW_MOCK_CONTENT.TYPE_VIDEO_LABEL}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {NEW_MOCK_CONTENT.TYPE_VIDEO_DESCRIPTION}
              </div>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">
              {NEW_MOCK_CONTENT.DIFFICULTY_LABEL}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map(
                (difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      selectedDifficulty === difficulty
                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    {difficulty}
                  </button>
                ),
              )}
            </div>
          </div>

          {selectedType === QuestionType.CODING && (
            <>
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">
                  {NEW_MOCK_CONTENT.LANGUAGE_LABEL}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ProgrammingLanguage.JAVASCRIPT,
                    ProgrammingLanguage.TYPESCRIPT,
                    ProgrammingLanguage.PYTHON,
                    ProgrammingLanguage.JAVA,
                  ].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`p-3 border rounded-lg text-center transition-all
              ${
                selectedLanguage === lang
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-accent"
              }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <label className="text-sm font-medium mb-2 block">
                  {NEW_MOCK_CONTENT.FRAMEWORK_LABEL}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    Framework.NONE,
                    Framework.NODE,
                    Framework.REACT,
                    Framework.ANGULAR,
                    Framework.VUE,
                    Framework.NEXT,
                    Framework.NEST,
                    Framework.SPRING_BOOT,
                    Framework.FASTAPI,
                    Framework.DJANGO,
                  ].map((fw) => (
                    <button
                      key={fw}
                      onClick={() =>
                        setSelectedFramework(fw === Framework.NONE ? null : fw)
                      }
                      className={`p-3 border rounded-lg text-center transition-all
              ${
                selectedFramework === fw
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-accent"
              }`}
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
                <span>{NEW_MOCK_CONTENT.TRY_AGAIN}</span>
              </div>
            ) : (
              <div className="flex items-center cursor-pointer">
                <Play className="mr-2 h-4 w-4" />
                <span>{NEW_MOCK_CONTENT.START_INTERVIEW}</span>
              </div>
            )}
          </Button>

          {startMock.isPending && (
            <p className="text-center text-xs text-muted-foreground animate-pulse mt-2">
              {NEW_MOCK_CONTENT.GENERATING_HINT}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
