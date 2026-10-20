"use server";

import { prisma } from "@/lib/prisma";
import { MockSessionStatus, ErrorCode } from "@/types/enums";
import { AppError } from "@/lib/errors";

// Save video recording URL to session
export async function saveVideoRecording(
  userId: string,
  sessionId: string,
  videoUrl: string,
  thumbnailUrl?: string,
): Promise<void> {
  const session = await prisma.mockSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new AppError("Session not found", ErrorCode.NOT_FOUND, 404);
  }

  await prisma.mockSession.update({
    where: { id: sessionId },
    data: {
      ...(videoUrl ? { videoRecordingUrl: videoUrl } : {}),
      ...(thumbnailUrl ? { videoThumbnailUrl: thumbnailUrl } : {}),
      status: MockSessionStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
}

// Toggle video interview public visibility
export async function toggleVideoPublic(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const session = await prisma.mockSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new AppError("Session not found", ErrorCode.NOT_FOUND, 404);
  }

  const updated = await prisma.mockSession.update({
    where: { id: sessionId },
    data: { isPublic: !session.isPublic },
  });

  return updated.isPublic;
}
