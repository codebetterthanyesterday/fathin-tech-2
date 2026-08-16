'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  User,
  ChevronDown,
  ChevronUp,
  Quote,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';

interface TestimonialItem {
  id: string;
  name: string;
  role?: string | null;
  quote: string;
  photoUrl?: string | null;
}

interface ImmersiveTestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

export default function ImmersiveTestimonialsSection({
  testimonials,
}: ImmersiveTestimonialsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset expand state when active slide changes
  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  const total = testimonials?.length || 0;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!testimonials || total === 0) return null;

  const current = testimonials[currentIndex];
  const isLong = current.quote.length > 360;

  const initials = current.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? (prefersReducedMotion ? 0 : 50) : prefersReducedMotion ? 0 : -50,
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? (prefersReducedMotion ? 0 : -50) : prefersReducedMotion ? 0 : 50,
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <section className="py-32 px-4 sm:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-30 blur-[140px] pointer-events-none"
        style={{ backgroundColor: 'var(--glow-color)' }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Professional Endorsements</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter"
          >
            Verified Collaborations.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-[var(--text-secondary)] text-base sm:text-lg max-w-xl leading-relaxed"
          >
            Documented feedback from technical partners, engineers, and stakeholders.
          </motion.p>
        </div>

        {/* Spotlight Showcase Stage */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative rounded-3xl p-8 sm:p-12 md:p-14 bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-xl overflow-hidden"
            >
              {/* Watermark Quote Icon */}
              <Quote className="absolute right-6 bottom-6 w-32 h-32 opacity-[0.03] dark:opacity-[0.04] text-[var(--text-primary)] pointer-events-none select-none" />

              {/* Top Quote Icon Badge */}
              <div className="flex items-center justify-between gap-4 mb-8">
                <div
                  className="w-12 h-12 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center shadow-sm text-[var(--accent-text)]"
                >
                  <Quote className="w-5 h-5" />
                </div>
              </div>

              {/* Main Quote */}
              <div className="mb-10 relative z-10">
                <p className="text-xl sm:text-2xl md:text-[26px] font-light text-[var(--text-primary)] leading-relaxed sm:leading-relaxed tracking-tight">
                  &ldquo;{isLong && !isExpanded ? `${current.quote.slice(0, 360)}...` : current.quote}&rdquo;
                </p>

                {isLong && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold mt-4 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors pt-2"
                  >
                    {isExpanded ? (
                      <>
                        <span>Collapse payload</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Expand payload</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-8 border-t border-[var(--border-subtle)] relative z-10">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-center shadow-md">
                  {current.photoUrl ? (
                    <Image
                      src={current.photoUrl}
                      alt={current.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <span className="text-base font-bold text-[var(--text-secondary)] font-mono tracking-wider">
                      {initials || <User className="w-6 h-6 text-[var(--text-tertiary)]" />}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                    {current.name}
                  </h3>
                  {current.role && (
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                      {current.role}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls (If > 1 testimonial) */}
          {total > 1 && (
            <div className="flex items-center justify-between gap-4 mt-8 px-2">
              {/* Counter and pagination dots */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-[var(--text-tertiary)] tracking-wider">
                  <strong className="text-[var(--text-primary)]">
                    {String(currentIndex + 1).padStart(2, '0')}
                  </strong>{' '}
                  / {String(total).padStart(2, '0')}
                </span>

                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentIndex === idx
                          ? 'w-8 bg-[var(--text-primary)]'
                          : 'w-2 bg-[var(--border-strong)] hover:bg-[var(--text-secondary)]'
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Prev / Next Action Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-11 h-11 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] flex items-center justify-center transition-all shadow-sm active:scale-95 hover:scale-105"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNext}
                  className="w-11 h-11 rounded-full bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)] flex items-center justify-center transition-all shadow-md active:scale-95 hover:scale-105"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Selector Ribbon (If > 2 testimonials) */}
        {total > 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-12 pt-10 border-t border-[var(--border-subtle)]">
            {testimonials.map((t, idx) => {
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[var(--bg-card-hover)] border-[var(--border-strong)] ring-1 ring-[var(--border-strong)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--bg-surface)] flex-shrink-0 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    {t.photoUrl ? (
                      <Image
                        src={t.photoUrl}
                        alt={t.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      t.name[0]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">{t.role || 'Record'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
