'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail, sendEmailTemplate } from '@/lib/supabase/email';
import { NotificationType } from '@/types/enums';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  meta: z.record(z.string(), z.any()).optional(),
  sendEmail: z.boolean().optional().default(true),
});

export async function createNotificationAction(input: unknown) {
  try {
    const data = createNotificationSchema.parse(input);

    // Get user preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: data.userId },
    });

    // Create in-app notification if enabled
    if (preferences?.inAppEnabled !== false) {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          meta: (data.meta as any) || {},
        },
      });

      // Send email if enabled and requested
      if (data.sendEmail && preferences?.emailEnabled !== false) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { email: true, name: true },
          });

          if (user) {
            await sendEmail({
              to: user.email,
              subject: data.title,
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>${data.title}</h2><p>${data.body}</p></div>`,
              userId: data.userId,
              notificationId: notification.id,
            });
          }
        } catch (emailError) {
          // Don't fail notification creation if email fails
          console.error('Failed to send notification email:', emailError);
        }
      }

      return notification;
    }

    throw new AppError('Notification preferences disabled', 'NOTIFICATIONS_DISABLED', 400);
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof z.ZodError) {
      throw new AppError(
        'Invalid notification data',
        'VALIDATION_ERROR',
        400,
        error.flatten().fieldErrors
      );
    }
    throw new AppError('Failed to create notification', 'NOTIFICATION_ERROR', 500);
  }
}

export async function getNotificationsAction(userId: string, limit: number = 20, offset: number = 0) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });

  return {
    notifications,
    unreadCount,
    hasMore: notifications.length === limit,
  };
}

export async function markNotificationReadAction(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', 'NOT_FOUND', 404);
  }

  if (notification.readAt) {
    return notification; // Already read
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsReadAction(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function getNotificationPreferencesAction(userId: string) {
  let preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!preferences) {
    // Create default preferences
    preferences = await prisma.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        inAppEnabled: true,
        digestEnabled: false,
      },
    });
  }

  return preferences;
}

export async function updateNotificationPreferencesAction(
  userId: string,
  data: {
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
    digestEnabled?: boolean;
  }
) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: {
      emailEnabled: data.emailEnabled,
      inAppEnabled: data.inAppEnabled,
      digestEnabled: data.digestEnabled,
    },
    create: {
      userId,
      emailEnabled: data.emailEnabled ?? true,
      inAppEnabled: data.inAppEnabled ?? true,
      digestEnabled: data.digestEnabled ?? false,
    },
  });
}

// Helper function to send mock result notification
export async function sendMockResultNotification(
  userId: string,
  sessionId: string,
  score: number,
  feedback: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  await createNotificationAction({
    userId,
    type: NotificationType.MOCK_RESULT,
    title: 'Mock Interview Completed',
    body: `Your mock interview has been completed with a score of ${score}%. ${feedback}`,
    meta: { sessionId, score },
    sendEmail: true,
  });

  // Also send email template
  try {
    const userEmail = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (userEmail) {
      await sendEmailTemplate('mock-result', userEmail.email, {
        name: userEmail.name,
        score,
        sessionId,
        feedback,
      });
    }
  } catch (error) {
    console.error('Failed to send mock result email:', error);
  }
}
