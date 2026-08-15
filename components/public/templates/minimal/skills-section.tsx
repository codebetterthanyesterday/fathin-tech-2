'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface SkillsSectionProps {
  skills: any[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
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
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-24 px-4 sm:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-12 tracking-tight">
            Skills & Expertise
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {categories.map((category) => (
              <motion.div key={category} variants={item} className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--text-secondary)] capitalize flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[var(--border-strong)]" />
                  {category.toLowerCase().replace('_', ' ')}
                </h3>
                
                <div className="flex flex-wrap gap-2.5">
                  {groupedSkills[category].map((skill: any) => (
                    <div 
                      key={skill.id}
                      className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] transition-all cursor-default shadow-sm"
                    >
                      {skill.name}
                    </div>
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
