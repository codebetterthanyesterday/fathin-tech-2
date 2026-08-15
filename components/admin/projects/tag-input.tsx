'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "Add a tag..." }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      // Remove last tag when hitting backspace on empty input
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg min-h-[46px] transition-colors focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20">
      {tags.map((tag) => (
        <span 
          key={tag} 
          className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-zinc-800 text-zinc-200 text-sm font-medium rounded-md animate-in zoom-in-95 duration-200"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="p-0.5 hover:bg-zinc-700 hover:text-white text-zinc-400 rounded-sm transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none p-1"
        placeholder={tags.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
