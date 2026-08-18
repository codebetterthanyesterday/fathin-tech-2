'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface SkillsSectionProps {
  skills: any[];
}

export default function ImmersiveSkillsSection({ skills }: SkillsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('skills');

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
    <section className="py-32 px-4 sm:px-12 md:px-24 relative overflow-hidden bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
      
      {/* Abstract background element */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[120px]" 
          style={{ backgroundColor: 'var(--glow-color)' }}
        />
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
              className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--text-primary)] mb-6 tracking-tighter leading-tight"
            >
              {t('immersiveTitle')}
            </motion.h2>
            <motion.p variants={item} className="text-[var(--text-secondary)] text-lg leading-relaxed">
              {t('immersiveDescription')}
            </motion.p>
          </div>

          {/* Skills Area */}
          <div className="md:w-2/3 flex flex-col gap-12">
            {categories.map((category) => (
              <motion.div key={category} variants={item} className="relative">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--accent-text)] uppercase tracking-widest mb-6 flex items-center gap-4">
                  <span>{t.has(`categories.${category}`) ? t(`categories.${category}`) : category.replace('_', ' ')}</span>
                  <div className="flex-grow h-[1px] bg-[var(--border-strong)]" />
                </h3>
                
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {groupedSkills[category].map((skill: any) => (
                    <motion.div 
                      key={skill.id}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      className="px-5 sm:px-6 py-3 bg-[var(--bg-surface)] backdrop-blur-sm border border-[var(--border-subtle)] hover:border-[var(--accent-color)]/50 rounded-2xl text-sm sm:text-base font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-default shadow-sm hover:shadow-md"
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
