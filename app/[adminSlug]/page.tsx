import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Layers,
  UserCircle2,
  Wrench,
  FolderGit2,
  Briefcase,
  MessageSquareQuote,
  FileText,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { fetchAnalyticsData, isAnalyticsConfigured } from '@/app/actions/analytics';
import { getAdminPath } from '@/lib/routes';
import AnalyticsWidget from '@/components/admin/dashboard/analytics-widget';

export const metadata: Metadata = {
  title: 'Dashboard',
};

// Pre-fetch 7-day data on the server — no client bundle weight
async function AnalyticsSection() {
  const configured = isAnalyticsConfigured();
  const initialData = configured ? await fetchAnalyticsData(7) : null;

  return <AnalyticsWidget initialData={initialData} isConfigured={configured} />;
}

// ─── Quick Link Card ──────────────────────────────────────────────────────────

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-zinc-700/80 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
          {title}
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

const QUICK_LINKS = [
  {
    subpath: 'skills',
    icon: Wrench,
    title: 'Skills',
    description: 'Technical stack and proficiencies.',
  },
  {
    subpath: 'projects',
    icon: FolderGit2,
    title: 'Projects',
    description: 'Manage portfolio entries and display order.',
  },
  {
    subpath: 'experience',
    icon: Briefcase,
    title: 'Experience',
    description: 'Career and education history.',
  },
  {
    subpath: 'sections',
    icon: Layers,
    title: 'Sections',
    description: 'System layout and component visibility.',
  },
  {
    subpath: 'testimonials',
    icon: MessageSquareQuote,
    title: 'Testimonials',
    description: 'Client endorsements and quotes.',
  },
  {
    subpath: 'articles',
    icon: FileText,
    title: 'Articles',
    description: 'Content management for technical publications.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  return (
    <div className="max-w-5xl space-y-10">

      {/* Header */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
          // Admin Dashboard
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
          Dashboard
        </h1>
        <p className="text-zinc-400 mt-2 text-sm sm:text-base">
          System overview and quick access.
        </p>
      </div>

      {/* Main layout: Analytics + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics widget — spans 1 col on left */}
        <div className="lg:col-span-1">
          <Suspense
            fallback={
              <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 animate-pulse h-[380px]" />
            }
          >
            <AnalyticsSection />
          </Suspense>
        </div>

        {/* Quick access grid — spans 2 cols on right */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              // Quick Access
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_LINKS.map((link) => (
              <QuickLink key={link.subpath} href={getAdminPath(link.subpath)} {...link} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-900">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>System operational</span>
        </div>
      </div>
    </div>
  );
}
