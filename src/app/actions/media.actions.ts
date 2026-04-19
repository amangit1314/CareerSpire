'use server';

import { prisma } from '@/lib/prisma';
import { createSignedUploadUrl, getSignedUrl } from '@/lib/supabase/storage';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

const uploadMediaSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1),
  size: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
});

export async function createMediaUploadUrlAction(input: unknown) {
  const userId = await requireAuth();
  const data = uploadMediaSchema.parse(input);

  try {
    const { uploadUrl, path, signedUrl } = await createSignedUploadUrl(
      userId,
      data.fileName,
      data.contentType,
      data.size
    );

    // Store media object metadata
    const mediaObject = await prisma.mediaObject.create({
      data: {
        userId,
        bucket: 'media',
        path,
        contentType: data.contentType,
        size: data.size,
        signedUrlExpires: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    });

    return {
      uploadUrl,
      path,
      signedUrl,
      mediaId: mediaObject.id,
    };
  } catch (error: unknown) {
    throw new AppError(
      error instanceof Error ? error.message : 'Failed to create upload URL',
      'MEDIA_UPLOAD_ERROR',
      400
    );
  }
}

export async function getMediaSignedUrlAction(mediaId: string) {
  const userId = await requireAuth();

  const mediaObject = await prisma.mediaObject.findFirst({
    where: {
      id: mediaId,
      userId,
    },
  });

  if (!mediaObject) {
    throw new AppError('Media not found', 'NOT_FOUND', 404);
  }

  // Check if signed URL is still valid
  if (mediaObject.signedUrlExpires && mediaObject.signedUrlExpires > new Date()) {
    // Return existing signed URL if still valid
    const signedUrl = await getSignedUrl(mediaObject.path);
    return { signedUrl, expiresAt: mediaObject.signedUrlExpires };
  }

  // Generate new signed URL
  const signedUrl = await getSignedUrl(mediaObject.path);
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

  await prisma.mediaObject.update({
    where: { id: mediaId },
    data: { signedUrlExpires: expiresAt },
  });

  return { signedUrl, expiresAt };
}

export async function deleteMediaAction(mediaId: string) {
  const userId = await requireAuth();

  const mediaObject = await prisma.mediaObject.findFirst({
    where: {
      id: mediaId,
      userId,
    },
  });

  if (!mediaObject) {
    throw new AppError('Media not found', 'NOT_FOUND', 404);
  }

  // Delete from Supabase storage
  const { deleteMedia } = await import('@/lib/supabase/storage');
  await deleteMedia(mediaObject.path);

  // Delete from database
  await prisma.mediaObject.delete({
    where: { id: mediaId },
  });

  return { success: true };
}
