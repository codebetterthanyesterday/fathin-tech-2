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

  // Staggering text animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 50, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] as const } }
  };

  const marqueeText = Array(10).fill(profile.tagline || profile.name).join(" • ");

  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center px-4 sm:px-12 md:px-24 overflow-hidden pt-20 group/section">
      
      {/* Background Marquee */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0 select-none">
        <motion.div
          className="whitespace-nowrap text-[15vw] font-black leading-none uppercase tracking-tighter group-hover/section:[animation-play-state:paused]"
          animate={prefersReducedMotion ? {} : { x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        >
          {marqueeText}
        </motion.div>
      </div>

      <motion.div 
        className="w-full max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        
        {/* Text Content (Left aligned, span 7) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-start text-left">
          
          <motion.div variants={item} className="mb-4 inline-block">
            <span className="text-accent font-semibold tracking-widest uppercase text-sm md:text-base border border-accent/20 px-4 py-1.5 rounded-full">
              Hello, I&apos;m
            </span>
          </motion.div>

          <motion.h1 
            variants={item} 
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-white mb-6 leading-[0.9]"
          >
            {profile.name}
          </motion.h1>
          
          <motion.p 
            variants={item} 
            className="text-xl sm:text-2xl md:text-3xl text-zinc-300 font-medium max-w-2xl mb-8 leading-tight"
          >
            {profile.tagline}
          </motion.p>

          {profile.bio && (
            <motion.div variants={item} className="max-w-xl mb-12">
              <p className="text-base sm:text-lg text-zinc-500 leading-relaxed">
                {profile.bio}
              </p>
            </motion.div>
          )}

          <motion.div variants={item} className="flex flex-wrap items-center gap-6">
            {(profile.resumeUrl || ctaOverride?.ctaUrl) && (
              <a
                href={ctaOverride?.ctaUrl || profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn px-8 py-4 bg-accent text-zinc-950 font-bold rounded-full hover:scale-105 transition-all flex items-center gap-3 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
                  className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 hover:bg-accent hover:text-zinc-950 rounded-full transition-all text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={link.platform}
                >
                  <i className={link.iconClass || 'fa-solid fa-link'} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Image Content (Asymmetrical Right, span 5) */}
        {profile.photoUrl && (
          <motion.div 
            variants={item} 
            className="col-span-1 lg:col-span-5 relative mt-12 lg:mt-0 lg:ml-12"
          >
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl group/img">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              <Image 
                src={profile.photoUrl} 
                alt={profile.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                priority
              />
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-l border-b border-accent/30 rounded-bl-3xl hidden lg:block" />
          </motion.div>
        )}

      </motion.div>
    </section>
  );
}
