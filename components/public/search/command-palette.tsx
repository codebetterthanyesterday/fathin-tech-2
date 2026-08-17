'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Layers,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Command as CommandIcon,
} from 'lucide-react';
import { useSearch } from './search-context';
import HighlightMatch from './highlight-match';
import { SearchResultItem, SearchResponse } from '@/app/api/search/route';
import { useTranslations, useLocale } from 'next-intl';

export default function CommandPalette() {
  const { isOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const t = useTranslations('search');
  const tNav = useTranslations('nav');

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setTotalResults(0);
    }
  }, [isOpen]);

  // Debounced search fetcher
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&locale=${encodeURIComponent(locale)}&limit=8`
        );
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data.results || []);
          setTotalResults(data.total || 0);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Failed to fetch search results:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = useCallback(
    (url: string) => {
      closeSearch();
      router.push(url);
    },
    [closeSearch, router]
  );

  const handleViewAll = useCallback(() => {
    if (query.trim()) {
      closeSearch();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [closeSearch, query, router]);

  const projects = results.filter((r) => r.type === 'project');
  const articles = results.filter((r) => r.type === 'article');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Command Palette Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden text-[var(--text-primary)] flex flex-col z-10"
          >
            <Command
              label="Site Search Command Palette"
              shouldFilter={false}
              className="w-full flex flex-col"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  closeSearch();
                }
                if (e.key === 'Enter' && (e.metaKey || e.shiftKey)) {
                  e.preventDefault();
                  handleViewAll();
                }
              }}
            >
              {/* Search Header Bar */}
              <div className="flex items-center px-4 sm:px-6 py-4 border-b border-[var(--border-subtle)] gap-3 bg-[var(--bg-surface)]">
                <Search className="w-5 h-5 text-[var(--text-tertiary)] shrink-0" />
                <Command.Input
                  ref={inputRef}
                  value={query}
                  onValueChange={setQuery}
                  placeholder={t('placeholder')}
                  className="w-full bg-transparent text-base sm:text-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-0 border-0"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label={t('close')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded shadow-sm">
                    Esc
                  </kbd>
                )}
              </div>

              {/* Search Results List */}
              <Command.List className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 space-y-1 focus:outline-none overscroll-contain">
                {/* Skeleton Loader during search */}
                {isLoading && (
                  <div className="p-3 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[var(--bg-surface)] animate-pulse flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--border-subtle)] shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-[var(--border-subtle)] rounded w-1/3" />
                          <div className="h-3 bg-[var(--border-subtle)] rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State when no results found */}
                {!isLoading && query.trim().length >= 2 && results.length === 0 && (
                  <Command.Empty className="py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3 text-[var(--text-tertiary)]">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                      {t('noResults')} &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                      {t('noResultsSub')}
                    </p>
                  </Command.Empty>
                )}

                {/* Default prompt when query is empty */}
                {!isLoading && query.trim().length < 2 && (
                  <div className="py-8 px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] mb-4">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                      <span>{t('startSearching')}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {t('startSearchingSub')}
                    </p>

                    {/* Quick navigation options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-md mx-auto text-left">
                      <button
                        type="button"
                        onClick={() => {
                          closeSearch();
                          router.push('/#projects');
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] transition-colors group"
                      >
                        <Layers className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">{t('projects')}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[var(--text-tertiary)]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          closeSearch();
                          router.push('/articles');
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">{tNav('articlesAndThoughts')}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[var(--text-tertiary)]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Projects Group */}
                {!isLoading && projects.length > 0 && (
                  <Command.Group
                    heading={
                      <div className="px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-[var(--text-tertiary)] uppercase flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{t('projects')} ({projects.length})</span>
                      </div>
                    }
                  >
                    {projects.map((project) => (
                      <Command.Item
                        key={project.id}
                        value={`project-${project.id}-${project.title}`}
                        onSelect={() => handleSelectResult(project.url)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg-surface)] data-[selected=true]:bg-[var(--bg-surface)] cursor-pointer transition-colors group select-none"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--accent-text)]">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors truncate">
                              <HighlightMatch text={project.title} query={query} />
                            </span>
                            {project.featured && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--accent-color)]/10 text-[var(--accent-text)] border border-[var(--accent-color)]/20 shrink-0">
                                Featured
                              </span>
                            )}
                            {project.isFallback && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                {t('fallbackBadge')}
                              </span>
                            )}
                          </div>
                          {project.snippet && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                              <HighlightMatch text={project.snippet} query={query} />
                            </p>
                          )}
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {project.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-card)] rounded border border-[var(--border-subtle)]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-data-[selected=true]:opacity-100 transition-opacity shrink-0 mt-2" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Articles Group */}
                {!isLoading && articles.length > 0 && (
                  <Command.Group
                    heading={
                      <div className="px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-[var(--text-tertiary)] uppercase flex items-center gap-2 mt-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('articles')} ({articles.length})</span>
                      </div>
                    }
                  >
                    {articles.map((article) => (
                      <Command.Item
                        key={article.id}
                        value={`article-${article.id}-${article.title}`}
                        onSelect={() => handleSelectResult(article.url)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg-surface)] data-[selected=true]:bg-[var(--bg-surface)] cursor-pointer transition-colors group select-none"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--accent-text)]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors truncate">
                              <HighlightMatch text={article.title} query={query} />
                            </span>
                            {article.isFallback && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                {t('fallbackBadge')}
                              </span>
                            )}
                          </div>
                          {article.snippet && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                              <HighlightMatch text={article.snippet} query={query} />
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-data-[selected=true]:opacity-100 transition-opacity shrink-0 mt-2" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Command Palette Footer */}
              <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                {query.trim().length >= 2 && totalResults > 0 ? (
                  <button
                    type="button"
                    onClick={handleViewAll}
                    className="flex items-center gap-1.5 text-[var(--accent-text)] hover:underline font-medium"
                  >
                    <span>{t('viewAllResults', { count: totalResults })}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded shadow-sm">
                        ↑↓
                      </kbd>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded shadow-sm">
                        ↵
                      </kbd>
                    </span>
                  </div>
                )}

                <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
                  <span>{t('commandPaletteTitle')}</span>
                  <CommandIcon className="w-3 h-3" />
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
