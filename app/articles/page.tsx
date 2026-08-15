import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, Clock, FileText, Sparkles } from 'lucide-react';
import { getPublishedArticles } from '@/app/actions/article';
import { getPortfolioData } from '@/lib/data';
import ThemeToggle from '@/components/public/layout/theme-toggle';

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
  if (!contentMd) return 1;
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
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] pb-32">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg-elevated)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] rounded-md py-1 px-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest hidden sm:inline-block">
              Writing & Notes
            </span>
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
            <span>Technical Blog & Notes</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
            Articles & Insights
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            A collection of engineering notes, architectural patterns, and thoughts on building modern software.
          </p>
        </div>
      </section>

      {/* Articles Grid / List */}
      <section className="px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {articles.length === 0 ? (
            <div className="text-center py-24 border border-[var(--border-subtle)] border-dashed rounded-3xl bg-[var(--bg-card)]">
              <FileText className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No articles published yet</h2>
              <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">
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
                    className="group flex flex-col rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Cover Image */}
                    <div className="relative w-full aspect-[16/9] bg-[var(--bg-surface)] overflow-hidden">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                          <FileText className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/70 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Meta: Date & Read Time */}
                        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-tertiary)]">
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
                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors line-clamp-2">
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        {article.excerpt && (
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Read More Link */}
                      <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-text)]">
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
