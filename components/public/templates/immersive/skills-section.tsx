'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface SkillsSectionProps {
  skills: any[];
}

export default function ImmersiveSkillsSection({ skills }: SkillsSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!skills || skills.length === 0) return null;

  // Group skills by category
  const groupedSkills = skills.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(groupedSkills);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.8, y: prefersReducedMotion ? 0 : 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  return (
    <section className="py-32 px-4 sm:px-12 md:px-24 relative overflow-hidden bg-[#050505]">
      
      {/* Abstract background element */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
          className="flex flex-col md:flex-row gap-16"
        >
          {/* Title Area */}
          <div className="md:w-1/3 flex flex-col justify-start">
            <motion.h2 
              variants={item} 
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight"
            >
              My<br/>Arsenal.
            </motion.h2>
            <motion.p variants={item} className="text-zinc-400 text-lg">
              The tools and technologies I use to bring ideas to life.
            </motion.p>
          </div>

          {/* Skills Area */}
          <div className="md:w-2/3 flex flex-col gap-12">
            {categories.map((category) => (
              <motion.div key={category} variants={item} className="relative">
                <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-6 flex items-center gap-4">
                  <span>{category.replace('_', ' ')}</span>
                  <div className="flex-grow h-[1px] bg-accent/20" />
                </h3>
                
                <div className="flex flex-wrap gap-4">
                  {groupedSkills[category].map((skill: any, idx: number) => (
                    <motion.div 
                      key={skill.id}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -5 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      className="px-6 py-3 bg-zinc-900/80 backdrop-blur-sm border border-white/10 hover:border-accent/50 rounded-2xl text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-default shadow-lg hover:shadow-accent/10"
                    >
                      {skill.name}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
