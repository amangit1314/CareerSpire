"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Video,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Code2,
  Users,
  Briefcase,
  Shuffle,
  Brain,
  Layers,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { VideoPreflightCheck } from "@/components/VideoPreflightCheck";
import { startVideoMock } from "@/app/actions/video.actions";
import {
  InterviewMode,
  TechnicalFocus,
  NonTechnicalCategory,
  type VideoInterviewConfig,
} from "@/app/actions/video.actions";
import { Difficulty, ProgrammingLanguage, Framework } from "@/types/enums";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/config/routes";
import { VIDEO_MOCK_SETUP_MESSAGES } from "@/config/messages";
import { VIDEO_MOCK_SETUP_CONTENT } from "@/config/content";

const MODES: Array<{
  value: InterviewMode;
  label: string;
  icon: typeof Code2;
  desc: string;
}> = [
  {
    value: InterviewMode.TECHNICAL,
    label: "Technical",
    icon: Code2,
    desc: "Language concepts, DSA, problem-solving",
  },
  {
    value: InterviewMode.NON_TECHNICAL,
    label: "Non-Technical",
    icon: MessageSquare,
    desc: "HR, behavioral, situational",
  },
  {
    value: InterviewMode.MIXED,
    label: "Real Interview",
    icon: Shuffle,
    desc: "Multi-round: HR + Tech + System Design",
  },
];

const LANGUAGES: Array<{ value: ProgrammingLanguage; label: string }> = [
  { value: ProgrammingLanguage.JAVASCRIPT, label: "JavaScript" },
  { value: ProgrammingLanguage.TYPESCRIPT, label: "TypeScript" },
  { value: ProgrammingLanguage.PYTHON, label: "Python" },
  { value: ProgrammingLanguage.JAVA, label: "Java" },
];

const FRAMEWORKS: Record<
  ProgrammingLanguage,
  Array<{ value: Framework; label: string }>
> = {
  [ProgrammingLanguage.JAVASCRIPT]: [
    { value: Framework.REACT, label: "React" },
    { value: Framework.NEXT, label: "Next.js" },
    { value: Framework.NODE, label: "Node.js" },
    { value: Framework.VUE, label: "Vue" },
    { value: Framework.ANGULAR, label: "Angular" },
    { value: Framework.NEST, label: "NestJS" },
  ],
  [ProgrammingLanguage.TYPESCRIPT]: [
    { value: Framework.REACT, label: "React" },
    { value: Framework.NEXT, label: "Next.js" },
    { value: Framework.NODE, label: "Node.js" },
    { value: Framework.NEST, label: "NestJS" },
    { value: Framework.ANGULAR, label: "Angular" },
  ],
  [ProgrammingLanguage.PYTHON]: [
    { value: Framework.DJANGO, label: "Django" },
    { value: Framework.FASTAPI, label: "FastAPI" },
  ],
  [ProgrammingLanguage.JAVA]: [
    { value: Framework.SPRING_BOOT, label: "Spring Boot" },
  ],
};

const TECH_FOCUS: Array<{
  value: TechnicalFocus;
  label: string;
  icon: typeof Brain;
}> = [
  { value: TechnicalFocus.ALL, label: "All Topics", icon: Layers },
  {
    value: TechnicalFocus.LANGUAGE_CONCEPTS,
    label: "Language Concepts",
    icon: BookOpen,
  },
  { value: TechnicalFocus.DSA, label: "DSA & Algorithms", icon: Brain },
  {
    value: TechnicalFocus.SYSTEM_DESIGN,
    label: "System Design",
    icon: HelpCircle,
  },
];

const NON_TECH_CATEGORIES: Array<{
  value: NonTechnicalCategory;
  label: string;
}> = [
  { value: NonTechnicalCategory.HR, label: "HR / Behavioral" },
  { value: NonTechnicalCategory.APTITUDE, label: "Aptitude & Logical" },
  { value: NonTechnicalCategory.SITUATIONAL, label: "Situational Judgment" },
];

function getQuestionCount(config: Partial<VideoInterviewConfig>): string {
  const d = config.difficulty || Difficulty.MEDIUM;
  switch (config.mode) {
    case InterviewMode.TECHNICAL:
      return d === Difficulty.HARD
        ? "~7 questions"
        : d === Difficulty.EASY
          ? "~5 questions"
          : "~6 questions";
    case InterviewMode.NON_TECHNICAL:
      return d === Difficulty.HARD
        ? "~7 questions"
        : d === Difficulty.EASY
          ? "~3 questions"
          : "~5 questions";
    case InterviewMode.MIXED:
      return d === Difficulty.HARD
        ? "~9 questions, 4 rounds"
        : d === Difficulty.EASY
          ? "~6 questions, 4 rounds"
          : "~8 questions, 4 rounds";
    default:
      return "";
  }
}

export default function VideoMockPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(0); // 0=mode, 1=options, 2=difficulty, 3=confirm
  const [showPreflight, setShowPreflight] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [language, setLanguage] = useState<ProgrammingLanguage | null>(null);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [techFocus, setTechFocus] = useState<TechnicalFocus>(
    TechnicalFocus.ALL,
  );
  const [nonTechCategory, setNonTechCategory] = useState<NonTechnicalCategory>(
    NonTechnicalCategory.HR,
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  const needsTechOptions =
    mode === InterviewMode.TECHNICAL || mode === InterviewMode.MIXED;
  const needsNonTechOptions = mode === InterviewMode.NON_TECHNICAL;
  const totalSteps = needsTechOptions ? 4 : needsNonTechOptions ? 3 : 3;

  const buildConfig = (): VideoInterviewConfig => ({
    mode: mode!,
    difficulty,
    ...(needsTechOptions && language && { language }),
    ...(needsTechOptions && framework && { framework }),
    ...(needsTechOptions && { technicalFocus: techFocus }),
    ...(needsNonTechOptions && { nonTechnicalCategory: nonTechCategory }),
  });

  const handleStart = async () => {
    if (!isAuthenticated || !user) {
      router.push(`${ROUTES.LOGIN}?callback=${ROUTES.MOCK_VIDEO}`);
      return;
    }
    setIsStarting(true);
    try {
      const session = await startVideoMock(user.id, buildConfig());
      router.push(`${ROUTES.MOCK_VIDEO}/${session.id}`);
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : VIDEO_MOCK_SETUP_MESSAGES.START_FAILED_FALLBACK,
      );
      setShowPreflight(false);
    } finally {
      setIsStarting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return mode !== null;
    if (step === 1 && needsTechOptions) return language !== null;
    if (step === 1 && needsNonTechOptions) return true;
    return true;
  };

  const next = () => {
    if (step === 0 && !needsTechOptions && !needsNonTechOptions) {
      // Non-technical with no extra options → skip to difficulty
      setStep(2);
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    if (step === 2 && !needsTechOptions && !needsNonTechOptions) {
      setStep(0);
    } else {
      setStep((s) => s - 1);
    }
  };

  const isLastStep = step >= totalSteps - 1;

  return (
    <>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              {VIDEO_MOCK_SETUP_CONTENT.EYEBROW}
            </span>
            <h1
              className={cn(
                dmSans.className,
                "text-3xl md:text-4xl font-bold mb-2",
              )}
            >
              {VIDEO_MOCK_SETUP_CONTENT.TITLE}
            </h1>
            <p className="text-muted-foreground">
              {step === 0 && VIDEO_MOCK_SETUP_CONTENT.STEP_CHOOSE_TYPE}
              {step === 1 &&
                needsTechOptions &&
                VIDEO_MOCK_SETUP_CONTENT.STEP_TECH_STACK}
              {step === 1 &&
                needsNonTechOptions &&
                VIDEO_MOCK_SETUP_CONTENT.STEP_CATEGORY}
              {step === 2 &&
                needsTechOptions &&
                VIDEO_MOCK_SETUP_CONTENT.STEP_FOCUS_AREA}
              {((step === 2 && !needsTechOptions) || step === 3) &&
                VIDEO_MOCK_SETUP_CONTENT.STEP_DIFFICULTY}
            </p>
          </motion.div>

          {/* Progress */}
          <div className="flex gap-2 mb-8 max-w-xs mx-auto">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>

          <Card className="glass border-primary/10">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 0: Interview Mode */}
                {step === 0 && (
                  <motion.div
                    key="mode"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-center mb-4">
                      {VIDEO_MOCK_SETUP_CONTENT.INTERVIEW_TYPE_HEADING}
                    </h3>
                    <div className="grid gap-3">
                      {MODES.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setMode(m.value)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                            mode === m.value
                              ? "border-primary bg-primary/10 ring-2 ring-primary"
                              : "hover:bg-accent border-border",
                          )}
                        >
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <m.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{m.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {m.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Tech stack or Non-tech category */}
                {step === 1 && needsTechOptions && (
                  <motion.div
                    key="tech"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-semibold mb-3">
                        {VIDEO_MOCK_SETUP_CONTENT.LANGUAGE_HEADING}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {LANGUAGES.map((l) => (
                          <button
                            key={l.value}
                            onClick={() => {
                              setLanguage(l.value);
                              setFramework(null);
                            }}
                            className={cn(
                              "p-3 rounded-xl border text-center transition-all font-medium",
                              language === l.value
                                ? "border-primary bg-primary/10 ring-2 ring-primary"
                                : "hover:bg-accent border-border",
                            )}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {language && FRAMEWORKS[language]?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          {VIDEO_MOCK_SETUP_CONTENT.FRAMEWORK_HEADING}{" "}
                          <span className="text-muted-foreground font-normal">
                            {VIDEO_MOCK_SETUP_CONTENT.OPTIONAL}
                          </span>
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setFramework(null)}
                            className={cn(
                              "p-2.5 rounded-lg border text-sm transition-all",
                              !framework
                                ? "border-primary bg-primary/10"
                                : "hover:bg-accent border-border",
                            )}
                          >
                            {VIDEO_MOCK_SETUP_CONTENT.NONE}
                          </button>
                          {FRAMEWORKS[language].map((f) => (
                            <button
                              key={f.value}
                              onClick={() => setFramework(f.value)}
                              className={cn(
                                "p-2.5 rounded-lg border text-sm transition-all",
                                framework === f.value
                                  ? "border-primary bg-primary/10"
                                  : "hover:bg-accent border-border",
                              )}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 1 && needsNonTechOptions && (
                  <motion.div
                    key="nontech"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-center mb-4">
                      {VIDEO_MOCK_SETUP_CONTENT.CATEGORY_HEADING}
                    </h3>
                    <div className="grid gap-3">
                      {NON_TECH_CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setNonTechCategory(c.value)}
                          className={cn(
                            "p-4 rounded-xl border text-center transition-all font-medium",
                            nonTechCategory === c.value
                              ? "border-primary bg-primary/10 ring-2 ring-primary"
                              : "hover:bg-accent border-border",
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Technical focus (tech/mixed only) */}
                {step === 2 && needsTechOptions && (
                  <motion.div
                    key="focus"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-center mb-4">
                      {VIDEO_MOCK_SETUP_CONTENT.FOCUS_AREA_HEADING}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {TECH_FOCUS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setTechFocus(f.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                            techFocus === f.value
                              ? "border-primary bg-primary/10 ring-2 ring-primary"
                              : "hover:bg-accent border-border",
                          )}
                        >
                          <f.icon className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Final Step: Difficulty + Confirm */}
                {((step === 2 && !needsTechOptions) ||
                  (step === 3 && needsTechOptions)) && (
                  <motion.div
                    key="difficulty"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-semibold text-center mb-4">
                        {VIDEO_MOCK_SETUP_CONTENT.DIFFICULTY_HEADING}
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          Difficulty.EASY,
                          Difficulty.MEDIUM,
                          Difficulty.HARD,
                        ].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={cn(
                              "p-4 rounded-xl border text-center transition-all",
                              difficulty === d
                                ? "border-primary bg-primary/10 ring-2 ring-primary"
                                : "hover:bg-accent border-border",
                            )}
                          >
                            <span className="font-medium">{d}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                      <h4 className="font-semibold text-sm">
                        {VIDEO_MOCK_SETUP_CONTENT.SUMMARY_TITLE}
                      </h4>
                      <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                        <span className="text-muted-foreground">
                          {VIDEO_MOCK_SETUP_CONTENT.SUMMARY_TYPE}
                        </span>
                        <span className="font-medium">
                          {MODES.find((m) => m.value === mode)?.label}
                        </span>
                        {language && (
                          <>
                            <span className="text-muted-foreground">
                              {VIDEO_MOCK_SETUP_CONTENT.SUMMARY_STACK}
                            </span>
                            <span className="font-medium">
                              {
                                LANGUAGES.find((l) => l.value === language)
                                  ?.label
                              }
                              {framework
                                ? ` / ${FRAMEWORKS[language]?.find((f) => f.value === framework)?.label}`
                                : ""}
                            </span>
                          </>
                        )}
                        <span className="text-muted-foreground">
                          {VIDEO_MOCK_SETUP_CONTENT.SUMMARY_DIFFICULTY}
                        </span>
                        <span className="font-medium">{difficulty}</span>
                        <span className="text-muted-foreground">
                          {VIDEO_MOCK_SETUP_CONTENT.SUMMARY_QUESTIONS}
                        </span>
                        <span className="font-medium">
                          {getQuestionCount({ mode: mode!, difficulty })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <Button variant="outline" onClick={back} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />{" "}
                    {VIDEO_MOCK_SETUP_CONTENT.BACK}
                  </Button>
                )}
                <Button
                  onClick={isLastStep ? () => setShowPreflight(true) : next}
                  disabled={!canProceed() || isStarting}
                  className={cn(
                    "flex-1 gap-2 shadow-lg shadow-primary/20",
                    dmSans.className,
                  )}
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />{" "}
                      {VIDEO_MOCK_SETUP_CONTENT.STARTING}
                    </>
                  ) : isLastStep ? (
                    <>
                      <Video className="h-4 w-4" />{" "}
                      {VIDEO_MOCK_SETUP_CONTENT.START_INTERVIEW}
                    </>
                  ) : (
                    <>
                      {VIDEO_MOCK_SETUP_CONTENT.NEXT}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showPreflight && (
        <VideoPreflightCheck
          onReady={handleStart}
          onCancel={() => setShowPreflight(false)}
        />
      )}
    </>
  );
}
