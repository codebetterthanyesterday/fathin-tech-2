'use client';

import { useState, useTransition } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import type { AnalyticsData } from '@/app/actions/analytics';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonPulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-800/60 ${className}`} />;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Period tabs skeleton */}
      <div className="flex gap-2">
        <SkeletonPulse className="h-8 w-20 rounded-lg" />
        <SkeletonPulse className="h-8 w-20 rounded-lg" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonPulse className="h-28 rounded-xl" />
        <SkeletonPulse className="h-28 rounded-xl" />
      </div>

      {/* Top pages skeleton */}
      <div className="space-y-2.5">
        <SkeletonPulse className="h-4 w-24 mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <SkeletonPulse className="h-4 flex-1" />
            <SkeletonPulse className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sublabel,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  sublabel: string;
}) {
  const formatted = value.toLocaleString('en-US');

  return (
    <div className="relative p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden group hover:border-zinc-700/80 transition-colors duration-300">
      {/* Subtle background glow */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors duration-500" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <Icon className="w-4 h-4" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
      </div>

      <p className="text-3xl font-black text-white tracking-tighter leading-none mb-1.5">
        {formatted}
      </p>
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-zinc-300">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

// ─── Top Pages ────────────────────────────────────────────────────────────────

function TopPagesList({ pages }: { pages: { path: string; views: number }[] }) {
  if (pages.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-2">
        No page data for this period yet.
      </p>
    );
  }

  const maxViews = Math.max(...pages.map((p) => p.views));

  return (
    <ul className="space-y-2">
      {pages.map((page, i) => {
        const pct = maxViews > 0 ? (page.views / maxViews) * 100 : 0;
        return (
          <li key={page.path} className="group">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-zinc-600 w-4 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="text-sm text-zinc-300 truncate font-mono group-hover:text-white transition-colors"
                  title={page.path}
                >
                  {page.path}
                </span>
              </div>
              <span className="text-sm font-bold text-white flex-shrink-0">
                {page.views.toLocaleString()}
              </span>
            </div>
            {/* Progress bar */}
            <div className="ml-6 h-0.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-600 group-hover:bg-zinc-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Not Configured State ─────────────────────────────────────────────────────

function NotConfiguredState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
        <BarChart3 className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-300 mb-1">Telemetry Unconfigured</p>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
          Add{' '}
          <code className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">
            VERCEL_ACCESS_TOKEN
          </code>{' '}
          and{' '}
          <code className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">
            VERCEL_PROJECT_ID
          </code>{' '}
          to your{' '}
          <code className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">.env</code>{' '}
          file to enable analytics.
        </p>
      </div>
      <a
        href="https://vercel.com/account/tokens"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors underline underline-offset-4"
      >
        Create Vercel Access Token
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry, isPending }: { onRetry: () => void; isPending: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-red-950/30 border border-red-900/50 flex items-center justify-center text-red-400">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-300 mb-1">Telemetry Fetch Error</p>
        <p className="text-xs text-zinc-500">
          Check your Vercel token and Project ID, then try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
        {isPending ? 'Re-initializing…' : 'Re-initialize'}
      </button>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

interface AnalyticsWidgetProps {
  initialData: AnalyticsData | null;
  isConfigured: boolean;
}

export default function AnalyticsWidget({ initialData, isConfigured }: AnalyticsWidgetProps) {
  const [period, setPeriod] = useState<7 | 30>(7);
  const [data, setData] = useState<AnalyticsData | null>(initialData);
  const [loadingPeriod, setLoadingPeriod] = useState<7 | 30 | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchForPeriod = (newPeriod: 7 | 30) => {
    if (newPeriod === period && !hasError) return;
    setLoadingPeriod(newPeriod);
    setHasError(false);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/analytics?period=${newPeriod}`);
        if (!res.ok) throw new Error('API error');
        const newData: AnalyticsData | null = await res.json();
        setData(newData);
        setPeriod(newPeriod);
        if (!newData) setHasError(true);
      } catch {
        setHasError(true);
      } finally {
        setLoadingPeriod(null);
      }
    });
  };

  const isLoading = loadingPeriod !== null;

  return (
    <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">System Telemetry</h3>
            <p className="text-[11px] text-zinc-500 font-mono">via Vercel Analytics Provider</p>
          </div>
        </div>

        {isConfigured && !hasError && (
          <a
            href="https://vercel.com/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            External Metrics
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Not configured */}
      {!isConfigured && <NotConfiguredState />}

      {/* Configured state */}
      {isConfigured && (
        <>
          {/* Period Switcher */}
          <div className="flex items-center gap-2">
            {([7, 30] as const).map((p) => (
              <button
                key={p}
                onClick={() => fetchForPeriod(p)}
                disabled={isLoading}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  period === p
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                } disabled:opacity-50`}
              >
                {p === 7 ? 'Last 7 days' : 'Last 30 days'}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {isLoading && <AnalyticsSkeleton />}

          {/* Error */}
          {!isLoading && hasError && (
            <ErrorState onRetry={() => fetchForPeriod(period)} isPending={isPending} />
          )}

          {/* Content */}
          {!isLoading && !hasError && data && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Pageviews"
                  value={data.summary.pageviews}
                  icon={Eye}
                  sublabel={`Last ${period} days`}
                />
                <StatCard
                  label="Unique Visitors"
                  value={data.summary.visitors}
                  icon={Users}
                  sublabel={`Last ${period} days`}
                />
              </div>

              {/* Top Pages */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Top Pages
                  </p>
                </div>
                <TopPagesList pages={data.topPages} />
              </div>
            </>
          )}

          {/* No data state */}
          {!isLoading && !hasError && data && data.summary.pageviews === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-500">
                No telemetry data present for the selected interval.
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Make sure Web Analytics is enabled in your Vercel project settings.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
