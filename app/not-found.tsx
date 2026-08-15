import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/public/layout/theme-toggle';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-[120px] pointer-events-none opacity-30" 
        style={{ backgroundColor: 'var(--glow-color)' }}
      />
      
      <div className="relative z-10 text-center max-w-xl">
        <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-tertiary)] mb-6">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
          Lost in the void
        </h2>
        <p className="text-[var(--text-secondary)] text-lg mb-12 leading-relaxed">
          The page or project you&apos;re looking for doesn&apos;t exist, has been moved, or is currently drifting somewhere in the digital abyss.
        </p>

        <Link 
          href="/"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all font-semibold text-sm shadow-md hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Home
        </Link>
      </div>
    </main>
  );
}
