'use client';

import React from 'react';

interface HighlightMatchProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export default function HighlightMatch({
  text,
  query,
  className = '',
  highlightClassName = '',
}: HighlightMatchProps) {
  if (!text) return null;
  if (!query || query.trim().length < 2) {
    return <span className={className}>{text}</span>;
  }

  // Extract individual words from query
  const words = query
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex
    .filter(Boolean);

  if (words.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${words.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = words.some((w) => new RegExp(`^${w}$`, 'i').test(part));

        if (isMatch) {
          return (
            <mark
              key={index}
              className={`bg-[var(--accent-color)]/20 text-[var(--accent-text)] font-semibold rounded px-0.5 py-0.2 mx-0.5 border-b border-[var(--accent-color)]/40 ${highlightClassName}`}
              style={{
                textDecoration: 'none',
              }}
            >
              {part}
            </mark>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
