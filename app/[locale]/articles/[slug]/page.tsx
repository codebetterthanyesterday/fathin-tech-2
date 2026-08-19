import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Metadata } from 'next';
import { ArrowLeft, Calendar, Clock, Sparkles } from 'lucide-react';
import { getPublishedArticleBySlug } from '@/app/actions/article';
import { getPortfolioData } from '@/lib/data';
import { renderMarkdownServer } from '@/lib/markdown/server';
import JsonLd from '@/components/public/json-ld';
import ThemeToggle from '@/components/public/layout/theme-toggle';
import SearchTrigger from '@/components/public/search/search-trigger';
import LanguageSwitcher from '@/components/public/layout/language-switcher';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface ArticleDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getPublishedArticleBySlug(slug, locale);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const { profile } = await getPortfolioData(locale);
  const authorName = profile?.name || 'Author';
  const title = `${article.title} — ${authorName}`;
  const description = article.excerpt || `Read ${article.title} on ${authorName}'s technical portfolio.`;
  const url = `/${locale}/articles/${article.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      authors: [authorName],
      ...(article.coverImage
        ? {
            images: [
              {
                url: article.coverImage,
                width: 1200,
                height: 630,
                alt: article.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
    alternates: {
      canonical: url,
      languages: {
        id: `/id/articles/${article.slug}`,
        en: `/en/articles/${article.slug}`,
        'x-default': `/id/articles/${article.slug}`,
      },
    },
  };
}

function calculateReadingTime(contentMd: string): number {
  if (!contentMd) return 1;
  const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('articles');
  const article = await getPublishedArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  const { profile } = await getPortfolioData(locale);
  const htmlContent = await renderMarkdownServer(article.contentMd);
  const readTime = calculateReadingTime(article.contentMd);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.title,
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    dateModified: new Date(article.updatedAt).toISOString(),
    ...(article.coverImage ? { image: article.coverImage } : {}),
    author: {
      '@type': 'Person',
      name: profile?.name || 'Author',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] pb-32">
      <JsonLd data={articleSchema} />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg-elevated)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/articles"
            className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] rounded-md py-1 px-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('backToArticles')}
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-tertiary)] truncate max-w-[160px] sm:max-w-xs hidden sm:inline-block">
              {article.title}
            </span>
            <SearchTrigger variant="compact" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Article Header & Content Container */}
      <article className="relative pt-32 px-4 sm:px-8">
        {/* Glow ambient background */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[140px] pointer-events-none -translate-y-1/3 opacity-30" 
          style={{ backgroundColor: 'var(--glow-color)' }}
        />

        <div className="max-w-6xl mx-auto relative z-10 lg:grid lg:grid-cols-[200px_minmax(0,65ch)] lg:gap-16 lg:justify-center lg:items-start">
          
          {/* Sidebar / Metadata Rail */}
          <aside className="hidden lg:block sticky top-32 space-y-8">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToArticles')}
            </Link>

            <div className="space-y-6">
              {/* Author */}
              <div className="flex items-center gap-3">
                {profile?.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    width={40}
                    height={40}
                    className="rounded-full ring-1 ring-[var(--border-strong)] object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-sm">
                    {profile?.name?.[0] || 'A'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">{profile?.name || 'Author'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{profile?.tagline || 'Software Engineer'}</p>
                </div>
              </div>

              {/* Meta Stats */}
              <div className="space-y-3 text-xs font-mono text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  <span className="text-[var(--text-primary)]">Technical Note</span>
                </div>
                {article.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(article.publishedAt)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime} {t('minRead')}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Column */}
          <div className="min-w-0">
            {/* Mobile Metadata Badges (Hidden on Desktop) */}
            <div className="flex lg:hidden flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-secondary)] mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                Technical Note
              </span>
              {article.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(article.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readTime} {t('minRead')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-6 leading-[1.15]">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed font-light mb-10 border-l-2 border-[var(--border-strong)] pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Cover Image */}
            {article.coverImage && (
              <div className="w-full aspect-[16/9] sm:aspect-[2/1] relative rounded-3xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl mb-12">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}

            {/* Rendered HTML Markdown Body */}
            <div
              className="prose dark:prose-invert prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--accent-text)] prose-a:no-underline hover:prose-a:underline prose-pre:p-0 prose-pre:border prose-pre:border-[var(--border-subtle)] prose-pre:rounded-2xl prose-img:rounded-2xl prose-img:border prose-img:border-[var(--border-subtle)] leading-relaxed text-[var(--text-primary)]"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Mobile Article Footer & Author Info (Hidden on Desktop) */}
            <div className="lg:hidden mt-20 pt-10 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {profile?.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    width={52}
                    height={52}
                    className="rounded-full ring-2 ring-[var(--border-strong)] object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-lg">
                    {profile?.name?.[0] || 'A'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-base text-[var(--text-primary)]">{profile?.name || 'Author'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{profile?.tagline || 'Software Engineer'}</p>
                </div>
              </div>

              <Link
                href="/articles"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors shadow-sm self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('backToArticles')}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
