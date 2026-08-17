'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { useRef, useState } from 'react';
import ProjectsAtmosphereWrapper from './projects-atmosphere-wrapper';
import { useTranslations } from 'next-intl';

interface FeaturedProjectsProps {
  projects: any[];
}

export default function ImmersiveFeaturedProjects({ projects }: FeaturedProjectsProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('projects');
  
  // Section-wide scroll progress used to drive the R3F background parallax
  const { scrollYProgress: sectionScrollProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [progressVal, setProgressVal] = useState(0);
  
  useRef(() => {
    return sectionScrollProgress.on("change", (v) => setProgressVal(v));
  }).current();

  if (!projects || projects.length === 0) return null;

  return (
    <section ref={containerRef} className="relative bg-[var(--bg-primary)] text-[var(--text-primary)] border-t border-[var(--border-subtle)] overflow-hidden">
      
      {/* 3D Atmosphere Layer */}
      <ProjectsAtmosphereWrapper scrollProgress={progressVal} />

      {/* Title Section (Sticky on desktop) */}
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-1/3 lg:float-left flex flex-col justify-center px-4 sm:px-12 md:px-24 py-24 lg:py-0 z-10 bg-[var(--bg-primary)]/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none border-r border-[var(--border-subtle)] lg:border-none">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 text-[var(--text-primary)]">
            {t('immersiveTitle')}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-sm leading-relaxed">
            {t('immersiveSubtitle')}
          </p>
        </motion.div>
      </div>

      {/* Projects List (Scrolls on desktop) */}
      <div className="lg:w-2/3 lg:float-right px-4 sm:px-12 md:px-24 lg:pl-0 lg:pr-24 pb-32 lg:pt-32 space-y-32 relative z-10" style={{ perspective: '1200px' }}>
        {projects.map((project, index) => {
          const mainImage = project.images?.[0]?.url;
          
          return (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index} 
              mainImage={mainImage} 
              prefersReducedMotion={prefersReducedMotion} 
            />
          );
        })}
      </div>
      
      {/* Clearfix for floats */}
      <div className="clear-both" />
    </section>
  );
}

function ProjectCard({ project, index, mainImage, prefersReducedMotion }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('projects');
  
  // Independent scroll progress for this specific card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // Cascading 3D Depth
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-200, 0, 100]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -5]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const animationStyle = prefersReducedMotion ? {} : { 
    y, 
    z, 
    rotateX, 
    opacity,
    transformStyle: 'preserve-3d' as const
  };

  return (
    <motion.div 
      ref={cardRef}
      style={animationStyle}
      className="flex flex-col group bg-[var(--bg-primary)]/40 backdrop-blur-sm p-4 sm:p-8 rounded-3xl border border-[var(--border-subtle)] shadow-2xl transition-colors hover:bg-[var(--bg-primary)]/80 hover:border-[var(--accent-active)]"
    >
      {/* Image with Parallax */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden mb-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
        {mainImage ? (
          <Image
            src={mainImage}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] font-medium">
            {t('noImage')}
          </div>
        )}
        
        {/* Project Number */}
        <div className="absolute top-6 left-6 z-20 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl font-black text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
          >
            {(index + 1).toString().padStart(2, '0')}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-end justify-between px-2">
        <div className="flex-grow max-w-xl">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors">
            {project.title}
          </h3>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-6 leading-relaxed">
            {project.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack?.map((tech: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-full text-xs sm:text-sm font-medium border border-[var(--border-subtle)] shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 flex items-center gap-4 mt-4 sm:mt-0 pb-2">
          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--bg-surface)] hover:bg-[var(--text-primary)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-subtle)] transition-all shadow-sm active:scale-95"
              aria-label={t('liveDemo')}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          
          <Link 
            href={`/projects/${project.slug}`} 
            className="px-6 py-3 rounded-full bg-[var(--accent-btn-bg)] text-[var(--accent-btn-fg)] font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md"
          >
            {t('details')}
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
