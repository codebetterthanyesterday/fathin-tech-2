'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';
import { getSession } from '@/lib/auth';
import { messageEmitter } from '@/lib/sse/message-emitter';
import { revalidatePath } from 'next/cache';
import { ContactMessageStatus } from '@/app/generated/prisma/client';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
  // Honeypot field
  website: z.string().optional().or(z.literal('')),
});

// In-memory rate limiting map: IP -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 3; // max 3 submissions per minute

/**
 * Public submission action shared across all templates.
 */
export async function submitContact(formData: FormData) {
  try {
    // 1. Rate Limiting Check
    let ip = 'unknown';
    try {
      const headersList = await headers();
      const forwardedFor = headersList.get('x-forwarded-for');
      const realIp = headersList.get('x-real-ip');
      ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'unknown';
    } catch {
      ip = 'unknown';
    }

    if (ip !== 'unknown') {
      const now = Date.now();
      const userRequests = rateLimitMap.get(ip) || [];

      // Retain only timestamps within active window
      const recentRequests = userRequests.filter(
        (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
      );

      if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return {
          success: false,
          error: 'Too many requests. Please wait a moment before sending another transmission.',
        };
      }

      recentRequests.push(now);
      rateLimitMap.set(ip, recentRequests);
    }

    // 2. Parse and Validate Data
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      website: formData.get('website'), // Honeypot
    };

    const parsed = contactSchema.safeParse(rawData);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        validationErrors: errors,
      };
    }

    const { name, email, message, website } = parsed.data;

    // 3. Honeypot check: If bot filled the field, SILENTLY DROP
    // Zero database record, zero SSE broadcast, zero toast, zero badge change
    if (website && website.length > 0) {
      console.warn(`[Spam Guard] Honeypot triggered from IP: ${ip}`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true };
    }

    // 4. Save to Database FIRST (Source of Truth)
    const savedRecord = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        status: ContactMessageStatus.NEW,
      },
    });

    // 5. Trigger SSE Broadcast as a separate, decoupled step
    try {
      messageEmitter.broadcast({
        id: savedRecord.id,
        name: savedRecord.name,
        email: savedRecord.email,
        message: savedRecord.message,
        status: savedRecord.status,
        createdAt: savedRecord.createdAt.toISOString(),
      });
    } catch (broadcastError) {
      console.error('[SSE Emitter] Broadcast notification failed (database record safe):', broadcastError);
    }

    return { success: true };
  } catch (error) {
    console.error('[Contact Action] Submission error:', error);
    return {
      success: false,
      error: 'Failed to send message. Please try again or reach out via direct email.',
    };
  }
}

/**
 * Admin action to fetch contact messages with status filter and search.
 */
export async function getContactMessages({
  status = 'ALL',
  search = '',
  page = 1,
  limit = 20,
}: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const whereClause: any = {};

  if (status && status !== 'ALL') {
    whereClause.status = status as ContactMessageStatus;
  }

  if (search && search.trim().length > 0) {
    const q = search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [messages, total, statusGroups] = await Promise.all([
    prisma.contactMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where: whereClause }),
    prisma.contactMessage.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = {
    ALL: 0,
    NEW: 0,
    READ: 0,
    REPLIED: 0,
    ARCHIVED: 0,
  };

  statusGroups.forEach((g) => {
    counts[g.status] = g._count._all;
    counts.ALL += g._count._all;
  });

  return {
    messages: messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
    total,
    counts,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin action to update message status (e.g. NEW -> READ, REPLIED, ARCHIVED).
 */
export async function updateMessageStatus(
  id: string,
  newStatus: ContactMessageStatus
) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath('/admin-portal/messages');
  return {
    success: true,
    message: {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    },
  };
}

/**
 * Admin action to delete a contact message.
 */
export async function deleteContactMessage(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  await prisma.contactMessage.delete({
    where: { id },
  });

  revalidatePath('/admin-portal/messages');
  return { success: true };
}

/**
 * Admin action to get unread message count.
 */
export async function getUnreadMessageCount() {
  const session = await getSession();
  if (!session) return 0;

  try {
    return await prisma.contactMessage.count({
      where: { status: ContactMessageStatus.NEW },
    });
  } catch {
    return 0;
  }
}
