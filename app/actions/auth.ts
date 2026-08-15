'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sendPasswordResetEmail } from '@/lib/email';

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

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      error: 'Email atau password tidak valid.',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: validatedFields.data.email },
    });

    if (!user) {
      return {
        error: 'Email atau password salah.',
      };
    }

    const passwordMatch = await bcrypt.compare(
      validatedFields.data.password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return {
        error: 'Email atau password salah.',
      };
    }

    await createSession({
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    return {
      error: 'Terjadi kesalahan saat memproses login.',
    };
  }

  redirect('/admin');
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
    'Jika email terdaftar di sistem, kami telah mengirimkan tautan untuk mengatur ulang kata sandi. Silakan periksa kotak masuk atau folder spam Anda.';

  if (!validated.success) {
    return {
      error: 'Mohon masukkan format email yang valid.',
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
    return { valid: false, error: 'Tautan reset tidak valid.' };
  }

  try {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return {
        valid: false,
        error: 'Tautan reset tidak valid atau telah digunakan sebelumnya.',
      };
    }

    if (new Date() > resetRecord.expiresAt) {
      return {
        valid: false,
        error: 'Tautan reset telah kedaluwarsa (masa berlaku 1 jam). Silakan minta tautan baru.',
      };
    }

    return {
      valid: true,
      email: resetRecord.user.email,
    };
  } catch (error) {
    console.error('Verify reset token error:', error);
    return { valid: false, error: 'Terjadi kesalahan saat memverifikasi tautan.' };
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
      validated.error.issues[0]?.message || 'Isian formulir tidak valid.';
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
          'Tautan reset tidak valid atau telah digunakan sebelumnya. Silakan minta tautan baru.',
      };
    }

    if (new Date() > resetRecord.expiresAt) {
      return {
        error:
          'Tautan reset telah kedaluwarsa. Silakan minta tautan baru.',
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
        'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru.',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      error: 'Terjadi kesalahan saat memperbarui kata sandi. Silakan coba lagi.',
    };
  }
}
