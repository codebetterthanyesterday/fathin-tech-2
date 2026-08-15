'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface HeroSectionProps {
  profile: any;
  ctaOverride?: { ctaLabel?: string; ctaUrl?: string };
}

export default function HeroSection({ profile, ctaOverride }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  // Animations configuration
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  if (!profile) return null;

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-8 overflow-hidden bg-[var(--bg-primary)]">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" 
          style={{ backgroundColor: 'var(--glow-color)' }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px]" 
          style={{ backgroundColor: 'var(--glow-color)' }}
        />
      </div>

      <motion.div 
        className="w-full max-w-4xl mx-auto flex flex-col items-center text-center z-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Avatar */}
        {profile.photoUrl && (
          <motion.div variants={item} className="mb-8">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-[var(--border-strong)] ring-4 ring-[var(--bg-primary)] shadow-2xl bg-[var(--bg-surface)]">
              <Image 
                src={profile.photoUrl} 
                alt={profile.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        )}

        {/* Name & Tagline */}
        <motion.h1 variants={item} className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          {profile.name}
        </motion.h1>
        
        <motion.p variants={item} className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-2xl mb-8 leading-relaxed">
          {profile.tagline}
        </motion.p>

        {/* Bio */}
        {profile.bio && (
          <motion.div variants={item} className="max-w-2xl mb-10">
            <p className="text-sm sm:text-base text-[var(--text-tertiary)] leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </motion.div>
        )}

        {/* Social Links & CTA */}
        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-4">
          {profile.socialLinks && Array.isArray(profile.socialLinks) && profile.socialLinks.map((link: any, index: number) => {
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-btn-fg)] bg-[var(--bg-surface)] hover:bg-[var(--accent-btn-bg)] rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all hover:scale-105 active:scale-95 text-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-active)]"
                aria-label={link.platform}
              >
                <i className={link.iconClass || 'fa-solid fa-link'} />
              </a>
            );
          })}

          {(profile.resumeUrl || ctaOverride?.ctaUrl) && (
            <a
              href={ctaOverride?.ctaUrl || profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 ml-2 bg-[var(--accent-btn-bg)] text-[var(--accent-btn-fg)] font-semibold rounded-full hover:brightness-110 transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95"
            >
              {ctaOverride?.ctaLabel || 'Resume'}
            </a>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-[var(--text-tertiary)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
