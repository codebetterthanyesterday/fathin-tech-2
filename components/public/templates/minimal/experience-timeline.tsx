'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface ExperienceTimelineProps {
  experiences: any[];
}

export default function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const prefersReducedMotion = useReducedMotion();

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
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(date));
  };

  return (
    <section className="py-24 px-4 sm:px-8 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <motion.div variants={item} className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Experience
            </h2>
          </motion.div>

          <div className="relative pl-8 md:pl-0">
            {/* Main Timeline Line (Desktop centered, Mobile left) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2" />
            <div className="md:hidden absolute left-0 top-0 bottom-0 w-px bg-zinc-800" />

            <div className="space-y-16">
              {experiences.map((exp, index) => {
                const isEven = index % 2 === 0;
                const isCurrent = exp.endDate === null;

                return (
                  <motion.div 
                    key={exp.id} 
                    variants={item}
                    className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Center Dot */}
                    <div className={`absolute left-0 md:left-1/2 -translate-x-1/2 mt-1.5 md:mt-2.5 z-10 flex items-center justify-center`}>
                      {isCurrent ? (
                        <div className="relative flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#050505]"></span>
                        </div>
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full bg-zinc-800 border-2 border-[#050505] group-hover:bg-zinc-600 transition-colors" />
                      )}
                    </div>

                    {/* Content Box */}
                    <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12 pl-8 md:pl-0'}`}>
                      <div className="group relative">
                        {/* Hover glow effect (invisible by default) */}
                        <div className="absolute -inset-4 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        
                        <div className="relative">
                          <span className="inline-block px-2.5 py-1 mb-3 text-[10px] font-bold tracking-wider text-zinc-500 uppercase bg-zinc-900 rounded-full border border-white/5">
                            {exp.type}
                          </span>
                          
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
                            {exp.title}
                          </h3>
                          <div className="text-zinc-400 font-medium mb-2">{exp.institution}</div>
                          
                          <div className="text-xs font-mono text-zinc-500 mb-4 flex items-center gap-2">
                            <span>{formatDate(exp.startDate)}</span>
                            <span className="text-zinc-700">—</span>
                            {isCurrent ? (
                              <span className="text-white">Present</span>
                            ) : (
                              <span>{formatDate(exp.endDate)}</span>
                            )}
                          </div>

                          {exp.description && (
                            <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">
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
