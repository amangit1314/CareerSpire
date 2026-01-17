-- CreateEnum
CREATE TYPE "Framework" AS ENUM ('REACT', 'ANGULAR', 'VUE', 'NODE', 'FASTAPI', 'DJANGO', 'SPRING_BOOT', 'NONE');

-- CreateEnum
CREATE TYPE "QuestionFormat" AS ENUM ('THEORY', 'OUTPUT_PREDICTION', 'CODE_WRITING', 'MCQ', 'DEBUGGING');

-- AlterEnum
ALTER TYPE "ProgrammingLanguage" ADD VALUE 'TYPESCRIPT';

-- AlterTable
ALTER TABLE "mock_sessions" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "framework" "Framework" DEFAULT 'NONE',
ADD COLUMN     "interviewType" "QuestionType" NOT NULL DEFAULT 'CODING',
ADD COLUMN     "language" "ProgrammingLanguage",
ADD COLUMN     "totalDuration" INTEGER NOT NULL DEFAULT 45;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "codeSnippet" TEXT,
ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "framework" "Framework" DEFAULT 'NONE',
ADD COLUMN     "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "questionFormat" "QuestionFormat" NOT NULL DEFAULT 'CODE_WRITING',
ADD COLUMN     "timeAllocation" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastPracticeAt" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalMocksCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "questions_framework_idx" ON "questions"("framework");
