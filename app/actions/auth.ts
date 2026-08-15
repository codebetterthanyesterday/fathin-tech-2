'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

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
      // Return generic error to avoid user enumeration
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

  // Redirect should be outside try-catch
  redirect('/admin');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
