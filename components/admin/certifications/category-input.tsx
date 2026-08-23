'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { CategoryDimension } from '@/app/actions/certification';

export interface CategoryItem {
  id?: string;
  name: string;
  dimension: CategoryDimension;
}

interface DimensionInputProps {
  dimension: CategoryDimension;
  label: string;
  placeholder: string;
  selected: CategoryItem[];
  suggestions: CategoryItem[];
  onChange: (items: CategoryItem[]) => void;
}

function DimensionTagInput({
  dimension,
  label,
  placeholder,
  selected,
  suggestions,
  onChange,
}: DimensionInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) &&
      !selected.some((sel) => sel.name.toLowerCase() === s.name.toLowerCase())
  );

  const addItem = (item: CategoryItem) => {
    if (!selected.some((s) => s.name.toLowerCase() === item.name.toLowerCase())) {
      onChange([...selected, item]);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeItem = (name: string) => {
    onChange(selected.filter((s) => s.name !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      // Check if exact match in suggestions
      const match = suggestions.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
      if (match) {
        addItem(match);
      } else {
        // Create new
        addItem({ name: trimmed, dimension });
      }
    } else if (e.key === 'Backspace' && !query && selected.length > 0) {
      removeItem(selected[selected.length - 1].name);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dimensionColors: Record<CategoryDimension, string> = {
    SKILL: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    ISSUER: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
    TYPE: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  };

  const tagColor = dimensionColors[dimension];

  return (
    <div ref={containerRef} className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}
      </label>

      <div
        className="min-h-[44px] flex flex-wrap gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((item) => (
          <span
            key={item.name}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${tagColor}`}
          >
            {item.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.name);
              }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Remove ${item.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (query.trim() || filtered.length > 0) && (
        <div className="relative z-20">
          <div className="absolute top-0 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-xl">
            {filtered.map((s) => (
              <button
                key={s.id || s.name}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addItem(s);
                }}
                className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                {s.name}
              </button>
            ))}
            {query.trim() &&
              !suggestions.some(
                (s) => s.name.toLowerCase() === query.trim().toLowerCase()
              ) && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addItem({ name: query.trim(), dimension });
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                  Create &ldquo;{query.trim()}&rdquo;
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryInputProps {
  value: CategoryItem[];
  onChange: (items: CategoryItem[]) => void;
  existingCategories: CategoryItem[];
}

export default function CategoryInput({
  value,
  onChange,
  existingCategories,
}: CategoryInputProps) {
  const byDimension = (dim: CategoryDimension) =>
    value.filter((v) => v.dimension === dim);
  const suggestionsFor = (dim: CategoryDimension) =>
    existingCategories.filter((c) => c.dimension === dim);

  const updateDimension = (dim: CategoryDimension, items: CategoryItem[]) => {
    const others = value.filter((v) => v.dimension !== dim);
    onChange([...others, ...items]);
  };

  return (
    <div className="space-y-3">
      <DimensionTagInput
        dimension="SKILL"
        label="Skills / Technologies"
        placeholder="e.g. Cloud, Security, Data..."
        selected={byDimension('SKILL')}
        suggestions={suggestionsFor('SKILL')}
        onChange={(items) => updateDimension('SKILL', items)}
      />
      <DimensionTagInput
        dimension="ISSUER"
        label="Issuing Organization"
        placeholder="e.g. AWS, Google, Coursera..."
        selected={byDimension('ISSUER')}
        suggestions={suggestionsFor('ISSUER')}
        onChange={(items) => updateDimension('ISSUER', items)}
      />
      <DimensionTagInput
        dimension="TYPE"
        label="Certificate Type"
        placeholder="e.g. Professional Cert, Course..."
        selected={byDimension('TYPE')}
        suggestions={suggestionsFor('TYPE')}
        onChange={(items) => updateDimension('TYPE', items)}
      />
    </div>
  );
}
