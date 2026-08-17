'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

interface ExperienceTimelineProps {
  experiences: any[];
}

export default function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('experience');
  const locale = useLocale();

  if (!experiences || experiences.length === 0) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <section className="py-24 px-4 sm:px-8 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] relative overflow-hidden">
      {/* Subtle background glow */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-30" 
        style={{ backgroundColor: 'var(--glow-color)' }}
      />
      
      <div className="max-w-3xl mx-auto relative z-10">
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
          </motion.div>

          <div className="relative pl-8 md:pl-0">
            {/* Main Timeline Line (Desktop centered, Mobile left) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border-strong)] -translate-x-1/2" />
            <div className="md:hidden absolute left-0 top-0 bottom-0 w-px bg-[var(--border-strong)]" />

            <div className="space-y-16">
              {experiences.map((exp, index) => {
                const isEven = index % 2 === 0;
                const isCurrent = exp.endDate === null;

                return (
                  <motion.div 
                    key={exp.id} 
                    variants={item}
                    className={`group relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Center Dot */}
                    <div className="absolute left-0 md:left-1/2 -translate-x-1/2 mt-1.5 md:mt-2.5 z-10 flex items-center justify-center">
                      {isCurrent ? (
                        <div className="relative flex h-3.5 w-3.5 group-hover:scale-125 transition-transform duration-500 ease-out">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-color)] opacity-60"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--accent-color)] border-2 border-[var(--bg-primary)] shadow-[0_0_8px_var(--accent-soft)]"></span>
                        </div>
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full bg-[var(--text-tertiary)] border-2 border-[var(--bg-primary)] group-hover:bg-[var(--accent-color)] group-hover:border-[var(--accent-color)] group-hover:scale-125 group-hover:shadow-[0_0_12px_var(--accent-soft)] transition-all duration-500 ease-out" />
                      )}
                    </div>

                    {/* Content Box */}
                    <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12 pl-8 md:pl-0'}`}>
                      <div className="relative p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover:border-[var(--border-hover)] group-hover:bg-[var(--bg-card-hover)] transition-all duration-500 ease-out shadow-sm group-hover:shadow-xl group-hover:shadow-[var(--accent-color)]/[0.04] group-hover:-translate-y-1 overflow-hidden">
                        {/* Subtle top-light gradient sheen */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10">
                          <span className="inline-block px-2.5 py-1 mb-3 text-[10px] font-bold tracking-wider text-[var(--text-tertiary)] group-hover:text-[var(--accent-text)] uppercase bg-[var(--bg-surface)] group-hover:bg-[var(--accent-soft)] rounded-full border border-[var(--border-subtle)] group-hover:border-[var(--accent-color)]/30 transition-colors duration-300">
                            {exp.type}
                          </span>
                          
                          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-text)] transition-colors duration-300">
                            {exp.title}
                          </h3>
                          <div className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium mb-2 transition-colors duration-300">
                            {exp.institution}
                          </div>
                          
                          <div className="text-xs font-mono text-[var(--text-tertiary)] mb-4 flex items-center gap-2">
                            <span>{formatDate(exp.startDate)}</span>
                            <span className="text-[var(--border-strong)]">—</span>
                            {isCurrent ? (
                              <span className="text-[var(--accent-text)] font-semibold">{t('present')}</span>
                            ) : (
                              <span>{formatDate(exp.endDate)}</span>
                            )}
                          </div>

                          {exp.description && (
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap transition-colors duration-300">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
