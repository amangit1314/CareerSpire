'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { sendEmailTemplate } from '@/lib/supabase/email';
import { createNotificationAction } from './notification.actions';
import { NotificationType } from '@/types/enums';
import type { SignUpRequest, SignInRequest, AuthResponse, User } from '@/types';
import type { User as PrismaUser } from '@prisma/client';
import { UserLevel, SubscriptionTier } from '@/types/enums';
import { z } from 'zod';
import crypto from 'node:crypto';



function toUserResponse(user: PrismaUser): User {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    image: user.image,
    level: user.level as unknown as UserLevel,
    freeMocksRemaining: user.freeMocksRemaining,
    subscriptionTier: user.subscriptionTier as unknown as SubscriptionTier | null,
    subscriptionEndsAt: user.subscriptionEndsAt,
    weakTopics: user.weakTopics,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    xp: user.xp ?? 0,
    currentStreak: user.currentStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    lastPracticeAt: user.lastPracticeAt ?? null,
    badges: user.badges ?? [],
    totalMocksCompleted: user.totalMocksCompleted ?? 0,
  };
}

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().max(100).optional(),
});

export async function signUpAction(data: SignUpRequest): Promise<AuthResponse> {
  try {
    const validated = signUpSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      throw new AppError(
        'This email is already registered. Please use a different email or try logging in.',
        'EMAIL_EXISTS',
        400
      );
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        level: UserLevel.FRESHER,
        freeMocksRemaining: 3,
        subscriptionTier: SubscriptionTier.FREE,
        weakTopics: [],
        lastLoginAt: new Date(),
        notificationPreference: {
          create: {
            emailEnabled: true,
            inAppEnabled: true,
            digestEnabled: false,
          },
        },
      },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await setAuthCookies(accessToken, refreshToken, user.id);

    // Send welcome email (non-blocking)
    sendEmailTemplate('welcome', user.email, {
      name: user.name || 'there',
    }).catch(() => {});

    // Create welcome notification (non-blocking)
    createNotificationAction({
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: 'Welcome to CareerSpire!',
      body: 'You have 3 free mock interviews every month to get started. Start practicing now!',
      sendEmail: false,
    }).catch(() => {});

    return {
      user: toUserResponse(user),
      session: {
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      },
    };

  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof z.ZodError) {
      throw new AppError(
        error.issues[0]?.message || 'Invalid input',
        'VALIDATION_ERROR',
        400
      );
    }
    throw new AppError('Failed to create account. Please try again.', 'SIGNUP_ERROR', 500);
  }
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function signInAction(data: SignInRequest): Promise<AuthResponse> {
  try {
    const validated = signInSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user || !user.passwordHash) {
      throw new AppError(
        'The email or password you entered is incorrect. Please check and try again.',
        'INVALID_CREDENTIALS',
        401
      );
    }

    const isValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(
        'The email or password you entered is incorrect. Please check and try again.',
        'INVALID_CREDENTIALS',
        401
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    await setAuthCookies(accessToken, refreshToken, user.id);

    return {
      user: toUserResponse(user),
      session: {
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof z.ZodError) {
      throw new AppError(
        error.issues[0]?.message || 'Invalid input',
        'VALIDATION_ERROR',
        400
      );
    }
    throw new AppError('Failed to sign in. Please try again.', 'SIGNIN_ERROR', 500);
  }
}


export async function signOutAction(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await clearAuthCookies();
}

export async function refreshTokenAction(refreshToken: string): Promise<{ accessToken: string }> {
  const { verifyRefreshToken, generateAccessToken } = await import('@/lib/auth');
  const payload = await verifyRefreshToken(refreshToken);
  const accessToken = generateAccessToken(payload);
  return { accessToken };
}

export async function getCurrentUserAction(): Promise<User> {
  const { requireAuth } = await import('@/lib/auth');
  const userId = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 404);
  }

  return toUserResponse(user);
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function requestPasswordResetAction(data: { email: string }): Promise<{ message: string }> {
  try {
    const validated = forgotPasswordSchema.parse(data);
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      // Don't reveal if user exists — return same message regardless
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    await sendEmailTemplate('password-reset', user.email, {
      name: user.name || 'there',
      resetUrl,
    });

    return { message: 'If an account exists with this email, a reset link has been sent.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0]?.message || 'Invalid input', 'VALIDATION_ERROR', 400);
    }
    throw new AppError('Failed to process password reset request', 'FORGOT_PASSWORD_ERROR', 500);
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function resetPasswordAction(data: z.infer<typeof resetPasswordSchema>): Promise<{ success: boolean }> {
  try {
    const validated = resetPasswordSchema.parse(data);

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: validated.token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new AppError('Invalid or expired reset token. Please request a new one.', 'INVALID_TOKEN', 400);
    }

    const passwordHash = await hashPassword(validated.password);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { passwordHash },
    });

    await prisma.verificationToken.delete({
      where: { token: validated.token },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0]?.message || 'Invalid input', 'VALIDATION_ERROR', 400);
    }
    throw new AppError('Failed to reset password', 'RESET_PASSWORD_ERROR', 500);
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function changePasswordAction(data: z.infer<typeof changePasswordSchema>): Promise<{ success: boolean }> {
  try {
    const { requireAuth } = await import('@/lib/auth');
    const userId = await requireAuth();

    const validated = changePasswordSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('User not found or password not set', 'USER_NOT_FOUND', 404);
    }

    const isValid = await verifyPassword(validated.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('The current password you entered is incorrect.', 'INVALID_PASSWORD', 401);
    }

    const passwordHash = await hashPassword(validated.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0]?.message || 'Invalid input', 'VALIDATION_ERROR', 400);
    }
    throw new AppError('Failed to change password', 'CHANGE_PASSWORD_ERROR', 500);
  }
}

export async function deleteAccountAction(): Promise<{ success: boolean }> {
  try {
    const { requireAuth } = await import('@/lib/auth');
    const userId = await requireAuth();

    await prisma.user.delete({
      where: { id: userId },
    });

    await clearAuthCookies();

    return { success: true };
  } catch (error) {
    throw new AppError('Failed to delete account. Please try again later.', 'DELETE_ACCOUNT_ERROR', 500);
  }
}
