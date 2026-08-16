'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { Briefcase, GraduationCap, Calendar } from 'lucide-react';

interface ExperienceTimelineProps {
  experiences: any[];
}

export default function ImmersiveExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (!experiences || experiences.length === 0) return null;

  return (
    <section className="py-32 px-4 sm:px-12 md:px-24 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] relative overflow-hidden" ref={containerRef}>
      
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full blur-[140px] pointer-events-none opacity-40" 
        style={{ backgroundColor: 'var(--glow-color)' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
          }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter mb-6">
            Professional Trajectory.
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Chronological record of professional tenure and academic background.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Center Line Track (Desktop) / Left Line (Mobile) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[var(--border-strong)] md:-translate-x-1/2" />
          
          {/* Animated Progress Line */}
          {!prefersReducedMotion && (
            <motion.div 
              style={{ height: lineHeight }}
              className="absolute left-6 md:left-1/2 top-0 w-px bg-gradient-to-b from-transparent via-[var(--accent-color)] to-[var(--accent-color)] md:-translate-x-1/2 origin-top"
            />
          )}

          <div className="space-y-12 md:space-y-24">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={exp.id} className="relative flex flex-col md:flex-row md:items-center w-full group">
                  
                  {/* Timeline Node */}
                  <div className="absolute left-6 md:left-1/2 top-8 md:top-1/2 w-12 h-12 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] group-hover:border-[var(--accent-color)] group-hover:scale-110 group-hover:shadow-[0_0_24px_var(--accent-soft)] flex items-center justify-center -translate-x-1/2 md:-translate-y-1/2 z-20 transition-all duration-500 ease-out shadow-md">
                    {exp.type === 'WORK' ? (
                      <Briefcase className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-text)] transition-colors duration-300" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-text)] transition-colors duration-300" />
                    )}
                  </div>

                  {/* Content Panel (Left for Even, Right for Odd on Desktop) */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:pr-24 md:text-right' : 'md:pl-24 md:ml-auto'}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : (isEven ? -50 : 50), y: prefersReducedMotion ? 0 : 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
                      className="bg-[var(--bg-surface)] group-hover:bg-[var(--bg-card-hover)] backdrop-blur-md border border-[var(--border-subtle)] group-hover:border-[var(--border-hover)] p-8 rounded-3xl transition-all duration-500 ease-out relative overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:shadow-[var(--accent-color)]/[0.08] group-hover:-translate-y-1.5"
                    >
                      {/* Ambient Gradient Glow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)]/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Decorative Background Icon */}
                      <div className={`absolute -bottom-10 ${isEven ? '-left-10' : '-right-10'} text-[var(--text-primary)]/5 pointer-events-none transition-all duration-700 ease-out group-hover:scale-110 group-hover:text-[var(--accent-color)]/10`}>
                        {exp.type === 'WORK' ? <Briefcase className="w-48 h-48" /> : <GraduationCap className="w-48 h-48" />}
                      </div>

                      <div className="relative z-10">
                        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-6 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[var(--accent-text)] bg-[var(--accent-soft)] border border-[var(--accent-color)]/20 group-hover:border-[var(--accent-color)]/40 group-hover:shadow-[0_0_12px_var(--accent-soft)] px-4 py-1.5 rounded-full w-fit transition-all duration-300">
                            <Calendar className="w-4 h-4" />
                            {new Date(exp.startDate).getFullYear()} — {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-text)] transition-colors duration-300">
                          {exp.title}
                        </h3>
                        
                        <div className="text-lg sm:text-xl text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium mb-6 transition-colors duration-300">
                          {exp.institution}
                        </div>
                        
                        {exp.description && (
                          <p className="text-[var(--text-tertiary)] leading-relaxed group-hover:text-[var(--text-secondary)] transition-colors duration-300 line-clamp-4 hover:line-clamp-none">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
