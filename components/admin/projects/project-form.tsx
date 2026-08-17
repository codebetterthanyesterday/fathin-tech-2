'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { upsertProject, getExistingTechStacks, checkProjectSlug } from '@/app/actions/project';
import { getAdminPath } from '@/lib/routes';
import { Loader2, Save, ArrowLeft, CheckCircle, AlertCircle, Link as LinkIcon, Edit3, Eye, Video } from 'lucide-react';
import TagInput from './tag-input';
import ImageGallery, { ProjectImage } from './image-gallery';
import MarkdownEditor from '../markdown-editor';
import LocaleTabSelector from '../layout/locale-tab-selector';

export default function ProjectForm({ project }: { project?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Extract initial translations
  const idTrans = project?.translations?.find((t: any) => t.locale === 'id');
  const enTrans = project?.translations?.find((t: any) => t.locale === 'en');

  // Translation states
  const [activeLocale, setActiveLocale] = useState<'id' | 'en'>('id');
  const [translations, setTranslations] = useState({
    id: {
      title: idTrans?.title || project?.title || '',
      summary: idTrans?.summary || project?.summary || '',
      description: idTrans?.description || project?.description || '',
      role: idTrans?.role || project?.role || '',
      duration: idTrans?.duration || project?.duration || '',
      challenges: idTrans?.challenges || project?.challenges || '',
      solutions: idTrans?.solutions || project?.solutions || '',
      keyMetrics: idTrans?.keyMetrics || project?.keyMetrics || [],
    },
    en: {
      title: enTrans?.title || '',
      summary: enTrans?.summary || '',
      description: enTrans?.description || '',
      role: enTrans?.role || '',
      duration: enTrans?.duration || '',
      challenges: enTrans?.challenges || '',
      solutions: enTrans?.solutions || '',
      keyMetrics: enTrans?.keyMetrics || [],
    },
  });

  const handleTransChange = (field: string, value: any) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const isIdComplete = !!translations.id.title?.trim() && !!translations.id.summary?.trim();
  const isEnComplete = !!translations.en.title?.trim() && !!translations.en.summary?.trim();

  // Language invariant states
  const [slug, setSlug] = useState(project?.slug || '');
  const [isAutoSlug, setIsAutoSlug] = useState(!project?.id);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [teamSize, setTeamSize] = useState<string>(project?.teamSize?.toString() || '');
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl || '');
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl || '');
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl || '');
  const [techStack, setTechStack] = useState<string[]>(project?.techStack || []);
  const [categories, setCategories] = useState<string[]>(project?.categories || []);
  const [images, setImages] = useState<ProjectImage[]>(project?.images || []);
  const [isFeatured, setIsFeatured] = useState<boolean>(project?.isFeatured || false);

  // Editor states
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Form action
  const initialState: { success?: string; error?: string; fieldErrors?: Record<string, string[]> } = { success: '', error: '', fieldErrors: {} };
  const [state, formAction, isPending] = useActionState(upsertProject, initialState);

  // Fetch tags
  useEffect(() => {
    getExistingTechStacks().then(res => {
      if (res.tags) setExistingTags(res.tags);
    });
  }, []);

  // Draft Auto-saving
  const draftKey = `project-draft-${project?.id || 'new'}`;
  
  useEffect(() => {
    if (!draftRestored) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        if (confirm('Draf proyek ditemukan. Apakah Anda ingin memulihkannya?')) {
          try {
            const data = JSON.parse(saved);
            if (data.translations) setTranslations(data.translations);
            setSlug(data.slug || '');
            setTeamSize(data.teamSize || '');
            setDemoUrl(data.demoUrl || '');
            setRepoUrl(data.repoUrl || '');
            setVideoUrl(data.videoUrl || '');
            if (data.techStack) setTechStack(data.techStack);
            if (data.categories) setCategories(data.categories);
            if (data.isFeatured !== undefined) setIsFeatured(data.isFeatured);
            setIsDirty(true);
          } catch (e) {
            console.error('Failed to parse draft');
          }
        } else {
          localStorage.removeItem(draftKey);
        }
      }
      setDraftRestored(true);
    }
  }, [draftKey, draftRestored]);

  // Auto-save interval
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      const draftData = {
        translations,
        slug,
        teamSize,
        demoUrl,
        repoUrl,
        videoUrl,
        techStack,
        categories,
        isFeatured,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [isDirty, translations, slug, teamSize, demoUrl, repoUrl, videoUrl, techStack, categories, isFeatured, draftKey]);

  // Clear draft on successful save
  useEffect(() => {
    if (state?.success) {
      localStorage.removeItem(draftKey);
      setIsDirty(false);
      setTimeout(() => {
        router.push(getAdminPath('projects'));
      }, 1500);
    }
  }, [state?.success, draftKey, router]);

  // Slug generator from title_id
  const handleTitleIdChange = (val: string) => {
    handleTransChange('title', val);
    if (isAutoSlug) {
      const generated = val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
      setSlug(generated);
    }
  };

  // Debounced slug checker
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const res = await checkProjectSlug(slug, project?.id);
      if (res.available) {
        setSlugStatus('available');
      } else {
        setSlugStatus('taken');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, project?.id]);

  const currentTrans = translations[activeLocale];

  return (
    <form ref={formRef} action={formAction} className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <button
            type="button"
            onClick={() => router.push(getAdminPath('projects'))}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Proyek
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {project ? 'Edit Proyek' : 'Tambah Proyek Baru'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Kelola data proyek, translasi konten multi-bahasa, media showcase, dan metrik dampak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
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
                Simpan Proyek
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {state?.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{state.success}</p>
        </div>
      )}

      {/* Hidden inputs to send serialized arrays and both translations */}
      <input type="hidden" name="id" value={project?.id || ''} />
      <input type="hidden" name="techStack" value={JSON.stringify(techStack)} />
      <input type="hidden" name="categories" value={JSON.stringify(categories)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      
      {/* Translations payload */}
      <input type="hidden" name="title_id" value={translations.id.title} />
      <input type="hidden" name="summary_id" value={translations.id.summary} />
      <input type="hidden" name="description_id" value={translations.id.description} />
      <input type="hidden" name="role_id" value={translations.id.role} />
      <input type="hidden" name="duration_id" value={translations.id.duration} />
      <input type="hidden" name="challenges_id" value={translations.id.challenges} />
      <input type="hidden" name="solutions_id" value={translations.id.solutions} />
      <input type="hidden" name="keyMetrics_id" value={JSON.stringify(translations.id.keyMetrics)} />

      <input type="hidden" name="title_en" value={translations.en.title} />
      <input type="hidden" name="summary_en" value={translations.en.summary} />
      <input type="hidden" name="description_en" value={translations.en.description} />
      <input type="hidden" name="role_en" value={translations.en.role} />
      <input type="hidden" name="duration_en" value={translations.en.duration} />
      <input type="hidden" name="challenges_en" value={translations.en.challenges} />
      <input type="hidden" name="solutions_en" value={translations.en.solutions} />
      <input type="hidden" name="keyMetrics_en" value={JSON.stringify(translations.en.keyMetrics)} />

      {/* BILINGUAL CONTENT TRANSLATION SECTION */}
      <div className="p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Konten & Informasi Proyek (Multi-Bahasa)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Tuliskan judul, ringkasan, dan detail proyek untuk masing-masing bahasa.
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
              Judul Proyek ({activeLocale.toUpperCase()}) *
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
            placeholder={activeLocale === 'id' ? 'cth. E-Commerce Platform Mikroservis' : 'e.g. Microservices E-Commerce Platform'}
            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-base transition-all"
            required={activeLocale === 'id'}
          />
          {activeLocale === 'id' && state?.fieldErrors?.title_id && (
            <p className="text-red-400 text-xs">{state.fieldErrors.title_id[0]}</p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Ringkasan Singkat ({activeLocale.toUpperCase()}) *
          </label>
          <textarea
            rows={2}
            value={currentTrans.summary}
            onChange={(e) => handleTransChange('summary', e.target.value)}
            placeholder={activeLocale === 'id' ? 'Deskripsi 1-2 kalimat untuk kartu proyek...' : '1-2 sentence overview for the project card...'}
            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-sm transition-all resize-y"
            required={activeLocale === 'id'}
          />
          {activeLocale === 'id' && state?.fieldErrors?.summary_id && (
            <p className="text-red-400 text-xs">{state.fieldErrors.summary_id[0]}</p>
          )}
        </div>

        {/* Role & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Peran / Role ({activeLocale.toUpperCase()})
            </label>
            <input
              type="text"
              value={currentTrans.role}
              onChange={(e) => handleTransChange('role', e.target.value)}
              placeholder={activeLocale === 'id' ? 'cth. Lead Full-Stack Engineer' : 'e.g. Lead Full-Stack Engineer'}
              className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Durasi ({activeLocale.toUpperCase()})
            </label>
            <input
              type="text"
              value={currentTrans.duration}
              onChange={(e) => handleTransChange('duration', e.target.value)}
              placeholder={activeLocale === 'id' ? 'cth. 3 Bulan (Q1 2026)' : 'e.g. 3 Months (Q1 2026)'}
              className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Metrik Kunci / Dampak ({activeLocale.toUpperCase()})
          </label>
          <TagInput
            tags={currentTrans.keyMetrics}
            onChange={(tags) => handleTransChange('keyMetrics', tags)}
            placeholder={activeLocale === 'id' ? 'Ketik metrik lalu tekan Enter (cth: "Peningkatan 40% efisiensi")...' : 'Type metric and press Enter (e.g. "40% efficiency boost")...'}
          />
        </div>

        {/* Full Markdown Description */}
        <div className="space-y-2 pt-2">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Deskripsi Lengkap / Case Study ({activeLocale.toUpperCase()})
          </label>
          <MarkdownEditor
            value={currentTrans.description}
            onChange={(val) => handleTransChange('description', val)}
            placeholder={activeLocale === 'id' ? 'Tuliskan studi kasus mendalam proyek dalam format Markdown...' : 'Write detailed case study in Markdown format...'}
          />
        </div>

        {/* Challenges & Solutions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-subtle)]">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Tantangan / Kendala ({activeLocale.toUpperCase()})
            </label>
            <textarea
              rows={4}
              value={currentTrans.challenges}
              onChange={(e) => handleTransChange('challenges', e.target.value)}
              placeholder={activeLocale === 'id' ? 'Tantangan teknis utama yang dihadapi...' : 'Key technical challenges faced...'}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Solusi & Arsitektur ({activeLocale.toUpperCase()})
            </label>
            <textarea
              rows={4}
              value={currentTrans.solutions}
              onChange={(e) => handleTransChange('solutions', e.target.value)}
              placeholder={activeLocale === 'id' ? 'Solusi arsitektur dan langkah teknis...' : 'Architectural solutions and engineering approaches...'}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm resize-y"
            />
          </div>
        </div>
      </div>

      {/* LANGUAGE-INVARIANT SETTINGS (URL, Stack, Media, Config) */}
      <div className="p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-4">
          Pengaturan Umum & Media (Berlaku untuk Semua Bahasa)
        </h2>

        {/* Slug Config */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Slug URL Proyek
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
              /projects/
            </span>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsAutoSlug(false);
                setIsDirty(true);
              }}
              placeholder="e-commerce-platform"
              className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm font-mono"
            />
          </div>
        </div>

        {/* Tech Stack & Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Tech Stack
            </label>
            <TagInput
              tags={techStack}
              onChange={(tags) => {
                setTechStack(tags);
                setIsDirty(true);
              }}
              existingTags={existingTags}
              placeholder="Ketik teknologi (cth: Next.js, PostgreSQL)..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Kategori
            </label>
            <TagInput
              tags={categories}
              onChange={(tags) => {
                setCategories(tags);
                setIsDirty(true);
              }}
              existingTags={['Web App', 'Mobile', 'Backend', 'Open Source', 'System Design']}
              placeholder="Ketik kategori..."
            />
          </div>
        </div>

        {/* Links & Video */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Demo URL
            </label>
            <input
              type="url"
              name="demoUrl"
              value={demoUrl}
              onChange={(e) => {
                setDemoUrl(e.target.value);
                setIsDirty(true);
              }}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Repository URL
            </label>
            <input
              type="url"
              name="repoUrl"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setIsDirty(true);
              }}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Video Walkthrough URL
            </label>
            <input
              type="url"
              name="videoUrl"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setIsDirty(true);
              }}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm"
            />
          </div>
        </div>

        {/* Team Size & Featured Switch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Ukuran Tim (Jumlah Orang)
            </label>
            <input
              type="number"
              name="teamSize"
              value={teamSize}
              onChange={(e) => {
                setTeamSize(e.target.value);
                setIsDirty(true);
              }}
              placeholder="cth. 4"
              min={1}
              className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={isFeatured}
              onChange={(e) => {
                setIsFeatured(e.target.checked);
                setIsDirty(true);
              }}
              className="w-5 h-5 accent-[var(--accent-color)] rounded"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-[var(--text-primary)] cursor-pointer">
              Tandai sebagai Proyek Unggulan (Featured)
            </label>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Galeri Gambar & Screenshot Proyek
          </label>
          <ImageGallery
            images={images}
            onChange={(newImages) => {
              setImages(newImages);
              setIsDirty(true);
            }}
          />
        </div>
      </div>
    </form>
  );
}
