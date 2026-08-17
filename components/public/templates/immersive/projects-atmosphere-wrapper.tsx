'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';

// Lazy load the R3F components so they aren't included in the initial bundle
const Canvas = dynamic(() => import('@react-three/fiber').then((mod) => mod.Canvas), {
  ssr: false,
});
const ImmersiveAtmosphere = dynamic(() => import('./immersive-atmosphere'), {
  ssr: false,
});

interface ProjectsAtmosphereWrapperProps {
  scrollProgress: number; // passed down from the parent section
}

export default function ProjectsAtmosphereWrapper({ scrollProgress }: ProjectsAtmosphereWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Check mobile (pointer: coarse) or narrow screen
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };
    checkMobile();
    
    // Check theme
    const checkTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      setIsDarkMode(isDark);
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('resize', checkMobile);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    
    // Mount the WebGL context only when the section is near the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { rootMargin: '400px' } // mount slightly before scrolling into view
    );
    
    observer.observe(wrapperRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Determine which fallback to use
  const shouldRenderWebGL = isMounted && isVisible && !isMobile && !prefersReducedMotion;
  const shouldRenderCSS = isMounted && (isMobile || prefersReducedMotion);

  return (
    <div 
      ref={wrapperRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {shouldRenderWebGL && (
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
            <ImmersiveAtmosphere scrollProgress={scrollProgress} isDarkMode={isDarkMode} />
          </Canvas>
        </div>
      )}

      {shouldRenderCSS && (
        <div 
          className={`absolute inset-0 opacity-40 transition-opacity duration-1000 ${
            !prefersReducedMotion ? 'animate-pulse' : ''
          }`}
          style={{
            background: isDarkMode 
              ? 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent-active) 15%, transparent) 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.03) 0%, transparent 60%)'
          }}
        />
      )}
    </div>
  );
}
