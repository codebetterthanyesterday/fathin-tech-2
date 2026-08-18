'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Mail, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminPath } from '@/lib/routes';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface RealtimeMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
}

interface AdminMessagesContextType {
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  latestMessage: RealtimeMessage | null;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  reconcileUnreadCount: () => Promise<void>;
}

const AdminMessagesContext = createContext<AdminMessagesContextType | undefined>(undefined);

export function useAdminMessages() {
  const context = useContext(AdminMessagesContext);
  if (!context) {
    throw new Error('useAdminMessages must be used within an AdminMessagesProvider');
  }
  return context;
}

export default function AdminMessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [latestMessage, setLatestMessage] = useState<RealtimeMessage | null>(null);
  const [activeToast, setActiveToast] = useState<RealtimeMessage | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const eventSourceRef = useRef<EventSource | null>(null);

  // Reconciliation fetch to query current unread count from database
  const reconcileUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/unread-count', {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (err) {
      console.error('[AdminMessages] Reconciliation fetch error:', err);
    }
  }, []);

  // Show toast notification
  const showToast = useCallback((msg: RealtimeMessage) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setActiveToast(msg);
    // Auto-dismiss after 6 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  }, []);

  useEffect(() => {
    // Initial fetch of unread count on mount
    reconcileUnreadCount();

    let isMounted = true;

    // Connect to SSE stream
    function connectSSE() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setConnectionStatus('connecting');
      const es = new EventSource('/api/messages/stream');
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isMounted) return;
        setConnectionStatus('connected');
        // Reconcile count whenever stream connects or reconnects
        reconcileUnreadCount();
      };

      es.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_MESSAGE' && data.message) {
            const newMsg: RealtimeMessage = data.message;
            setLatestMessage(newMsg);
            setUnreadCount((prev) => prev + 1);
            showToast(newMsg);
          }
        } catch {
          // Keepalive or unparseable event
        }
      };

      es.onerror = () => {
        if (!isMounted) return;
        setConnectionStatus('connecting');
        // Native EventSource automatically attempts reconnection
      };
    }

    connectSSE();

    // Reconcile on window focus / network back online
    const handleFocusOrOnline = () => {
      reconcileUnreadCount();
    };

    window.addEventListener('focus', handleFocusOrOnline);
    window.addEventListener('online', handleFocusOrOnline);

    return () => {
      isMounted = false;
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      window.removeEventListener('focus', handleFocusOrOnline);
      window.removeEventListener('online', handleFocusOrOnline);
    };
  }, [reconcileUnreadCount, showToast]);

  const handleToastClick = (msgId: string) => {
    setActiveToast(null);
    const messagesPath = getAdminPath('messages');
    router.push(`${messagesPath}?id=${msgId}`);
  };

  return (
    <AdminMessagesContext.Provider
      value={{
        unreadCount,
        connectionStatus,
        latestMessage,
        setUnreadCount,
        reconcileUnreadCount,
      }}
    >
      {children}

      {/* Floating Real-Time Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#121212] border border-white/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl p-4 text-white"
          >
            {/* Ambient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 animate-pulse" />

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    New Transmission
                  </span>
                  <button
                    onClick={() => setActiveToast(null)}
                    className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors"
                    aria-label="Dismiss toast"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  {activeToast.name}
                </p>
                <p className="text-xs text-zinc-400 truncate font-mono">
                  {activeToast.email}
                </p>
                <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                  &ldquo;{activeToast.message}&rdquo;
                </p>

                <button
                  onClick={() => handleToastClick(activeToast.id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Open in Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminMessagesContext.Provider>
  );
}
