/**
 * app/actions/analytics.ts
 * Server-side only data fetching from Vercel Web Analytics API.
 * Never imported by client components — zero bundle impact on public pages.
 */

export interface AnalyticsSummary {
  pageviews: number;
  visitors: number;
  period: 7 | 30;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  topPages: TopPage[];
}

type FetchPeriod = 7 | 30;

function getDateRange(days: FetchPeriod): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return { from: fmt(from), to: fmt(to) };
}

async function vercelFetch(endpoint: string, queryParams: Record<string, string> = {}): Promise<any> {
  const token = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    throw new Error('VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID are required');
  }

  const url = new URL(`https://api.vercel.com/v1/query/web-analytics/${endpoint}`);
  url.searchParams.set('projectId', projectId);
  if (teamId) url.searchParams.set('teamId', teamId);

  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // Cache for 15 minutes — analytics data doesn't need to be real-time
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Vercel Analytics API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function fetchAnalyticsData(period: FetchPeriod = 7): Promise<AnalyticsData | null> {
  try {
    const { from, to } = getDateRange(period);

    const commonParams = {
      since: from,
      until: to,
    };

    // Fetch total pageviews & visitors (count) and top pages (aggregate) in parallel
    const [countData, aggregateData] = await Promise.all([
      vercelFetch('visits/count', commonParams),
      vercelFetch('visits/aggregate', { ...commonParams, by: 'route', limit: '8' }),
    ]);

    const pageviews: number = countData?.data?.pageviews ?? 0;
    const visitors: number = countData?.data?.visitors ?? 0;

    // Parse top pages
    const topPages: TopPage[] = Array.isArray(aggregateData?.data)
      ? aggregateData.data
          .map((p: any) => ({
            path: p.route ?? p.requestPath ?? '/',
            views: p.pageviews ?? 0,
          }))
          .filter((p: TopPage) => p.views > 0)
      : [];

    return {
      summary: { pageviews, visitors, period },
      topPages,
    };
  } catch (err) {
    // Graceful: never throw — return null so dashboard degrades cleanly
    if (process.env.NODE_ENV === 'development') {
      console.warn('[analytics] Failed to fetch Vercel Analytics data:', err);
    }
    return null;
  }
}

/** Returns true only if env vars are configured. */
export function isAnalyticsConfigured(): boolean {
  return Boolean(process.env.VERCEL_ACCESS_TOKEN && process.env.VERCEL_PROJECT_ID);
}
