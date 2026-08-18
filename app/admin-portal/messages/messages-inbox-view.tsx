'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  ExternalLink,
  Reply,
  Inbox,
  Filter,
  X,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useAdminMessages,
  RealtimeMessage,
} from '@/components/admin/messages/admin-messages-provider';
import {
  updateMessageStatus,
  deleteContactMessage,
  getContactMessages,
} from '@/app/actions/contact';
import { useSearchParams, useRouter } from 'next/navigation';

export type ContactMessageStatusType = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';

interface MessagesInboxViewProps {
  initialMessages: RealtimeMessage[];
  initialCounts: Record<string, number>;
  initialTotal: number;
}

const STATUS_TABS: { id: string; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All Messages', icon: Inbox },
  { id: 'NEW', label: 'New', icon: Sparkles },
  { id: 'READ', label: 'Read', icon: Clock },
  { id: 'REPLIED', label: 'Replied', icon: CheckCircle2 },
  { id: 'ARCHIVED', label: 'Archived', icon: Archive },
];

export default function MessagesInboxView({
  initialMessages,
  initialCounts,
}: MessagesInboxViewProps) {
  const [messages, setMessages] = useState<RealtimeMessage[]>(initialMessages);
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<RealtimeMessage | null>(null);
  const [isUpdating, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { latestMessage, setUnreadCount, reconcileUnreadCount } = useAdminMessages();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Open message if URL parameter ?id=... is present
  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId) {
      const found = messages.find((m) => m.id === urlId);
      if (found) {
        handleOpenMessage(found);
      }
    }
  }, [searchParams, messages]);

  // Prepend real-time incoming SSE message to the list
  useEffect(() => {
    if (!latestMessage) return;

    setMessages((prev) => {
      // Check if already exists in state
      if (prev.some((m) => m.id === latestMessage.id)) return prev;
      return [latestMessage, ...prev];
    });

    setCounts((prev) => ({
      ...prev,
      ALL: (prev.ALL || 0) + 1,
      NEW: (prev.NEW || 0) + 1,
    }));
  }, [latestMessage]);

  // Refresh messages from server
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getContactMessages({ status: 'ALL', limit: 100 });
      setMessages(res.messages as RealtimeMessage[]);
      setCounts(res.counts);
      await reconcileUnreadCount();
    } catch (err) {
      console.error('Failed to refresh inbox:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter messages based on active tab and search query
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesTab = activeTab === 'ALL' || msg.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [messages, activeTab, searchQuery]);

  // Handle open message & auto-transition NEW -> READ
  const handleOpenMessage = async (msg: RealtimeMessage) => {
    setSelectedMessage(msg);

    if (msg.status === 'NEW') {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'READ' } : m))
      );
      setCounts((prev) => ({
        ...prev,
        NEW: Math.max(0, (prev.NEW || 0) - 1),
        READ: (prev.READ || 0) + 1,
      }));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Persist to server
      startTransition(async () => {
        try {
          await updateMessageStatus(msg.id, 'READ');
        } catch (err) {
          console.error('Failed to mark message as read:', err);
        }
      });
    }
  };

  // Handle status update
  const handleStatusChange = (id: string, newStatus: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED') => {
    const prevMsg = messages.find((m) => m.id === id);
    if (!prevMsg || prevMsg.status === newStatus) return;

    const oldStatus = prevMsg.status;

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    setCounts((prev) => ({
      ...prev,
      [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
      [newStatus]: (prev[newStatus] || 0) + 1,
    }));

    if (oldStatus === 'NEW') {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } else if (newStatus === 'NEW') {
      setUnreadCount((prev) => prev + 1);
    }

    startTransition(async () => {
      try {
        await updateMessageStatus(id, newStatus);
      } catch (err) {
        console.error('Failed to update message status:', err);
      }
    });
  };

  // Handle delete message
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) {
      return;
    }

    const msgToDelete = messages.find((m) => m.id === id);
    if (!msgToDelete) return;

    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }

    setCounts((prev) => ({
      ...prev,
      ALL: Math.max(0, (prev.ALL || 0) - 1),
      [msgToDelete.status]: Math.max(0, (prev[msgToDelete.status] || 0) - 1),
    }));

    if (msgToDelete.status === 'NEW') {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    startTransition(async () => {
      try {
        await deleteContactMessage(id);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    });
  };

  // Format date helper
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            New
          </span>
        );
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-white/5">
            Read
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Replied
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-zinc-500 border border-white/5">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>In-App Messages</span>
            {counts.NEW > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-lg animate-pulse">
                {counts.NEW} new
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time public contact transmissions delivered directly via Server-Sent Events.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 bg-[#0c0c0c] border border-white/5 rounded-2xl">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {STATUS_TABS.map((tab) => {
            const count = counts[tab.id] ?? 0;
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Inbox Layout: Split / List View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List Column */}
        <div
          className={`${
            selectedMessage ? 'lg:col-span-6 xl:col-span-5' : 'lg:col-span-12'
          } space-y-3`}
        >
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0a0a0a] border border-white/5 text-zinc-500 space-y-3">
              <Mail className="w-10 h-10 mx-auto text-zinc-600 opacity-50" />
              <p className="text-sm font-medium text-zinc-400">No transmissions found</p>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try modifying your search keywords or clear filters.'
                  : activeTab === 'ALL'
                  ? 'When visitors submit the public contact form, their transmissions will arrive here in real time.'
                  : `No messages currently under the "${activeTab}" category.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: -20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenMessage(msg)}
                        className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative group overflow-hidden ${
                          isSelected
                            ? 'bg-[#141414] border-white/20 shadow-lg'
                            : msg.status === 'NEW'
                            ? 'bg-blue-950/10 hover:bg-blue-950/20 border-blue-500/20 hover:border-blue-500/40'
                            : 'bg-[#0a0a0a] hover:bg-[#111111] border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* New indicator glow accent */}
                        {msg.status === 'NEW' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                        )}

                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-bold text-white truncate">
                              {msg.name}
                            </span>
                            <StatusBadge status={msg.status} />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 flex-shrink-0">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 font-mono truncate mb-2">
                          {msg.email}
                        </p>

                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                          {msg.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                          <span className="text-zinc-600">Click to view payload</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Selected Message Detail Column / Drawer */}
        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              key={selectedMessage.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-6 xl:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              {/* Detail Header */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{selectedMessage.name}</h2>
                    <StatusBadge status={selectedMessage.status} />
                  </div>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-xs font-mono text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{selectedMessage.email}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-xs font-mono text-zinc-500 pt-1">
                    Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Close detail view"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message Content Body */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  Message Payload
                </span>
                <div className="p-5 rounded-xl bg-[#060606] border border-white/5 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                {/* Reply via Email Action Button */}
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Contact Submission&body=Hi ${encodeURIComponent(
                    selectedMessage.name
                  )},\n\nThank you for reaching out.\n\n`}
                  onClick={() => {
                    if (selectedMessage.status !== 'REPLIED') {
                      handleStatusChange(selectedMessage.id, 'REPLIED');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99]"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply via Email Client (mailto)</span>
                </a>

                {/* Status Toggles & Delete */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-500 mr-2">Set Status:</span>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedMessage.id, 'READ')
                      }
                      disabled={selectedMessage.status === 'READ'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedMessage.status === 'READ'
                          ? 'bg-zinc-800 border-white/20 text-white'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      Read
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedMessage.id, 'REPLIED')
                      }
                      disabled={selectedMessage.status === 'REPLIED'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedMessage.status === 'REPLIED'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      Replied
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedMessage.id, 'ARCHIVED')
                      }
                      disabled={selectedMessage.status === 'ARCHIVED'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedMessage.status === 'ARCHIVED'
                          ? 'bg-zinc-800 border-white/20 text-white'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      Archive
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
