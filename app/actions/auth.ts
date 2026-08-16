'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sendPasswordResetEmail } from '@/lib/email';
import { getAdminPath } from '@/lib/routes';

// --- In-Memory Rate Limiting for Login ---
interface LoginAttempt {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(key: string): { allowed: boolean; retryAfterMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) return { allowed: true };

  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfterMinutes = Math.ceil((record.blockedUntil - now) / (60 * 1000));
    return { allowed: false, retryAfterMinutes };
  }

  // If window expired, reset
  if (now - record.firstAttemptAt > WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    const retryAfterMinutes = Math.ceil(BLOCK_DURATION_MS / (60 * 1000));
    return { allowed: false, retryAfterMinutes };
  }

  return { allowed: true };
}

function recordFailedLoginAttempt(key: string) {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
  } else {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }
}

function clearLoginAttempts(key: string) {
  loginAttempts.delete(key);
}

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export type AuthActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const normalizedEmail = String(email || '').toLowerCase().trim();
  const rateLimitKey = normalizedEmail || 'anonymous';
  const rateCheck = checkLoginRateLimit(rateLimitKey);

  if (!rateCheck.allowed) {
    return {
      error: `Rate limit exceeded. Retry in ${rateCheck.retryAfterMinutes || 15} minutes.`,
    };
  }

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    recordFailedLoginAttempt(rateLimitKey);
    return {
      error: 'Invalid credentials.',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: validatedFields.data.email },
    });

    if (!user) {
      recordFailedLoginAttempt(rateLimitKey);
      return {
        error: 'Invalid credentials.',
      };
    }

    const passwordMatch = await bcrypt.compare(
      validatedFields.data.password,
      user.passwordHash
    );

    if (!passwordMatch) {
      recordFailedLoginAttempt(rateLimitKey);
      return {
        error: 'Invalid credentials.',
      };
    }

    clearLoginAttempts(rateLimitKey);

    await createSession({
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    return {
      error: 'Authentication failed.',
    };
  }

  redirect(getAdminPath());
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

/**
 * Initiates the password reset process.
 * Always returns a generic success message to prevent user enumeration attacks.
 */
export async function forgotPassword(
  prevState: any,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string;

  const validated = forgotPasswordSchema.safeParse({ email });

  const genericSuccessMessage =
    'If the email is registered, a reset link has been dispatched.';

  if (!validated.success) {
    return {
      error: 'Validation error: Invalid email format.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });

    if (user) {
      // Check if user already requested a token in the last 2 minutes (basic rate-limiting)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          createdAt: { gte: twoMinutesAgo },
        },
      });

      if (!recentToken) {
        // Generate cryptographically secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token
        await prisma.passwordResetToken.create({
          data: {
            token,
            userId: user.id,
            expiresAt,
          },
        });

        // Determine base URL
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const resetUrl = `${siteUrl}/reset-password?token=${token}`;

        // Send reset email
        await sendPasswordResetEmail({
          to: user.email,
          resetUrl,
          userName: user.name,
        });
      }
    }

    return {
      success: genericSuccessMessage,
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    // Even on internal error, return generic message for security consistency
    return {
      success: genericSuccessMessage,
    };
  }
}

/**
 * Validates whether a given reset token is present and not expired.
 */
export async function verifyResetToken(token: string): Promise<{
  valid: boolean;
  email?: string;
  error?: string;
}> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Invalid reset link.' };
  }

  try {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return {
        valid: false,
        error: 'Invalid or used reset link.',
      };
    }

    if (new Date() > resetRecord.expiresAt) {
      return {
        valid: false,
        error: 'Reset link expired.',
      };
    }

    return {
      valid: true,
      email: resetRecord.user.email,
    };
  } catch (error) {
    console.error('Verify reset token error:', error);
    return { valid: false, error: 'Verification failed.' };
  }
}

/**
 * Resets the user's password, hashes with bcrypt, and invalidates all reset tokens for the user.
 */
export async function resetPassword(
  prevState: any,
  formData: FormData
): Promise<AuthActionState> {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const validated = resetPasswordSchema.safeParse({
    token,
    password,
    confirmPassword,
  });

  if (!validated.success) {
    const firstError =
      validated.error.issues[0]?.message || 'Validation error.';
    return {
      error: firstError,
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: validated.data.token },
    });

    if (!resetRecord) {
      return {
        error:
          'Invalid or used reset link.',
      };
    }

    if (new Date() > resetRecord.expiresAt) {
      return {
        error:
          'Reset link expired.',
      };
    }

    // Hash new password using bcrypt with 10 salt rounds (matching PBI-001)
    const newPasswordHash = await bcrypt.hash(validated.data.password, 10);

    // Update password and clean up all reset tokens for this user in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return {
      success:
        'Password updated.',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      error: 'Update failed: Unable to save new password.',
    };
  }
}
