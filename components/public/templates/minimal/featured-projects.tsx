'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FeaturedProjectsProps {
  projects: any[];
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('projects');

  if (!projects || projects.length === 0) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } }
  };

  return (
    <section className="py-24 px-4 sm:px-8 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <motion.div variants={item} className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-4">
              {t('minimalTitle')}
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl text-lg leading-relaxed">
              {t('minimalSubtitle')}
            </p>
          </motion.div>

          <div className="space-y-24">
            {projects.map((project, index) => {
              const isEven = index % 2 === 0;
              const mainImage = project.images?.[0]?.url;

              return (
                <motion.div 
                  key={project.id} 
                  variants={item}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center group`}
                >
                  {/* Image Container */}
                  <div className="w-full lg:w-3/5 relative aspect-video rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] font-medium">
                        {t('noImage')}
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="w-full lg:w-2/5 flex flex-col justify-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-[var(--accent-text)] transition-colors">
                      {project.title}
                    </h3>
                    
                    <div className="p-6 rounded-xl bg-[var(--bg-card)] backdrop-blur-sm border border-[var(--border-subtle)] shadow-md mb-6 relative z-20 lg:-ml-12 lg:group-even:ml-0 lg:group-even:-mr-12">
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                        {project.summary}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.techStack?.map((tech: string, i: number) => (
                        <span key={i} className="text-xs font-mono text-[var(--text-tertiary)]">
                          {tech}{i < project.techStack.length - 1 ? <span className="text-[var(--border-strong)] mx-2">/</span> : ''}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                      <Link 
                        href={`/projects/${project.slug}`} 
                        className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors border-b border-transparent hover:border-[var(--text-secondary)] pb-0.5"
                      >
                        {t('readCaseStudy')}
                      </Link>
                      
                      <div className="flex items-center gap-4">
                        {project.githubUrl && (
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" 
                            aria-label="GitHub Repository"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                          </a>
                        )}
                        {project.demoUrl && (
                          <a 
                            href={project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" 
                            aria-label="Live Demo"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
