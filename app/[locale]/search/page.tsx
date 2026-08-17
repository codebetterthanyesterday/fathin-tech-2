import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClientView from './search-client-view';
import { setRequestLocale } from 'next-intl/server';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Search Portfolio & Articles',
  description: 'Search through engineering projects, case studies, and technical writings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-color)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchClientView />
    </Suspense>
  );
}
