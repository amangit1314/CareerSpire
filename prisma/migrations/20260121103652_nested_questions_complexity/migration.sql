-- CreateEnum
CREATE TYPE "AnswerFormat" AS ENUM ('SHORT_ANSWER', 'CODE_SNIPPET', 'REASONING', 'MCQ');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('BEHAVIORAL', 'REFLECTION', 'PUZZLE', 'MOTIVATION', 'CONFLICT', 'LEADERSHIP', 'OWNERSHIP');

-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('AI', 'CURATED', 'COMMUNITY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Framework" ADD VALUE 'NEXT';
ALTER TYPE "Framework" ADD VALUE 'NEST';

-- AlterEnum
ALTER TYPE "QuestionFormat" ADD VALUE 'DSA';

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "category" "QuestionCategory",
ADD COLUMN     "codingQuestions" JSONB,
ADD COLUMN     "expectedAnswerFormat" "AnswerFormat" NOT NULL DEFAULT 'SHORT_ANSWER',
ADD COLUMN     "expectedTimeMinutes" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "followUps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hrQuestions" JSONB,
ADD COLUMN     "source" "QuestionSource" NOT NULL DEFAULT 'AI',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ALTER COLUMN "testCases" DROP NOT NULL;
