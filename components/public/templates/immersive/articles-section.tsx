'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, Clock, FileCode, Sparkles } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface ImmersiveArticlesSectionProps {
  articles: any[];
}

function calculateReadingTime(contentMd: string): number {
  if (!contentMd) return 1;
  const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function ImmersiveArticlesSection({ articles }: ImmersiveArticlesSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('articles');
  const locale = useLocale();

  if (!articles || articles.length === 0) return null;

  const formatDate = (date: Date | string | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="py-32 px-4 sm:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30 blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--glow-color)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>{t('immersiveBadge')}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter"
            >
              {t('immersiveTitle')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-[var(--text-secondary)] text-base sm:text-lg max-w-xl leading-relaxed"
            >
              {t('immersiveSubtitle')}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link
              href="/articles"
              className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:shadow-md transition-all"
            >
              <span>{t('accessKnowledgeBase')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => {
            const readTime = calculateReadingTime(article.contentMd);

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: prefersReducedMotion ? 0 : idx * 0.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={`/articles/${article.slug}`}
                  className="group relative flex flex-col h-full rounded-[2rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative w-full aspect-[16/10] bg-[var(--bg-surface)] overflow-hidden">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                        <FileCode className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/70 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
                  </div>

                  {/* Body Content */}
                  <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                    <div className="space-y-3">
                      {/* Meta */}
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

                      {/* Title */}
                      <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-sm text-[var(--text-secondary)] font-normal leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Bottom Link with animated circle */}
                    <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                      <span className="tracking-wider uppercase">{t('openDispatch')}</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] group-hover:border-[var(--border-strong)] flex items-center justify-center transition-colors shadow-sm">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
