'use client';

import { usePathname } from 'next/navigation';
import { Menu, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Maps route prefixes to readable titles
const getPageTitle = (pathname: string) => {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/profile')) return 'Profile';
  if (pathname.startsWith('/admin/skills')) return 'Skills';
  if (pathname.startsWith('/admin/projects/new')) return 'Add New Project';
  if (pathname.startsWith('/admin/projects') && pathname.length > '/admin/projects'.length) return 'Edit Project';
  if (pathname.startsWith('/admin/projects')) return 'Projects';
  if (pathname.startsWith('/admin/experience')) return 'Experience';
  return 'Admin';
};

interface HeaderProps {
  onMenuClick: () => void;
  email: string | null;
}

export default function Header({ onMenuClick, email }: HeaderProps) {
  const pathname = usePathname();
  const [title, setTitle] = useState('');

  // Update title on mount and pathname change
  useEffect(() => {
    setTitle(getPageTitle(pathname));
  }, [pathname]);

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Animated Title */}
        <div className="relative h-6 overflow-hidden flex items-center">
          <h1 
            key={title} // Forces re-render/animation on title change
            className="text-lg font-semibold text-white tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-300"
          >
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Logged In</span>
          <span className="text-sm text-zinc-300 font-medium">{email || 'Admin'}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
          <UserCircle2 className="w-6 h-6 text-zinc-500" strokeWidth={1.5} />
        </div>
      </div>
    </header>
  );
}
