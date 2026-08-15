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
    <section className="py-32 px-4 sm:px-12 md:px-24 bg-[#050505] relative overflow-hidden" ref={containerRef}>
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

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
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter mb-6">
            The Journey.
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            A timeline of my professional experience and academic background, shaping the way I build today.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Center Line Track (Desktop) / Left Line (Mobile) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />
          
          {/* Animated Progress Line */}
          {!prefersReducedMotion && (
            <motion.div 
              style={{ height: lineHeight }}
              className="absolute left-6 md:left-1/2 top-0 w-px bg-gradient-to-b from-accent/0 via-accent to-accent md:-translate-x-1/2 origin-top"
            />
          )}

          <div className="space-y-12 md:space-y-24">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={exp.id} className="relative flex flex-col md:flex-row md:items-center w-full group">
                  
                  {/* Timeline Node */}
                  <div className="absolute left-6 md:left-1/2 top-8 md:top-1/2 w-12 h-12 rounded-full bg-[#050505] border-2 border-zinc-800 group-hover:border-accent flex items-center justify-center -translate-x-1/2 md:-translate-y-1/2 z-20 transition-colors duration-500 shadow-xl">
                    {exp.type === 'WORK' ? (
                      <Briefcase className="w-5 h-5 text-zinc-400 group-hover:text-accent transition-colors" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-zinc-400 group-hover:text-accent transition-colors" />
                    )}
                  </div>

                  {/* Content Panel (Left for Even, Right for Odd on Desktop) */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:pr-24 md:text-right' : 'md:pl-24 md:ml-auto'}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : (isEven ? -50 : 50), y: prefersReducedMotion ? 0 : 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
                      className="bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 p-8 rounded-3xl transition-colors duration-500 relative overflow-hidden"
                    >
                      {/* Decorative Background Icon */}
                      <div className={`absolute -bottom-10 ${isEven ? '-left-10' : '-right-10'} text-white/5 pointer-events-none transition-transform duration-700 group-hover:scale-110`}>
                        {exp.type === 'WORK' ? <Briefcase className="w-48 h-48" /> : <GraduationCap className="w-48 h-48" />}
                      </div>

                      <div className="relative z-10">
                        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-6 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          <div className="flex items-center gap-2 text-sm font-mono text-accent bg-accent/10 px-4 py-1.5 rounded-full w-fit">
                            <Calendar className="w-4 h-4" />
                            {new Date(exp.startDate).getFullYear()} — {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                          </div>
                        </div>
                        
                        <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                          {exp.title}
                        </h3>
                        
                        <div className="text-xl text-zinc-400 font-medium mb-6">
                          {exp.institution}
                        </div>
                        
                        {exp.description && (
                          <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors line-clamp-4 hover:line-clamp-none">
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
