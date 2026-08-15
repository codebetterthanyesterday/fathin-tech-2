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
    <section className="py-32 px-4 sm:px-8 border-t border-white/5 bg-[#030303] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04] blur-[140px] pointer-events-none"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 backdrop-blur-md shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
            <span>Testimonials & Endorsements</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter"
          >
            Voices of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
              Trust.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-zinc-400 text-base sm:text-lg max-w-xl"
          >
            Real feedback and reflections from founders, engineers, and product partners.
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
              className="relative rounded-3xl p-8 sm:p-12 md:p-14 bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              {/* Decorative Accent Glow behind card */}
              <div
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[90px] opacity-15 pointer-events-none"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />

              {/* Watermark Quote Icon */}
              <Quote className="absolute right-6 bottom-6 w-32 h-32 opacity-[0.03] text-white pointer-events-none select-none" />

              {/* Top Quote Icon Badge */}
              <div className="flex items-center justify-between gap-4 mb-8">
                <div
                  className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shadow-lg"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <Quote className="w-5 h-5" />
                </div>
              </div>

              {/* Main Quote */}
              <div className="mb-10 relative z-10">
                <p className="text-xl sm:text-2xl md:text-[26px] font-light text-zinc-100 leading-relaxed sm:leading-relaxed tracking-tight">
                  "{isLong && !isExpanded ? `${current.quote.slice(0, 360)}...` : current.quote}"
                </p>

                {isLong && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold mt-4 text-white hover:text-zinc-300 transition-colors pt-2"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show concise</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Read full quote</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-8 border-t border-white/10 relative z-10">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/15 bg-zinc-900 flex items-center justify-center shadow-xl">
                  {current.photoUrl ? (
                    <Image
                      src={current.photoUrl}
                      alt={current.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <span className="text-base font-bold text-zinc-200 font-mono tracking-wider">
                      {initials || <User className="w-6 h-6 text-zinc-500" />}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {current.name}
                  </h3>
                  {current.role && (
                    <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
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
                <span className="text-xs font-mono text-zinc-400 tracking-wider">
                  <strong className="text-white">
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
                          ? 'w-8 bg-white'
                          : 'w-2 bg-zinc-800 hover:bg-zinc-600'
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
                  className="w-11 h-11 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white flex items-center justify-center transition-all shadow-lg active:scale-95 hover:scale-105"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNext}
                  className="w-11 h-11 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition-all shadow-lg active:scale-95 hover:scale-105"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-12 pt-10 border-t border-white/5">
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
                      ? 'bg-white/10 border-white/30 ring-1 ring-white/20'
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:bg-zinc-900/40 hover:border-zinc-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-zinc-300">
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
                        isSelected ? 'text-white' : 'text-zinc-400'
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">{t.role || 'Testimonial'}</p>
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
