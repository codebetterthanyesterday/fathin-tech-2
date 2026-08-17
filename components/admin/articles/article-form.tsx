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
import LocaleTabSelector from '../layout/locale-tab-selector';

export default function ArticleForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Extract initial translations
  const idTrans = initialData?.translations?.find((t: any) => t.locale === 'id');
  const enTrans = initialData?.translations?.find((t: any) => t.locale === 'en');

  // Translation states
  const [activeLocale, setActiveLocale] = useState<'id' | 'en'>('id');
  const [translations, setTranslations] = useState({
    id: {
      title: idTrans?.title || initialData?.title || '',
      excerpt: idTrans?.excerpt || initialData?.excerpt || '',
      contentMd: idTrans?.contentMd || initialData?.contentMd || '',
    },
    en: {
      title: enTrans?.title || '',
      excerpt: enTrans?.excerpt || '',
      contentMd: enTrans?.contentMd || '',
    },
  });

  const handleTransChange = (field: 'title' | 'excerpt' | 'contentMd', value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  const isIdComplete = !!translations.id.title?.trim() && !!translations.id.contentMd?.trim();
  const isEnComplete = !!translations.en.title?.trim() && !!translations.en.contentMd?.trim();

  // Language invariant states
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isAutoSlug, setIsAutoSlug] = useState(!initialData?.id);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);

  // UI state
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formState, setFormState] = useState<ArticleActionState>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-slug generation from title_id
  const handleTitleIdChange = (val: string) => {
    handleTransChange('title', val);
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

  // Markdown Toolbar actions
  const insertMarkdown = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = translations[activeLocale].contentMd;
    const selected = currentText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selected}${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    handleTransChange('contentMd', newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Live client-side preview rendering for current tab
  const previewHtml = useMemo(() => {
    return renderMarkdownClient(translations[activeLocale].contentMd || '');
  }, [translations, activeLocale]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({});

    const formData = new FormData();
    formData.append('title_id', translations.id.title);
    formData.append('excerpt_id', translations.id.excerpt);
    formData.append('contentMd_id', translations.id.contentMd);

    formData.append('title_en', translations.en.title);
    formData.append('excerpt_en', translations.en.excerpt);
    formData.append('contentMd_en', translations.en.contentMd);

    formData.append('slug', slug);
    formData.append('coverImage', coverImage);
    formData.append('isPublished', isPublished ? 'true' : 'false');

    startTransition(async () => {
      const result = await upsertArticle(initialData?.id || null, null, formData);
      setFormState(result);

      if (result.success) {
        setTimeout(() => {
          router.push(getAdminPath('articles'));
        }, 1200);
      }
    });
  };

  const currentTrans = translations[activeLocale];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-32">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <Link
            href={getAdminPath('articles')}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Artikel
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {initialData ? 'Edit Artikel' : 'Tulis Artikel Baru'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Publikasikan wawasan teknis, tutorial, atau catatan arsitektur sistem dalam multi-bahasa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isPublished
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {isPublished ? '● Publik (Published)' : '○ Draf (Draft)'}
          </button>

          <button
            type="button"
            onClick={(e) => {
              const form = (e.currentTarget.closest('div') as HTMLElement)?.parentElement?.nextElementSibling as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            disabled={isPending || isUploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-btn-bg)] text-[var(--accent-btn-fg)] hover:brightness-110 font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Artikel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Feedback */}
      {formState?.error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{formState.error}</p>
        </div>
      )}
      {formState?.success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{formState.success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Cover Image Uploader (Shared) */}
        <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Gambar Sampul (Cover Image)</h3>
              <p className="text-xs text-[var(--text-tertiary)]">Rasio ideal 16:9 atau 2:1 (Maks. 5MB)</p>
            </div>
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="text-xs text-red-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Hapus Gambar
              </button>
            )}
          </div>

          {coverImage ? (
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-black/50 border border-[var(--border-subtle)]">
              <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[21/9] sm:aspect-[4/1] rounded-2xl border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-6 text-center group"
            >
              {isUploading ? (
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-text)]" />
                  Mengunggah gambar...
                </div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-[var(--text-tertiary)] group-hover:text-[var(--accent-text)] transition-colors mb-2" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">Klik untuk upload cover image</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">PNG, JPG, WebP hingga 5MB</p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* BILINGUAL CONTENT TRANSLATION SECTION */}
        <div className="p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Konten & Naskah Artikel (Multi-Bahasa)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Kelola judul, kutipan ringkasan, dan teks lengkap Markdown untuk masing-masing bahasa.
              </p>
            </div>

            <LocaleTabSelector
              activeLocale={activeLocale}
              onLocaleChange={setActiveLocale}
              status={{
                id: { isComplete: isIdComplete },
                en: { isComplete: isEnComplete },
              }}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                Judul Artikel ({activeLocale.toUpperCase()}) *
              </label>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">
                {activeLocale === 'id' ? 'Bahasa Indonesia' : 'English'}
              </span>
            </div>
            <input
              type="text"
              value={currentTrans.title}
              onChange={(e) => {
                if (activeLocale === 'id') {
                  handleTitleIdChange(e.target.value);
                } else {
                  handleTransChange('title', e.target.value);
                }
              }}
              placeholder={activeLocale === 'id' ? 'Judul artikel teknis yang menarik...' : 'Engaging technical article headline...'}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-lg font-bold transition-all"
              required={activeLocale === 'id'}
            />
            {activeLocale === 'id' && formState?.fieldErrors?.title_id && (
              <p className="text-red-400 text-xs">{formState.fieldErrors.title_id[0]}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Ringkasan / Excerpt ({activeLocale.toUpperCase()})
            </label>
            <textarea
              rows={2}
              value={currentTrans.excerpt}
              onChange={(e) => handleTransChange('excerpt', e.target.value)}
              placeholder={activeLocale === 'id' ? 'Ringkasan 1-2 kalimat untuk preview artikel...' : '1-2 sentence preview for search & index cards...'}
              className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm resize-y"
            />
          </div>

          {/* Markdown Editor & Preview Workspace */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                Isi Artikel Markdown ({activeLocale.toUpperCase()}) *
              </label>

              {/* View Mode Toggle */}
              <div className="inline-flex items-center p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-[var(--accent-color)] text-[var(--accent-btn-fg)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`hidden sm:inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'split'
                      ? 'bg-[var(--accent-color)] text-[var(--accent-btn-fg)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5 mr-1" />
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-[var(--accent-color)] text-[var(--accent-btn-fg)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  Preview
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**', 'bold text')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*', 'italic text')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
              <button
                type="button"
                onClick={() => insertMarkdown('## ', '', 'Heading 2')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('### ', '', 'Heading 3')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
              <button
                type="button"
                onClick={() => insertMarkdown('> ', '', 'Quote block')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('`', '`', 'code')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('```ts\n', '\n```', '// Code snippet')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Code Block"
              >
                <FileCode className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
              <button
                type="button"
                onClick={() => insertMarkdown('- ', '', 'List item')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('1. ', '', 'Numbered item')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('[', '](https://...)', 'Link text')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Link"
              >
                <Link2 className="w-4 h-4" />
              </button>
            </div>

            {/* Split / Edit / Preview Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Textarea Editor */}
              {(viewMode === 'split' || viewMode === 'edit') && (
                <div className={`${viewMode === 'edit' ? 'col-span-2' : 'col-span-1'}`}>
                  <textarea
                    ref={textareaRef}
                    rows={20}
                    value={currentTrans.contentMd}
                    onChange={(e) => handleTransChange('contentMd', e.target.value)}
                    placeholder={activeLocale === 'id' ? 'Tuliskan naskah artikel Anda dalam format Markdown...' : 'Write your technical article body in Markdown...'}
                    className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl text-[var(--text-primary)] font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-y min-h-[450px]"
                    required={activeLocale === 'id'}
                  />
                  {activeLocale === 'id' && formState?.fieldErrors?.contentMd_id && (
                    <p className="text-red-400 text-xs mt-1">{formState.fieldErrors.contentMd_id[0]}</p>
                  )}
                </div>
              )}

              {/* Preview Window */}
              {(viewMode === 'split' || viewMode === 'preview') && (
                <div
                  className={`p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-y-auto max-h-[550px] ${
                    viewMode === 'preview' ? 'col-span-2' : 'col-span-1'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-subtle)] text-xs font-mono text-[var(--text-tertiary)]">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>Live Preview ({activeLocale.toUpperCase()})</span>
                  </div>

                  <div
                    className="prose dark:prose-invert prose-zinc max-w-none prose-headings:font-bold prose-a:text-[var(--accent-text)] leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-zinc-500 italic">Belum ada konten yang ditulis...</p>' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SHARED SETTINGS (Slug & Publishing) */}
        <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
            Pengaturan URL & Publikasi (Berlaku untuk Semua Bahasa)
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                Slug URL Artikel
              </label>
              <button
                type="button"
                onClick={() => setIsAutoSlug(!isAutoSlug)}
                className="text-xs text-[var(--accent-text)] hover:underline"
              >
                {isAutoSlug ? 'Mode Manual' : 'Mode Otomatis'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-tertiary)] bg-[var(--bg-card)] px-3 py-2.5 border border-[var(--border-subtle)] rounded-xl">
                /articles/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsAutoSlug(false);
                }}
                placeholder="microservices-architecture-notes"
                className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
