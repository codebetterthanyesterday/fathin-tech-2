'use client';

import { useState, useRef, useMemo } from 'react';
import { Bold, Italic, Heading2, Heading3, Code, FileCode, Quote, List, ListOrdered, Link2, Minus, Edit3, Columns2, Eye } from 'lucide-react';
import { renderMarkdownClient } from '@/lib/markdown/client';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder = 'Write markdown here...', minHeight = '350px' }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const renderedPreview = useMemo(() => {
    return renderMarkdownClient(value || '*No content yet. Write some markdown on the left.*');
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl sticky top-0 z-20 backdrop-blur-md">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => insertFormatting('**', '**', 'bold text')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('*', '*', 'italic text')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button type="button" onClick={() => insertFormatting('## ', '', 'Heading 2')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('### ', '', 'Heading 3')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button type="button" onClick={() => insertFormatting('`', '`', 'code')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Inline Code"><Code className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('```ts\n', '\n```', '// Your code here')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Code Block"><FileCode className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('> ', '', 'Quote text')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Blockquote"><Quote className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button type="button" onClick={() => insertFormatting('- ', '', 'List item')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Bullet List"><List className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('1. ', '', 'Numbered item')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('[', '](https://example.com)', 'link text')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Link"><Link2 className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('\n---\n', '', '')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title="Horizontal Divider"><Minus className="w-4 h-4" /></button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-0.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button type="button" onClick={() => setViewMode('edit')} className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`} title="Editor Only"><Edit3 className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => setViewMode('split')} className={`p-1.5 rounded-md text-xs transition-colors hidden md:block ${viewMode === 'split' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`} title="Split View"><Columns2 className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => setViewMode('preview')} className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`} title="Live Preview"><Eye className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minHeight }}>
        {/* Editor */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className={`flex flex-col rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden shadow-inner ${viewMode === 'edit' ? 'md:col-span-2' : ''}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 w-full p-4 bg-transparent text-zinc-100 font-mono text-sm leading-relaxed placeholder:text-zinc-700 focus:outline-none resize-y custom-scrollbar"
              style={{ minHeight }}
            />
          </div>
        )}
        
        {/* Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`flex flex-col rounded-xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden ${viewMode === 'preview' ? 'md:col-span-2' : ''}`}>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: `calc(${minHeight} + 150px)` }}>
              <article
                className="prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-white prose-a:underline hover:prose-a:text-zinc-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-code:font-mono prose-code:text-xs prose-code:bg-zinc-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-400 prose-li:text-zinc-300"
                dangerouslySetInnerHTML={{ __html: renderedPreview }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
