import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-white flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-xl">
        <h1 className="text-8xl sm:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-6">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-medium text-white mb-4">
          Lost in the void
        </h2>
        <p className="text-zinc-400 text-lg mb-12">
          The page or project you're looking for doesn't exist, has been moved, or is currently drifting somewhere in the digital abyss.
        </p>

        <Link 
          href="/"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Home
        </Link>
      </div>
    </main>
  );
}
