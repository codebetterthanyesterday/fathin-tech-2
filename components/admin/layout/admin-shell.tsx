'use client';

import { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import AdminMessagesProvider from '@/components/admin/messages/admin-messages-provider';

export default function AdminShell({ 
  children,
  email
}: { 
  children: React.ReactNode;
  email: string | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <AdminMessagesProvider>
      <div data-theme="dark" className="flex h-screen bg-[#050505] text-white overflow-hidden selection:bg-white/20 selection:text-white">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-[260px] flex-shrink-0 relative z-20">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <div className="absolute top-0 left-0 bottom-0 w-[260px] bg-[#0a0a0a] animate-in slide-in-from-left duration-300 shadow-2xl">
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Glow Effect matching the global theme */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <Header 
            email={email} 
            onMenuClick={() => setIsMobileMenuOpen(true)} 
          />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <div className="p-4 sm:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminMessagesProvider>
  );
}
