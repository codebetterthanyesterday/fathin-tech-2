'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  UserCircle2,
  User,
  Settings,
  ExternalLink,
  LogOut,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useEffect, useState, useRef, useTransition } from 'react';
import { logout } from '@/app/actions/auth';
import { getAdminPath } from '@/lib/routes';
import { useAdminMessages } from '@/components/admin/messages/admin-messages-provider';

// Maps route prefixes to readable titles
const getPageTitle = (pathname: string) => {
  const adminBase = getAdminPath();
  if (pathname === adminBase) return 'Dashboard';
  if (pathname.startsWith(`${adminBase}/messages`)) return 'Real-Time Inbox';
  if (pathname.startsWith(`${adminBase}/profile`)) return 'System Profile Data';
  if (pathname.startsWith(`${adminBase}/skills`)) return 'Skills & Technologies';
  if (pathname.startsWith(`${adminBase}/projects/new`)) return 'Add New Project';
  if (pathname.startsWith(`${adminBase}/projects`) && pathname.length > `${adminBase}/projects`.length) return 'Edit Project';
  if (pathname.startsWith(`${adminBase}/projects`)) return 'Projects Portfolio';
  if (pathname.startsWith(`${adminBase}/experience`)) return 'Career & Education';
  if (pathname.startsWith(`${adminBase}/sections`)) return 'Page Sections & Layout';
  if (pathname.startsWith(`${adminBase}/testimonials`)) return 'Testimonials';
  if (pathname.startsWith(`${adminBase}/articles/new`)) return 'Write Article';
  if (pathname.startsWith(`${adminBase}/articles`) && pathname.length > `${adminBase}/articles`.length) return 'Edit Article';
  if (pathname.startsWith(`${adminBase}/articles`)) return 'Technical Articles';
  if (pathname.startsWith(`${adminBase}/settings`)) return 'System Configuration';
  return 'System Control Panel';
};

interface HeaderProps {
  onMenuClick: () => void;
  email: string | null;
}

export default function Header({ onMenuClick, email }: HeaderProps) {
  const pathname = usePathname();
  const [title, setTitle] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { connectionStatus } = useAdminMessages();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const profileHref = getAdminPath('profile');
  const settingsHref = getAdminPath('settings');

  // Update title on mount and pathname change
  useEffect(() => {
    setTitle(getPageTitle(pathname));
    setIsDropdownOpen(false); // Close dropdown on navigation
  }, [pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Hamburger (Mobile) + Breadcrumb Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Animated Title */}
        <div className="relative h-6 overflow-hidden flex items-center gap-3">
          <h1
            key={title} // Forces re-render/animation on title change
            className="text-lg font-semibold text-white tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-300"
          >
            {title}
          </h1>

          {/* Connection Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium transition-colors ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-zinc-800 border-white/10 text-zinc-400'
            }`}
            title={`Real-Time EventStream: ${
              connectionStatus === 'connected'
                ? 'Active (Live)'
                : connectionStatus === 'connecting'
                ? 'Reconnecting...'
                : 'Disconnected'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 animate-ping'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-zinc-500'
              }`}
            />
            <span>
              {connectionStatus === 'connected'
                ? 'Live'
                : connectionStatus === 'connecting'
                ? 'Syncing'
                : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Account Trigger with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 group ${
            isDropdownOpen
              ? 'bg-zinc-800/80 border-white/20 text-white shadow-lg'
              : 'bg-zinc-900/50 hover:bg-zinc-800/50 border-white/5 hover:border-white/10 text-zinc-300'
          }`}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 text-zinc-300 group-hover:text-white transition-colors">
            <User className="w-4 h-4" />
          </div>

          <div className="hidden sm:flex flex-col items-start text-left min-w-[80px]">
            <span className="text-xs font-semibold text-white leading-tight truncate max-w-[150px]">
              {email ? email.split('@')[0] : 'Admin'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono leading-tight truncate max-w-[150px]">
              {email || 'Account'}
            </span>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 hidden sm:block ${
              isDropdownOpen ? 'rotate-180 text-white' : 'group-hover:text-zinc-200'
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0e0e0e] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl">
            {/* Header info in dropdown */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs text-zinc-500 font-medium">Authenticated Identity</p>
              <p className="text-sm font-semibold text-white truncate mt-0.5" title={email || ''}>
                {email || 'admin@portfolio.local'}
              </p>
            </div>

            {/* Navigation links */}
            <div className="p-1.5 space-y-0.5">
              <Link
                href={profileHref}
                onClick={() => setIsDropdownOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith(profileHref)
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCircle2 className="w-4 h-4 text-zinc-400" />
                <span>Profile Configuration</span>
              </Link>

              <Link
                href={settingsHref}
                onClick={() => setIsDropdownOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith(settingsHref)
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>System Configuration</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  <span>Access Public Interface</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">↗</span>
              </Link>
            </div>

            {/* Logout Action */}
            <div className="pt-1.5 mt-1 border-t border-white/5 px-1.5">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>Terminate Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
