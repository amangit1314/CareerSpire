"use server";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { ErrorCode } from "@/types/enums";
import { getSignedUrl } from "@/lib/supabase/storage";

// Get public video interviews (community feed)
export async function getPublicVideoInterviews(
  page: number = 1,
  limit: number = 12,
) {
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.mockSession.findMany({
      where: {
        interviewType: "VIDEO",
        isPublic: true,
        videoRecordingUrl: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.mockSession.count({
      where: {
        interviewType: "VIDEO",
        isPublic: true,
        videoRecordingUrl: { not: null },
      },
    }),
  ]);

  return {
    videos: await Promise.all(
      sessions.map(async (s) => ({
        id: s.id,
        videoUrl: s.videoRecordingUrl
          ? await getSignedUrl(s.videoRecordingUrl).catch(() => null)
          : null,
        thumbnailUrl: s.videoThumbnailUrl
          ? await getSignedUrl(s.videoThumbnailUrl).catch(() => null)
          : null,
        views: s.views,
        likes: s.likes,
        difficulty: s.difficulty,
        createdAt: s.startedAt,
        user: s.user,
      })),
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Like a video interview
export async function likeVideoInterview(
  userId: string,
  sessionId: string,
): Promise<{ liked: boolean; likes: number }> {
  // Check if already liked
  const existingLike = await prisma.videoLike.findUnique({
    where: {
      sessionId_userId: { sessionId, userId },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.videoLike.delete({
      where: { id: existingLike.id },
    });

    const updated = await prisma.mockSession.update({
      where: { id: sessionId },
      data: { likes: { decrement: 1 } },
    });

    return { liked: false, likes: updated.likes };
  } else {
    // Like
    await prisma.videoLike.create({
      data: { sessionId, userId },
    });

    const updated = await prisma.mockSession.update({
      where: { id: sessionId },
      data: { likes: { increment: 1 } },
    });

    return { liked: true, likes: updated.likes };
  }
}

// Increment view count
export async function incrementVideoViews(sessionId: string): Promise<void> {
  await prisma.mockSession.update({
    where: { id: sessionId },
    data: { views: { increment: 1 } },
  });
}

// Add comment to video
export async function addVideoComment(
  userId: string,
  sessionId: string,
  content: string,
): Promise<{ id: string; content: string; createdAt: Date }> {
  // Sanitize: strip HTML tags, limit length
  const sanitized = content
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 2000);
  if (!sanitized) {
    throw new AppError(
      "Comment cannot be empty",
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  const comment = await prisma.videoComment.create({
    data: { sessionId, userId, content: sanitized },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
  };
}

// Get comments for a video
export async function getVideoComments(sessionId: string) {
  const comments = await prisma.videoComment.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return comments;
}
