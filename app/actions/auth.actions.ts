'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { sendEmailTemplate } from '@/lib/supabase/email';
import { createNotificationAction } from './notification.actions';
import { NotificationType } from '@/types/enums';
import type { SignUpRequest, SignInRequest, AuthResponse, User } from '@/types';
import { UserLevel, SubscriptionTier } from '@/types/enums';
import { z } from 'zod';


function toUserResponse(user: any): User {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    image: user.image,
    level: user.level,
    freeMocksRemaining: user.freeMocksRemaining,
    subscriptionTier: user.subscriptionTier,
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
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export async function signUpAction(data: SignUpRequest): Promise<AuthResponse> {
  console.log('signUpAction: Validating input...');
  try {
    const validated = signUpSchema.parse(data);
    console.log('signUpAction: Input validated.');

    console.log('signUpAction: Checking existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      console.log('signUpAction: Email already exists:', validated.email);
      throw new AppError(
        'This email is already registered. Please use a different email or try logging in.',
        'EMAIL_EXISTS',
        400
      );
    }

    console.log('signUpAction: Hashing password...');
    const passwordHash = await hashPassword(validated.password);

    console.log('signUpAction: Creating user in DB...');
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        level: UserLevel.FRESHER,
        freeMocksRemaining: 2,
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

    console.log('signUpAction: User created successfully ID:', user.id);

    const tokenPayload = { userId: user.id, email: user.email };
    console.log('signUpAction: Generating tokens...');
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    console.log('signUpAction: Setting auth cookies...');
    await setAuthCookies(accessToken, refreshToken, user.id);
    console.log('signUpAction: Auth cookies set.');

    // Send welcome email
    try {
      console.log('signUpAction: Sending welcome email...');
      await sendEmailTemplate('welcome', user.email, {
        name: user.name || 'there',
      });
      console.log('signUpAction: Welcome email sent.');
    } catch (emailError) {
      console.error('signUpAction: Failed to send welcome email:', emailError);
    }

    // Create welcome notification
    try {
      console.log('signUpAction: Creating welcome notification...');
      await createNotificationAction({
        userId: user.id,
        type: NotificationType.SYSTEM,
        title: 'Welcome to Mocky!',
        body: 'You have 2 free mock interviews to get started. Start practicing now!',
        sendEmail: false,
      });
      console.log('signUpAction: Welcome notification created.');
    } catch (notifError) {
      console.error('signUpAction: Failed to create welcome notification:', notifError);
    }

    const response = {
      user: toUserResponse(user),
      session: {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    };
    console.log('signUpAction: Success! Returning response.');
    return response;

  } catch (error) {
    console.error('signUpAction: CRITICAL FAILURE:', error);
    if (error instanceof AppError) throw error;
    if (error instanceof z.ZodError) {
      throw new AppError(
        error.issues[0]?.message || 'Invalid input',
        'VALIDATION_ERROR',
        400
      );
    }
    throw new AppError(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`, 'SIGNUP_ERROR', 500);
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
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
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
