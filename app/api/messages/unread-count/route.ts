import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const unreadCount = await prisma.contactMessage.count({
      where: {
        status: 'NEW',
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Failed to fetch unread message count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
