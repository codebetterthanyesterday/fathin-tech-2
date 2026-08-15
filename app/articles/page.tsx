import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, Clock, FileText, Sparkles } from 'lucide-react';
import { getPublishedArticles } from '@/app/actions/article';
import { getPortfolioData } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolioData();
  const name = profile?.name || 'Portfolio';

  return {
    title: `Articles & Technical Notes — ${name}`,
    description: `Explore technical insights, guides, and architectural notes written by ${name}.`,
    openGraph: {
      title: `Articles & Technical Notes — ${name}`,
      description: `Explore technical insights, guides, and architectural notes written by ${name}.`,
      type: 'website',
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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ArticlesPage() {
  const { articles } = await getPublishedArticles();

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-white pb-32">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Writing & Notes
          </span>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative pt-36 pb-16 px-4 sm:px-8">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Technical Blog & Notes</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Articles & Insights
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            A collection of engineering notes, architectural patterns, and thoughts on building modern software.
          </p>
        </div>
      </section>

      {/* Articles Grid / List */}
      <section className="px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {articles.length === 0 ? (
            <div className="text-center py-24 border border-zinc-800/80 border-dashed rounded-3xl bg-zinc-950/40">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No articles published yet</h2>
              <p className="text-zinc-500 text-sm max-w-md mx-auto">
                Articles are currently being drafted. Check back soon for new technical writings and updates.
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
                    className="group flex flex-col rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1"
                  >
                    {/* Cover Image */}
                    <div className="relative w-full aspect-[16/9] bg-zinc-900 overflow-hidden">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                          <FileText className="w-10 h-10 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Meta: Date & Read Time */}
                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
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
                        <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-2">
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        {article.excerpt && (
                          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Read More Link */}
                      <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-sm font-semibold text-white group-hover:text-zinc-300">
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
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
