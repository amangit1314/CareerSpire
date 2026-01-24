/*
  Warnings:

  - You are about to drop the column `codingQuestions` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `hrQuestions` on the `questions` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'VIDEO';

-- AlterTable
ALTER TABLE "mock_sessions" ADD COLUMN     "codingQuestions" JSONB,
ADD COLUMN     "hrQuestions" JSONB,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoRecordingUrl" TEXT,
ADD COLUMN     "videoThumbnailUrl" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "questionIds" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "codingQuestions",
DROP COLUMN "hrQuestions";

-- CreateTable
CREATE TABLE "video_likes" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_comments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_experiences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "outcome" TEXT NOT NULL,
    "rounds" INTEGER NOT NULL DEFAULT 1,
    "questions" JSONB NOT NULL,
    "tips" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_likes_sessionId_idx" ON "video_likes"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "video_likes_sessionId_userId_key" ON "video_likes"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "video_comments_sessionId_idx" ON "video_comments"("sessionId");

-- CreateIndex
CREATE INDEX "interview_experiences_company_idx" ON "interview_experiences"("company");

-- CreateIndex
CREATE INDEX "interview_experiences_userId_idx" ON "interview_experiences"("userId");

-- CreateIndex
CREATE INDEX "interview_experiences_isPublic_idx" ON "interview_experiences"("isPublic");

-- CreateIndex
CREATE INDEX "mock_sessions_isPublic_idx" ON "mock_sessions"("isPublic");

-- AddForeignKey
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mock_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mock_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_experiences" ADD CONSTRAINT "interview_experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
