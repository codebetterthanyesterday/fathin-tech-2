import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPortfolioData } from '@/lib/data';
import { getPublicCertifications, getCertificationCategories } from '@/app/actions/certification';
import ThemeToggle from '@/components/public/layout/theme-toggle';
import SearchTrigger from '@/components/public/search/search-trigger';
import LanguageSwitcher from '@/components/public/layout/language-switcher';
import CertificationGrid from '@/components/public/certifications/certification-grid';
import CertificationFilters from '@/components/public/certifications/certification-filters';
import CertificationPagination from '@/components/public/certifications/pagination';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CertificationsPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CertificationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { profile } = await getPortfolioData(locale);
  const name = profile?.name || 'Portfolio';

  return {
    title: `Certifications & Awards — ${name}`,
    description: `Professional certifications, credentials, and technical achievements by ${name}.`,
    openGraph: {
      title: `Certifications & Awards — ${name}`,
      url: `/${locale}/certifications`,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `/${locale}/certifications`,
    },
  };
}

export default async function CertificationsPage({ params, searchParams }: CertificationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const rawCats = sp?.cat;
  const selectedCategoryIds: string[] = rawCats
    ? Array.isArray(rawCats)
      ? rawCats
      : [rawCats]
    : [];
  const page = sp?.page ? parseInt(String(sp.page), 10) : 1;

  const t = await getTranslations('certifications');

  const [{ certifications, totalPages, total }, { categories }] = await Promise.all([
    getPublicCertifications({ page, categoryIds: selectedCategoryIds }),
    getCertificationCategories(),
  ]);

  const allCategories = (categories || []).map((c) => ({
    id: c.id,
    name: c.name,
    dimension: c.dimension as 'SKILL' | 'ISSUER' | 'TYPE',
  }));

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]">
      {/* Floating controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <SearchTrigger variant="compact" className="shadow-lg backdrop-blur-xl bg-[var(--bg-elevated)]/85" />
        <LanguageSwitcher variant="minimal" />
        <ThemeToggle />
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-16 px-4 sm:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[var(--text-secondary)]" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                {t('pageTitle')}
              </h1>
              <p className="text-[var(--text-secondary)] mt-3 max-w-2xl">{t('pageSubtitle')}</p>
              {total > 0 && (
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  {total} credential{total !== 1 ? 's' : ''}
                  {selectedCategoryIds.length > 0 && ' (filtered)'}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Filters sidebar */}
            {allCategories.length > 0 && (
              <aside className="lg:w-56 flex-shrink-0">
                <div className="lg:sticky lg:top-8">
                  <CertificationFilters
                    allCategories={allCategories}
                    selectedCategoryIds={selectedCategoryIds}
                    locale={locale}
                  />
                </div>
              </aside>
            )}

            {/* Grid */}
            <div className="flex-1 min-w-0">
              <CertificationGrid certifications={certifications || []} locale={locale} />
              <CertificationPagination currentPage={page} totalPages={totalPages || 0} />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-[var(--border-subtle)] text-sm text-[var(--text-tertiary)] bg-[var(--bg-surface)]">
        <p>© {new Date().getFullYear()} Portfolio. All rights reserved.</p>
      </footer>
    </main>
  );
}
