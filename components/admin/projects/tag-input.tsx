'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  existingTags?: string[];
  placeholder?: string;
}

export default function TagInput({ tags, onChange, existingTags = [], placeholder = "Add a tag..." }: TagInputProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter available tags that are not already selected and match the input
  const suggestions = existingTags
    .filter((t) => !tags.includes(t))
    .filter((t) => t.toLowerCase().includes(input.toLowerCase()));

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen && suggestions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen && suggestions.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (isOpen && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex]);
      } else {
        addTag(input);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="flex flex-wrap items-center gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg min-h-[46px] transition-colors focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {tags.map((tag) => (
          <span 
            key={tag} 
            className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-zinc-800 text-zinc-200 text-sm font-medium rounded-md animate-in zoom-in-95 duration-200"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="p-0.5 hover:bg-zinc-700 hover:text-white text-zinc-400 rounded-sm transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay adding tag on blur to allow dropdown click to register
            setTimeout(() => {
              if (input) {
                addTag(input);
              }
            }, 150);
          }}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none p-1"
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (suggestions.length > 0 || (input && !suggestions.includes(input))) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                index === selectedIndex
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <span>{suggestion}</span>
              {index === selectedIndex && (
                <span className="text-[10px] text-zinc-500 font-mono">Enter</span>
              )}
            </button>
          ))}
          {input && !suggestions.includes(input) && !tags.includes(input) && (
            <button
              type="button"
              onClick={() => addTag(input)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                suggestions.length === selectedIndex
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-zinc-500">Create new:</span>
                <span className="font-medium text-emerald-400">"{input}"</span>
              </span>
              {suggestions.length === selectedIndex && (
                <span className="text-[10px] text-zinc-500 font-mono">Enter</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
