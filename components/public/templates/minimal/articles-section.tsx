'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, FileText } from 'lucide-react';

interface MinimalArticlesSectionProps {
  articles: any[];
}

function calculateReadingTime(contentMd: string): number {
  if (!contentMd) return 1;
  const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date: Date | string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MinimalArticlesSection({ articles }: MinimalArticlesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!articles || articles.length === 0) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section className="py-24 px-4 sm:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={container}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                Latest Articles
              </h2>
              <p className="text-[var(--text-secondary)] mt-2 text-base sm:text-lg leading-relaxed">
                Technical writings, system design thoughts, and engineering reflections.
              </p>
            </div>

            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors shrink-0 group border-b border-transparent hover:border-[var(--text-secondary)] pb-0.5"
            >
              <span>View all articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const readTime = calculateReadingTime(article.contentMd);

              return (
                <motion.div key={article.id} variants={item}>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group flex flex-col h-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[16/10] bg-[var(--bg-surface)] overflow-hidden">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-tertiary)]">
                          {article.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.publishedAt)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {readTime} min read
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        {article.excerpt && (
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-text)]">
                        <span>Read article</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
