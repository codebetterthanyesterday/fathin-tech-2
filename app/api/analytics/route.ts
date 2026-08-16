import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchAnalyticsData } from '@/app/actions/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Only accessible to authenticated admin users
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get('period');
  const period: 7 | 30 = periodParam === '30' ? 30 : 7;

  const data = await fetchAnalyticsData(period);
  return NextResponse.json(data);
}
