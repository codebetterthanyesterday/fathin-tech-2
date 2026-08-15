'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';

interface FeaturedProjectsProps {
  projects: any[];
}

export default function ImmersiveFeaturedProjects({ projects }: FeaturedProjectsProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  if (!projects || projects.length === 0) return null;

  return (
    <section ref={containerRef} className="relative bg-[#050505] text-white">
      {/* Title Section (Sticky on desktop) */}
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-1/3 lg:float-left flex flex-col justify-center px-4 sm:px-12 md:px-24 py-24 lg:py-0 z-10 bg-[#050505]/80 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6">
            Selected<br/>Works.
          </h2>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-sm">
            A curated collection of projects highlighting my approach to complex problems.
          </p>
        </motion.div>
      </div>

      {/* Projects List (Scrolls on desktop) */}
      <div className="lg:w-2/3 lg:float-right px-4 sm:px-12 md:px-24 lg:pl-0 lg:pr-24 pb-32 lg:pt-32 space-y-32">
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
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const animationStyle = prefersReducedMotion ? {} : { y, opacity };

  return (
    <motion.div 
      ref={cardRef}
      style={animationStyle}
      className="flex flex-col group"
    >
      {/* Image with Parallax */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden mb-8 bg-zinc-900 border border-white/5">
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700 z-10" />
        {mainImage ? (
          <Image
            src={mainImage}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700 font-medium">
            No image available
          </div>
        )}
        
        {/* Project Number */}
        <div className="absolute top-6 left-6 z-20 overflow-hidden">
          <motion.div 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl font-black text-white/50 mix-blend-overlay"
          >
            {(index + 1).toString().padStart(2, '0')}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-end justify-between">
        <div className="flex-grow max-w-xl">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="text-zinc-400 text-base sm:text-lg mb-6 leading-relaxed">
            {project.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack?.map((tech: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-sm font-medium border border-white/10">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 flex items-center gap-4 mt-4 sm:mt-0">
          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all"
              aria-label="Live Demo"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          
          <Link 
            href={`/projects/${project.slug}`} 
            className="px-6 py-3 rounded-full bg-accent text-zinc-950 font-bold flex items-center gap-2 hover:scale-105 transition-transform"
          >
            Details
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
