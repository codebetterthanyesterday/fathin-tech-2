'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ProjectImage {
  id: string;
  url: string;
  altText: string | null;
}

interface ProjectGalleryProps {
  images: ProjectImage[];
  projectTitle: string;
}

export default function ProjectGallery({ images, projectTitle }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    
    if (e.key === 'Escape') {
      setSelectedIndex(null);
    } else if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => (prev! + 1) % images.length);
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length);
    }
  }, [selectedIndex, images.length]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, handleKeyDown]);

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
        <div className="w-8 h-[1px] bg-[var(--border-strong)]" />
        Gallery
      </h3>
      
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer ring-1 ring-[var(--border-subtle)] hover:ring-[var(--border-strong)] transition-all shadow-sm"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-300 z-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
              <div className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white shadow-lg">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>
            <Image
              src={image.url}
              alt={image.altText || `${projectTitle} gallery image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal (Purposely stays dark in both modes for optimal image viewing) */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close gallery"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button 
              className="absolute left-4 sm:left-8 p-3 text-white bg-black/60 hover:bg-white/20 rounded-full transition-colors z-50 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Next Button */}
            <button 
              className="absolute right-4 sm:right-8 p-3 text-white bg-black/60 hover:bg-white/20 rounded-full transition-colors z-50 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev! + 1) % images.length);
              }}
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Current Image */}
            <motion.div 
              key={selectedIndex}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-6xl aspect-[16/9] sm:aspect-video max-h-[85vh] mx-4 sm:mx-24"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex].url}
                alt={images[selectedIndex].altText || `${projectTitle} gallery image ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              
              <div className="absolute bottom-[-40px] left-0 right-0 text-center text-zinc-400 text-sm font-mono">
                {selectedIndex + 1} of {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
