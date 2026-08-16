'use client';

import { useState, useRef, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Save,
  Loader2,
  UploadCloud,
  X,
  ArrowLeft,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  FileCode,
  List,
  ListOrdered,
  Link2,
  Minus,
  Eye,
  Columns2,
  Edit3,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { upsertArticle, ArticleActionState } from '@/app/actions/article';
import { getAdminPath } from '@/lib/routes';
import { uploadImage } from '@/app/actions/upload';
import { renderMarkdownClient } from '@/lib/markdown/client';

type ArticleData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  coverImage: string;
  isPublished: boolean;
  publishedAt?: Date | string | null;
};

export default function ArticleForm({ initialData }: { initialData?: ArticleData | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isAutoSlug, setIsAutoSlug] = useState(!initialData?.id);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [contentMd, setContentMd] = useState(initialData?.contentMd || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);

  // UI state
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formState, setFormState] = useState<ArticleActionState>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-slug generation from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isAutoSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImage(formData);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      setCoverImage(result.url);
    }

    setIsUploading(false);
  };

  // Toolbar Formatting helper
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contentMd.substring(start, end) || placeholder;

    const newText =
      contentMd.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      contentMd.substring(end);

    setContentMd(newText);

    // Restore selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  // Real-time markdown preview rendering
  const renderedPreview = useMemo(() => {
    return renderMarkdownClient(contentMd || '*No content yet. Write some markdown on the left.*');
  }, [contentMd]);

  // Read time & Word count calculation
  const stats = useMemo(() => {
    const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [contentMd]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({});

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('excerpt', excerpt);
    formData.append('contentMd', contentMd);
    formData.append('coverImage', coverImage);
    formData.append('isPublished', isPublished ? 'true' : 'false');

    startTransition(async () => {
      const res = await upsertArticle(initialData?.id || null, {}, formData);
      setFormState(res);

      if (res.success) {
        // Redirect back to list
        setTimeout(() => {
          router.push(getAdminPath('articles'));
        }, 600);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl pb-24">
      {/* Header with Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-30 pt-2">
        <div className="flex items-center gap-3">
          <Link
            href={getAdminPath('articles')}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
            title="Back to Articles"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {initialData?.id ? 'Edit Article' : 'New Article'}
            </h1>
            <p className="text-xs text-zinc-400">
              {initialData?.id ? `Editing article /articles/${slug}` : 'Draft technical publication.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Publish Toggle Button in Header */}
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
              isPublished
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isPublished ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-zinc-600'
              }`}
            />
            {isPublished ? 'Published' : 'Draft'}
          </button>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="flex items-center gap-2 px-5 py-2 bg-white text-black font-semibold text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {initialData?.id ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {formState.error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{formState.error}</p>
        </div>
      )}
      {formState.success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>{formState.success}</p>
        </div>
      )}

      {/* Article Metadata Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
        {/* Left 2 Cols: Title, Slug, Excerpt */}
        <div className="md:col-span-2 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="System Architecture Overview"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-white text-base placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/40 transition-colors"
            />
            {formState.fieldErrors?.title && (
              <p className="text-xs text-red-400">{formState.fieldErrors.title[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Slug (URL Identifier)
              </label>
              <button
                type="button"
                onClick={() => setIsAutoSlug(!isAutoSlug)}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                {isAutoSlug ? 'Custom Slug' : 'Auto-Generate'}
              </button>
            </div>
            <div className="flex items-center bg-zinc-950/70 border border-zinc-800 rounded-xl overflow-hidden px-3">
              <span className="text-xs text-zinc-500 font-mono select-none">/articles/</span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsAutoSlug(false);
                  setSlug(e.target.value);
                }}
                placeholder="building-scalable-web-apps"
                className="w-full py-2.5 px-1 bg-transparent text-xs sm:text-sm text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            {formState.fieldErrors?.slug && (
              <p className="text-xs text-red-400">{formState.fieldErrors.slug[0]}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label htmlFor="excerpt" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Excerpt / Summary
            </label>
            <textarea
              id="excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Enter concise excerpt..."
              className="w-full px-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/40 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Right Col: Cover Image Upload */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Cover Image
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[16/10] rounded-xl border border-zinc-800 border-dashed bg-zinc-950/60 hover:bg-zinc-900/60 transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group/cover"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Uploading...</span>
              </div>
            ) : coverImage ? (
              <>
                <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="text-xs text-white font-medium bg-black/50 px-3 py-1.5 rounded-lg">
                    Change Image
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverImage('');
                    }}
                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500 text-center p-4">
                <UploadCloud className="w-7 h-7 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-300">Upload media</span>
                <span className="text-[10px] text-zinc-600">PNG, JPG, WebP up to 5MB</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        </div>
      </div>

      {/* Split-View Markdown Editor Section */}
      <div className="space-y-4">
        {/* Editor Toolbar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl sticky top-20 z-20 backdrop-blur-md">
          {/* Markdown Formatting Tools */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('## ', '', 'Heading 2')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ', '', 'Heading 3')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'code')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```ts\n', '\n```', '// Your code here')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Code Block"
            >
              <FileCode className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ', '', 'Quote text')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('- ', '', 'List item')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('1. ', '', 'Numbered item')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n---\n', '', '')}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Horizontal Divider"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Right: View Mode Toggle & Stats */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 font-mono pr-2 border-r border-zinc-800">
              <span>{stats.words} words</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {stats.minutes} min read
              </span>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-0.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Editor Only"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-md text-xs transition-colors hidden md:block ${
                  viewMode === 'split'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Split View"
              >
                <Columns2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Live Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Split View Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px]">
          {/* Left Column: Markdown Input */}
          {(viewMode === 'split' || viewMode === 'edit') && (
            <div
              className={`flex flex-col rounded-2xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden shadow-inner ${
                viewMode === 'edit' ? 'md:col-span-2' : ''
              }`}
            >
              <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/60 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                <span>MARKDOWN SOURCE</span>
                <span>GitHub Flavored Markdown</span>
              </div>
              <textarea
                ref={textareaRef}
                value={contentMd}
                onChange={(e) => setContentMd(e.target.value)}
                required
                placeholder="Enter markdown content..."
                className="flex-1 w-full p-6 bg-transparent text-zinc-100 font-mono text-sm leading-relaxed placeholder:text-zinc-700 focus:outline-none resize-none min-h-[550px] custom-scrollbar"
              />
            </div>
          )}

          {/* Right Column: Live Rendered Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div
              className={`flex flex-col rounded-2xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden ${
                viewMode === 'preview' ? 'md:col-span-2' : ''
              }`}
            >
              <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/60 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                <span>LIVE PREVIEW</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3 h-3" /> Real-time
                </span>
              </div>
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[700px] custom-scrollbar">
                <article
                  className="prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-white prose-a:underline hover:prose-a:text-zinc-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:p-4 prose-code:font-mono prose-code:text-xs prose-code:bg-zinc-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-400 prose-li:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: renderedPreview }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
