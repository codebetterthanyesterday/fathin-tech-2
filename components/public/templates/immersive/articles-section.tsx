'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, FileCode, Sparkles } from 'lucide-react';

interface ImmersiveArticlesSectionProps {
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

export default function ImmersiveArticlesSection({ articles }: ImmersiveArticlesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-32 px-4 sm:px-8 border-t border-white/5 bg-[#030303] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--color-accent)' }}
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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span>Engineering Logs & Thoughts</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter"
            >
              Technical{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-white">
                Dispatches
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-zinc-400 text-base sm:text-lg max-w-xl"
            >
              Deep dives on architecture, modern web development, and lessons learned in production.
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
              className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-semibold text-white hover:border-[var(--color-accent)] hover:shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.15)] transition-all"
            >
              <span>Explore All Writings</span>
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
                  className="group relative flex flex-col h-full rounded-[2rem] bg-zinc-950/80 border border-zinc-800/80 hover:border-[var(--color-accent)]/80 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(var(--color-accent-rgb),0.1)] hover:-translate-y-1.5"
                >
                  {/* Card Glow on Hover */}
                  <div
                    className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 blur-[60px] pointer-events-none transition-opacity duration-700"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />

                  {/* Thumbnail Banner */}
                  <div className="relative w-full aspect-[16/10] bg-zinc-900 overflow-hidden">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-700 group-hover:text-zinc-400 transition-colors">
                        <FileCode className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Body Content */}
                  <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                    <div className="space-y-3">
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                        {article.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(article.publishedAt)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {readTime} min
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-sm text-zinc-400 font-light leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Bottom Link with animated line */}
                    <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-300 group-hover:text-white">
                      <span className="tracking-wider uppercase">Open Dispatch</span>
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-[var(--color-accent)] flex items-center justify-center transition-colors">
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
