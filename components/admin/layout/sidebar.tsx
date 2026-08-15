'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCircle,
  Wrench,
  FolderGit2,
  Briefcase,
  Layers,
  MessageSquareQuote,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { useTransition } from 'react';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Profile', href: '/admin/profile', icon: UserCircle },
  { label: 'Skills', href: '/admin/skills', icon: Wrench },
  { label: 'Projects', href: '/admin/projects', icon: FolderGit2 },
  { label: 'Experience', href: '/admin/experience', icon: Briefcase },
  { label: 'Sections', href: '/admin/sections', icon: Layers },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote, disabled: true },
  { label: 'Articles', href: '/admin/articles', icon: FileText, disabled: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, disabled: true },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <aside className="w-full h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 text-zinc-400">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-lg leading-none mt-[-2px]">F</span>
          </div>
          <span className="text-white font-bold tracking-wide">CMS Builder</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          // Determine if current route is active. 
          // For nested routes like /admin/projects/new, we match if pathname starts with the href 
          // except for exact match on /admin dashboard.
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 rounded-lg cursor-not-allowed group relative"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">Soon</span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative group overflow-hidden ${isActive
                  ? 'text-white bg-white/5'
                  : 'hover:text-zinc-200 hover:bg-white/5'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none opacity-0 group-hover:opacity-100" />

              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium text-sm relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
