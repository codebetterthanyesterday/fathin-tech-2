'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useSearch } from './search-context';

interface SearchTriggerProps {
  className?: string;
  variant?: 'button' | 'compact' | 'icon';
}

export default function SearchTrigger({
  className = '',
  variant = 'compact',
}: SearchTriggerProps) {
  const { openSearch } = useSearch();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label="Open search command palette"
        className={`w-10 h-10 rounded-full flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${className}`}
      >
        <Search className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={openSearch}
        className={`flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${className}`}
      >
        <Search className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-text)] transition-colors" />
        <span className="text-sm font-medium">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded shadow-sm ml-2">
          ⌘K
        </kbd>
      </button>
    );
  }

  // default 'compact'
  return (
    <button
      type="button"
      onClick={openSearch}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] group ${className}`}
      aria-label="Search"
    >
      <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-text)] transition-colors" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded">
        ⌘K
      </kbd>
    </button>
  );
}
