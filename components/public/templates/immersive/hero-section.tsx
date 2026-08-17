'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface HeroSectionProps {
  profile: any;
  ctaOverride?: { ctaLabel?: string; ctaUrl?: string };
}

export default function ImmersiveHeroSection({ profile, ctaOverride }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!profile) return null;

  const baseText = profile.tagline || profile.name || 'PORTFOLIO';
  const marqueeText = Array(8).fill(baseText).join(' • ') + ' • ';

  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center px-4 sm:px-12 md:px-24 overflow-hidden pt-24 pb-12 group/section">

      {/* Background Marquee with Outlined & Accent Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none immersive-marquee-container">
        <motion.div
          className="whitespace-nowrap text-[15vw] font-black leading-none uppercase tracking-tighter immersive-marquee-text group-hover/section:[animation-play-state:paused]"
          animate={prefersReducedMotion ? {} : { x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 65, ease: 'linear' }}
        >
          {marqueeText}
        </motion.div>
      </div>

      <div
        className="w-full max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
      >

        {/* Text Content (Left aligned, span 7) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-start text-left">

          <div className="mb-4 inline-block animate-immersive-fade-in" style={{ animationDelay: '0.05s' }}>
            <span className="text-[var(--accent-text)] font-semibold tracking-widest uppercase text-sm md:text-base border border-[var(--border-strong)] px-4 py-1.5 rounded-full bg-[var(--accent-soft)] backdrop-blur-md shadow-sm">
              Hello, I&apos;m
            </span>
          </div>

          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-[var(--text-primary)] mb-6 leading-[0.9] animate-immersive-fade-in"
            style={{ animationDelay: '0s' }}
          >
            {profile.name}
          </h1>

          <p
            className="text-xl sm:text-2xl md:text-3xl text-[var(--text-secondary)] font-medium max-w-2xl mb-8 leading-tight animate-immersive-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            {profile.tagline}
          </p>

          {profile.bio && (
            <div className="max-w-xl mb-12 animate-immersive-fade-in" style={{ animationDelay: '0.15s' }}>
              <p className="text-base sm:text-lg text-[var(--text-tertiary)] leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 animate-immersive-fade-in" style={{ animationDelay: '0.2s' }}>
            {(profile.resumeUrl || ctaOverride?.ctaUrl) && (
              <a
                href={ctaOverride?.ctaUrl || profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn px-8 py-4 bg-[var(--accent-btn-bg)] text-[var(--accent-btn-fg)] font-bold rounded-full hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-active)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
              >
                {ctaOverride?.ctaLabel || 'View Resume'}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            )}

            <div className="flex gap-4">
              {profile.socialLinks && Array.isArray(profile.socialLinks) && profile.socialLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-btn-fg)] bg-[var(--bg-surface)] hover:bg-[var(--accent-btn-bg)] rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-300 text-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-active)]"
                  aria-label={link.platform}
                >
                  <i className={link.iconClass || 'fa-solid fa-link'} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Image Content (Asymmetrical Right, span 5) */}
        {profile.photoUrl && (
          <div
            className="col-span-1 lg:col-span-5 relative mt-12 lg:mt-0 lg:ml-12 animate-immersive-fade-in group/hero-img"
            style={{ animationDelay: '0s' }}
          >
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-[var(--border-strong)] shadow-2xl group/img bg-[var(--bg-surface)]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent z-10" />
              <Image
                src={profile.photoUrl}
                alt={profile.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                priority
              />
            </div>

            {/* Decorative element */}
            <div className="immersive-decorative-corner absolute -bottom-6 -left-6 w-32 h-32 border-l border-b border-[var(--border-strong)] rounded-bl-3xl hidden lg:block pointer-events-none" />
          </div>
        )}

      </div>
    </section>
  );
}
