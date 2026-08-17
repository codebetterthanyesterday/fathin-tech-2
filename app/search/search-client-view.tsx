'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  X,
  Layers,
  FileText,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
} from 'lucide-react';
import ThemeToggle from '@/components/public/layout/theme-toggle';
import HighlightMatch from '@/components/public/search/highlight-match';
import { SearchResultItem, SearchResponse } from '@/app/api/search/route';

export default function SearchClientView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<string>(initialType);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when URL params change externally (e.g. browser back/forward)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const t = searchParams.get('type') || 'all';
    const p = parseInt(searchParams.get('page') || '1', 10);

    if (q !== activeQuery) {
      setInputQuery(q);
      setActiveQuery(q);
    }
    setActiveType(t);
    setCurrentPage(p);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL helper (uses router.replace with scroll: false to avoid cluttering history)
  const updateUrl = useCallback(
    (q: string, t: string, p: number) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (t !== 'all') params.set('type', t);
      if (p > 1) params.set('page', p.toString());

      const queryString = params.toString();
      router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [router]
  );

  // Real-time as-you-type search debouncer (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputQuery.trim();
      if (trimmed !== activeQuery) {
        setActiveQuery(trimmed);
        setCurrentPage(1);
        updateUrl(trimmed, activeType, 1);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputQuery, activeQuery, activeType, updateUrl]);

  // Execute search API request
  const fetchResults = useCallback(async (query: string, type: string, page: number) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}&type=${encodeURIComponent(
          type
        )}&page=${page}&limit=10`
      );
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setResults(data.results || []);
        setTotalResults(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } else {
        setResults([]);
        setTotalResults(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Search fetch error:', err);
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when activeQuery, activeType, or currentPage changes
  useEffect(() => {
    fetchResults(activeQuery, activeType, currentPage);
  }, [activeQuery, activeType, currentPage, fetchResults]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    setActiveQuery(trimmed);
    setCurrentPage(1);
    updateUrl(trimmed, activeType, 1);
    fetchResults(trimmed, activeType, 1);
  };

  const handleTypeChange = (newType: string) => {
    setActiveType(newType);
    setCurrentPage(1);
    updateUrl(activeQuery, newType, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrl(activeQuery, activeType, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputQuery(suggestion);
    setActiveQuery(suggestion);
    setCurrentPage(1);
    updateUrl(suggestion, activeType, 1);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setInputQuery('');
    setActiveQuery('');
    setCurrentPage(1);
    updateUrl('', activeType, 1);
    inputRef.current?.focus();
  };

  const quickSearchSuggestions = [
    'Next.js',
    'PostgreSQL',
    'Full-Stack',
    'Prisma',
    'Tailwind',
    'Architecture',
  ];

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] pb-32">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg-elevated)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] rounded-md py-1 px-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest hidden sm:inline-block">
              Dedicated Search
            </span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Search Header Section */}
      <section className="relative pt-32 pb-12 px-4 sm:px-8 border-b border-[var(--border-subtle)]">
        {/* Glow ambient background */}
        <div
          className="absolute top-0 right-1/4 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none -translate-y-1/2 opacity-25"
          style={{ backgroundColor: 'var(--glow-color)' }}
        />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
              Search Portfolio
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Real-time search across technical case studies, featured projects, and published articles.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Type keywords (e.g. Next.js, API, PostgreSQL)..."
                className="w-full pl-12 pr-28 py-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] shadow-lg text-base sm:text-lg transition-all"
              />
              <div className="absolute right-3 flex items-center gap-2">
                {isLoading ? (
                  <div className="p-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-text)]" />
                  </div>
                ) : inputQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent-btn-bg)] text-[var(--accent-btn-fg)] hover:brightness-110 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleTypeChange('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeType === 'all'
                  ? 'bg-[var(--accent-color)] text-[var(--accent-btn-fg)] shadow-sm font-semibold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>All Content</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('project')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeType === 'project'
                  ? 'bg-[var(--accent-color)] text-[var(--accent-btn-fg)] shadow-sm font-semibold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('article')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeType === 'article'
                  ? 'bg-[var(--accent-color)] text-[var(--accent-btn-fg)] shadow-sm font-semibold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Articles</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Results Content Area */}
      <section className="pt-8 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Active Query Status Header */}
          {activeQuery.trim().length >= 2 && (
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[var(--border-subtle)] text-xs font-mono text-[var(--text-tertiary)]">
              <span>
                {isLoading
                  ? 'Searching...'
                  : `Found ${totalResults} result${totalResults === 1 ? '' : 's'}`} for &ldquo;{activeQuery}&rdquo;
              </span>
              {totalPages > 1 && (
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[var(--border-subtle)]" />
                    <div className="h-5 bg-[var(--border-subtle)] rounded w-1/3" />
                  </div>
                  <div className="h-4 bg-[var(--border-subtle)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--border-subtle)] rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {/* Initial Prompt State (when query is empty) */}
          {!isLoading && activeQuery.trim().length < 2 && (
            <div className="py-16 text-center border border-[var(--border-subtle)] border-dashed rounded-3xl bg-[var(--bg-card)] px-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--accent-text)] shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Type something to search
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8">
                Search queries match across titles, summaries, tech stacks, and full markdown bodies with real-time typo tolerance.
              </p>

              <div className="space-y-3">
                <p className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                  Suggested Searches
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                  {quickSearchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Zero Results Empty State */}
          {!isLoading && activeQuery.trim().length >= 2 && results.length === 0 && (
            <div className="py-16 text-center border border-[var(--border-subtle)] border-dashed rounded-3xl bg-[var(--bg-card)] px-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                No matching results
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                We couldn&apos;t find anything matching &ldquo;{activeQuery}&rdquo;. Try using broader terms, checking for typos, or switching filter categories.
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="px-5 py-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all active:scale-95"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Results List */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.url}
                  className="group block p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Badge / Type Indicator */}
                      <div className="flex items-center gap-2">
                        {item.type === 'project' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono font-medium">
                            <Layers className="w-3 h-3" />
                            Project
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-mono font-medium">
                            <FileText className="w-3 h-3" />
                            Article
                          </span>
                        )}

                        {item.featured && (
                          <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-text)] border border-[var(--accent-color)]/20">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors leading-snug">
                        <HighlightMatch text={item.title} query={activeQuery} />
                      </h3>

                      {/* Snippet */}
                      {item.snippet && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                          <HighlightMatch text={item.snippet} query={activeQuery} />
                        </p>
                      )}

                      {/* Tags for projects */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-full text-xs font-mono text-[var(--text-tertiary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-2 rounded-xl bg-[var(--bg-surface)] group-hover:bg-[var(--accent-color)] group-hover:text-[var(--accent-btn-fg)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] transition-all shrink-0 mt-1">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:pointer-events-none transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-mono font-medium transition-all ${
                      pageNum === currentPage
                        ? 'bg-[var(--accent-color)] text-[var(--accent-btn-fg)] shadow-sm font-bold'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:pointer-events-none transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
