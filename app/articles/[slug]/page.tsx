import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Calendar, Clock, Sparkles } from 'lucide-react';
import { getPublishedArticleBySlug } from '@/app/actions/article';
import { getPortfolioData } from '@/lib/data';
import { renderMarkdownServer } from '@/lib/markdown/server';
import JsonLd from '@/components/public/json-ld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getPublishedArticleBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const { profile } = await getPortfolioData();
  const authorName = profile?.name || 'Author';
  const title = `${article.title} — ${authorName}`;
  const description = article.excerpt || `Read ${article.title} on ${authorName}'s technical portfolio.`;
  const url = `/articles/${article.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
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
    },
  };
}

function calculateReadingTime(contentMd: string): number {
  const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const article = await getPublishedArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const { profile } = await getPortfolioData();
  const htmlContent = await renderMarkdownServer(article.contentMd);
  const readTime = calculateReadingTime(article.contentMd);

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
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-white pb-32">
      <JsonLd data={articleSchema} />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/articles"
            className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Articles
          </Link>
          <span className="text-xs font-mono text-zinc-500 truncate max-w-[200px] sm:max-w-xs">
            {article.title}
          </span>
        </div>
      </nav>

      {/* Article Header & Content Container */}
      <article className="relative pt-32 px-4 sm:px-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-zinc-800/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/3" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
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
              {readTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-6 leading-[1.15]">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed font-light mb-10 border-l-2 border-zinc-700 pl-4">
              {article.excerpt}
            </p>
          )}

          {/* Cover Image */}
          {article.coverImage && (
            <div className="w-full aspect-[16/9] sm:aspect-[2/1] relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 ring-1 ring-white/5 shadow-2xl mb-12">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* Rendered HTML Content */}
          <div
            className="prose prose-invert prose-zinc max-w-none text-base sm:text-lg prose-p:leading-relaxed prose-p:text-zinc-300 prose-headings:text-white prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-3 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-a:text-white prose-a:underline hover:prose-a:text-zinc-300 prose-strong:text-white prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-400 prose-blockquote:italic prose-pre:bg-zinc-950/90 prose-pre:border prose-pre:border-zinc-800/80 prose-pre:rounded-2xl prose-pre:p-5 prose-code:font-mono prose-code:text-sm prose-code:bg-zinc-900/80 prose-code:text-zinc-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-img:rounded-2xl prose-img:border prose-img:border-zinc-800 prose-hr:border-white/10 prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Post Article Footer */}
          <div className="pt-16 mt-16 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profile?.photoUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 flex-shrink-0 relative">
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">Written by {profile?.name || 'Author'}</p>
                {profile?.tagline && (
                  <p className="text-xs text-zinc-400">{profile.tagline}</p>
                )}
              </div>
            </div>

            <Link
              href="/articles"
              className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-sm font-medium"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
