import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, Clock, FileText, Sparkles } from 'lucide-react';
import { getPublishedArticles } from '@/app/actions/article';
import { getPortfolioData } from '@/lib/data';
import ThemeToggle from '@/components/public/layout/theme-toggle';
import SearchTrigger from '@/components/public/search/search-trigger';
import LanguageSwitcher from '@/components/public/layout/language-switcher';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface ArticlesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ArticlesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { profile } = await getPortfolioData(locale);
  const name = profile?.name || 'Portfolio';

  return {
    title: `Articles & Technical Notes — ${name}`,
    description: `Explore technical insights, guides, and architectural notes written by ${name}.`,
    openGraph: {
      title: `Articles & Technical Notes — ${name}`,
      description: `Explore technical insights, guides, and architectural notes written by ${name}.`,
      url: `/${locale}/articles`,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `/${locale}/articles`,
      languages: {
        id: '/id/articles',
        en: '/en/articles',
        'x-default': '/id/articles',
      },
    },
  };
}

function calculateReadingTime(contentMd: string): number {
  if (!contentMd) return 1;
  const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function ArticlesPage({ params }: ArticlesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('articles');
  const tNav = await getTranslations('nav');
  const { articles } = await getPublishedArticles(undefined, locale);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] pb-32">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg-elevated)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] rounded-md py-1 px-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('backToHome')}
          </Link>
          
          <div className="flex items-center gap-3">
            <SearchTrigger variant="compact" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative pt-36 pb-16 px-4 sm:px-8">
        {/* Glow ambient */}
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4 opacity-30" 
          style={{ backgroundColor: 'var(--glow-color)' }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>{t('pageBadge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
            {t('pageTitle')}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Articles Grid / List */}
      <section className="px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {articles.length === 0 ? (
            <div className="text-center py-24 border border-[var(--border-subtle)] border-dashed rounded-3xl bg-[var(--bg-card)]">
              <FileText className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{t('noArticlesTitle')}</h2>
              <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">
                {t('noArticlesDescription')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article) => {
                const readTime = calculateReadingTime(article.contentMd);

                return (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group flex flex-col rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[16/10] bg-[var(--bg-surface)] overflow-hidden">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                          <FileText className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Card Content */}
                    <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-tertiary)]">
                          {article.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(article.publishedAt)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {readTime} {t('minRead')}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h2>

                        {article.excerpt && (
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-text)]">
                        <span>{t('readArticle')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
