'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface TestimonialItem {
  id: string;
  name: string;
  role?: string | null;
  quote: string;
  photoUrl?: string | null;
}

interface MinimalTestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

function MinimalTestimonialCard({
  testimonial,
  index,
}: {
  testimonial: TestimonialItem;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('testimonials');
  const isLong = testimonial.quote.length > 280;

  // Generate initials for avatar fallback
  const initials = testimonial.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between h-full p-7 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 shadow-sm hover:shadow-lg"
    >
      {/* Top quote icon */}
      <div>
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-text)] group-hover:border-[var(--border-strong)] transition-colors mb-6 shadow-sm">
          <Quote className="w-4 h-4" />
        </div>

        {/* Quote content */}
        <div className="relative mb-6">
          <p className="text-[var(--text-primary)]/90 text-[15px] sm:text-base leading-relaxed font-normal">
            &ldquo;{isLong && !isExpanded ? `${testimonial.quote.slice(0, 280)}...` : testimonial.quote}&rdquo;
          </p>

          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] mt-3 hover:text-[var(--text-secondary)] transition-colors pt-1"
            >
              {isExpanded ? (
                <>
                  <span>{t('collapsePayload')}</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>{t('expandPayload')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Author details footer */}
      <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center gap-4 mt-auto">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-center shadow-sm">
          {testimonial.photoUrl ? (
            <Image
              src={testimonial.photoUrl}
              alt={testimonial.name}
              width={48}
              height={48}
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <span className="text-xs font-bold text-[var(--text-secondary)] font-mono tracking-wider">
              {initials || <User className="w-5 h-5 text-[var(--text-tertiary)]" />}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base truncate">
            {testimonial.name}
          </h4>
          {testimonial.role && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal truncate mt-0.5">
              {testimonial.role}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MinimalTestimonialsSection({
  testimonials,
}: MinimalTestimonialsSectionProps) {
  const t = useTranslations('testimonials');

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-8 border-t border-[var(--border-subtle)] relative bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
            {t('minimalHeader')}
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
                {t('minimalTitle')}
              </h2>
              <p className="text-[var(--text-secondary)] mt-3 text-base sm:text-lg max-w-xl leading-relaxed">
                {t('minimalSubtitle')}
              </p>
            </div>
            <div className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-4 py-2 rounded-lg border border-[var(--border-subtle)] self-start md:self-auto shadow-sm">
              {testimonials.length} {testimonials.length === 1 ? t('record') : t('records')}
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div
          className={`grid gap-6 ${
            testimonials.length === 1
              ? 'grid-cols-1 max-w-2xl mx-auto'
              : testimonials.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {testimonials.map((testimonial, index) => (
            <MinimalTestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
