'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { ReorderableList, useReorderableItem, ReorderableDragHandle, ReorderableFallbackControls } from '@/components/admin/shared/reorderable-list';
import { arrayMove } from '@dnd-kit/sortable';
import {
  toggleSectionVisibility,
  moveSectionOrder,
  updateSectionTitle,
  updateSectionContent,
  reorderSections,
} from '@/app/actions/section';
import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Pencil,
  Check,
  X,
  LayoutList,
  Star,
  Briefcase,
  Code2,
  Users,
  FileText,
  AlignLeft,
  GripVertical,
  AlertCircle,
} from 'lucide-react';
import { DEFAULT_CONTENT } from '@/lib/sections/schema';
import LocaleTabSelector from '@/components/admin/layout/locale-tab-selector';

// ─── Section type metadata ────────────────────────────────────────────────────

const SECTION_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  HERO: {
    label: 'Hero',
    icon: <Star className="w-5 h-5" />,
    description: 'Profile intro, photo, social links & CTA',
  },
  SKILLS_GRID: {
    label: 'Skills & Expertise',
    icon: <Code2 className="w-5 h-5" />,
    description: 'Skills grouped by category',
  },
  PROJECTS_GRID: {
    label: 'Featured Work',
    icon: <LayoutList className="w-5 h-5" />,
    description: 'Grid of projects with filters',
  },
  EXPERIENCE_TIMELINE: {
    label: 'Experience',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Work & education timeline',
  },
  TESTIMONIALS: {
    label: 'Testimonials',
    icon: <Users className="w-5 h-5" />,
    description: 'Client testimonials (coming soon)',
  },
  ARTICLES_LIST: {
    label: 'Articles',
    icon: <FileText className="w-5 h-5" />,
    description: 'Blog post list (coming soon)',
  },
  CUSTOM_TEXT: {
    label: 'Custom Text',
    icon: <AlignLeft className="w-5 h-5" />,
    description: 'Freeform heading + body block',
  },
};

// ─── Inline content editor ────────────────────────────────────────────────────

function ContentEditor({ section, onClose }: { section: any; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<any>(section.content ?? DEFAULT_CONTENT[section.type] ?? {});
  const [activeLocale, setActiveLocale] = useState<'id' | 'en'>('id');
  const [feedback, setFeedback] = useState('');

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSectionContent(section.id, { ...content, type: section.type });
      if (result.error) setFeedback(result.error);
      else { setFeedback('Saved!'); setTimeout(onClose, 600); }
    });
  };

  const update = (key: string, value: string | number | undefined | string[]) =>
    setContent((prev: any) => ({ ...prev, [key]: value }));

  // Check translation status for HERO and CUSTOM_TEXT
  const getLocaleStatus = () => {
    if (section.type === 'HERO') {
      const hasId = Boolean((content.ctaLabel_id && content.ctaLabel_id.trim()) || (content.ctaLabel && content.ctaLabel.trim()));
      const hasEn = Boolean((content.ctaLabel_en && content.ctaLabel_en.trim()) || (content.ctaLabel && content.ctaLabel.trim()));
      return {
        id: { isComplete: hasId },
        en: { isComplete: hasEn },
      };
    }
    if (section.type === 'CUSTOM_TEXT') {
      const hasId = Boolean((content.heading_id && content.heading_id.trim()) || (content.heading && content.heading.trim()));
      const hasEn = Boolean(content.heading_en && content.heading_en.trim());
      return {
        id: { isComplete: hasId },
        en: { isComplete: hasEn },
      };
    }
    return {
      id: { isComplete: true },
      en: { isComplete: true },
    };
  };

  return (
    <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Section Content</p>

        {(section.type === 'HERO' || section.type === 'CUSTOM_TEXT') && (
          <LocaleTabSelector
            activeLocale={activeLocale}
            onLocaleChange={setActiveLocale}
            status={getLocaleStatus()}
            className="scale-90 origin-left sm:origin-right"
          />
        )}
      </div>

      {section.type === 'HERO' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeLocale === 'id' ? (
              <div className="space-y-1.5">
                <Field
                  label="CTA Button Label (Bahasa Indonesia)"
                  value={content.ctaLabel_id ?? (content.ctaLabel && !content.ctaLabel_en ? content.ctaLabel : '')}
                  onChange={(v: string) => {
                    update('ctaLabel_id', v);
                    // Clear legacy ctaLabel to prevent stale fallback
                    if (content.ctaLabel) update('ctaLabel', '');
                  }}
                  placeholder="Kosongkan untuk default template ('Lihat Resume')"
                />
                <p className="text-[11px] text-zinc-500 italic">
                  Kosongkan field ini jika ingin teks tombol mengikuti terjemahan default sistem secara otomatis.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Field
                  label="CTA Button Label (English)"
                  value={content.ctaLabel_en ?? (content.ctaLabel && !content.ctaLabel_id ? content.ctaLabel : '')}
                  onChange={(v: string) => {
                    update('ctaLabel_en', v);
                    // Clear legacy ctaLabel to prevent stale fallback
                    if (content.ctaLabel) update('ctaLabel', '');
                  }}
                  placeholder="Leave empty for template default ('View Resume')"
                />
                <p className="text-[11px] text-zinc-500 italic">
                  Leave blank to automatically follow the system default English translation.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Field
                label="CTA Button URL (Shared)"
                value={content.ctaUrl ?? ''}
                onChange={(v: string) => update('ctaUrl', v)}
                placeholder="https://... (kosongkan untuk pakai resume URL)"
              />
              <p className="text-[11px] text-zinc-500 italic">
                URL tujuan tombol CTA (berlaku sama untuk semua bahasa).
              </p>
            </div>
          </div>
        </div>
      )}
      {section.type === 'PROJECTS_GRID' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Filter</label>
            <select
              value={content.filter ?? 'featured'}
              onChange={e => update('filter', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
            >
              <option value="featured">Featured Only</option>
              <option value="all">All Projects</option>
            </select>
          </div>
          <Field label="Limit" value={content.limit ?? ''} onChange={(v: string) => update('limit', v ? parseInt(v) : undefined)} placeholder="e.g. 3" type="number" />
        </div>
      )}
      {section.type === 'EXPERIENCE_TIMELINE' && (
        <Field label="Limit" value={content.limit ?? ''} onChange={(v: string) => update('limit', v ? parseInt(v) : undefined)} placeholder="Leave blank for all" type="number" />
      )}
      {section.type === 'SKILLS_GRID' && (
        <p className="text-xs text-zinc-500">Displays all skills. Category filtering can be added in a future PBI.</p>
      )}
      {section.type === 'CUSTOM_TEXT' && (
        <div className="space-y-4">
          {activeLocale === 'id' ? (
            <>
              <Field
                label="Heading (Bahasa Indonesia)"
                value={content.heading_id ?? content.heading ?? ''}
                onChange={(v: string) => {
                  update('heading_id', v);
                  if (content.heading) update('heading', '');
                }}
                placeholder="Judul Section (ID)"
              />
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Body (Bahasa Indonesia)</label>
                <textarea
                  value={content.body_id ?? content.body ?? ''}
                  onChange={e => {
                    update('body_id', e.target.value);
                    if (content.body) update('body', '');
                  }}
                  rows={4}
                  placeholder="Tulis isi bagian kustom dalam Bahasa Indonesia..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <Field
                label="Heading (English)"
                value={content.heading_en ?? ''}
                onChange={(v: string) => update('heading_en', v)}
                placeholder="Section Heading (EN)"
              />
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Body (English)</label>
                <textarea
                  value={content.body_en ?? ''}
                  onChange={e => update('body_en', e.target.value)}
                  rows={4}
                  placeholder="Write custom section body in English..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
                />
              </div>
            </>
          )}
        </div>
      )}
      {(section.type === 'TESTIMONIALS' || section.type === 'ARTICLES_LIST') && (
        <p className="text-sm text-zinc-500 italic">Placeholder — full implementation coming in a future PBI.</p>
      )}

      {feedback && (
        <p className={`text-xs ${feedback === 'Saved!' ? 'text-emerald-400' : 'text-red-400'}`}>{feedback}</p>
      )}
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={handleSave} disabled={isPending}
          className="px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50">
          {isPending ? 'Processing...' : 'Apply'}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-1.5 bg-transparent border border-zinc-700 text-zinc-400 text-xs rounded-md hover:border-zinc-500 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
      />
    </div>
  );
}

// ─── Individual sortable row ──────────────────────────────────────────────────

interface SectionRowProps {
  section: any;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, dir: 'up' | 'down') => void;
  isDragOverlay?: boolean;
}

function SectionRow({ section, isFirst, isLast, onMove, isDragOverlay = false }: SectionRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title ?? '');

  const {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
  } = useReorderableItem(section.id);

  const meta = SECTION_META[section.type] ?? {
    label: section.type,
    icon: <LayoutList className="w-5 h-5" />,
    description: '',
  };

  const handleToggle = () => {
    startTransition(async () => {
      await toggleSectionVisibility(section.id, !section.isVisible);
    });
  };

  const handleSaveTitle = () => {
    startTransition(async () => {
      await updateSectionTitle(section.id, titleValue);
      setIsEditingTitle(false);
    });
  };

  // Invisible "ghost" placeholder while dragging
  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[72px] rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`
        p-5 bg-zinc-900/40 border rounded-xl
        transition-colors duration-200
        ${isDragOverlay
          ? 'border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] scale-[1.03] rotate-[0.8deg] opacity-95 bg-zinc-900/90'
          : !section.isVisible
            ? 'border-zinc-800 opacity-50 hover:border-zinc-700'
            : 'border-zinc-800 hover:border-zinc-700'
        }
      `}
    >
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">

        {/* Drag handle */}
        <ReorderableDragHandle 
          attributes={isDragOverlay ? {} : attributes} 
          listeners={isDragOverlay ? {} : listeners} 
          isDragging={isDragging && !isDragOverlay} 
        />

        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400">
          {meta.icon}
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 w-40"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                />
                <button onClick={handleSaveTitle} disabled={isPending} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditingTitle(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 text-white font-semibold text-sm hover:text-zinc-300 transition-colors"
              >
                {section.title || meta.label}
                <Pencil className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </button>
            )}
            {!section.isVisible && (
              <span className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold">Hidden</span>
            )}
          </div>
          <p className="text-xs text-zinc-600 mt-0.5">{meta.description}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Keyboard-accessible up/down — always present, accessible alternative to drag */}
          <ReorderableFallbackControls
            onMoveUp={() => onMove(section.id, 'up')}
            onMoveDown={() => onMove(section.id, 'down')}
            isFirst={isFirst}
            isLast={isLast}
            isProcessing={isPending}
          />

          {/* Visibility toggle */}
          <button
            onClick={handleToggle}
            disabled={isPending}
            title={section.isVisible ? 'Hide section' : 'Show section'}
            aria-label={section.isVisible ? 'Hide section from public' : 'Show section on public site'}
            className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
              section.isVisible
                ? 'bg-white/10 border-white/20 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-600 hover:bg-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Edit content */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
              isEditing
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500'
            }`}
          >
            {isEditing ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {isEditing && (
        <ContentEditor section={section} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
}

// ─── Main export: SectionList with DnD ───────────────────────────────────────

export default function SectionList({ sections: initialSections }: { sections: any[] }) {
  const [sections, setSections] = useState(initialSections);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  // Keep a ref to the pre-drag order so we can rollback on error
  const prevOrderRef = useRef<any[]>(initialSections);

  useEffect(() => {
    setSections(initialSections);
    prevOrderRef.current = initialSections;
  }, [initialSections]);

  // Optimistic move via the existing up/down logic (keyboard-accessible alternative)
  const handleKeyboardMove = (id: string, dir: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === sections.length - 1) return;

    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const newSections = arrayMove(sections, idx, swapIdx);
    const prev = [...sections];
    setSections(newSections);
    setSaveError('');

    setIsSaving(true);
    reorderSections(newSections.map(s => s.id)).then(result => {
      setIsSaving(false);
      if (result.error) {
        setSaveError(result.error);
        setSections(prev); // rollback
      }
    });
  };

  const handleReorder = (newSections: any[]) => {
    // Optimistic update
    setSections(newSections);
    
    // Persist to DB
    setIsSaving(true);
    reorderSections(newSections.map(s => s.id)).then(result => {
      setIsSaving(false);
      if (result.error) {
        setSaveError(result.error);
        setSections(prevOrderRef.current); // rollback
      } else {
        prevOrderRef.current = newSections;
      }
    });
  };


  if (sections.length === 0) {
    return (
      <div className="text-center py-20 border border-zinc-800/50 rounded-xl border-dashed">
        <LayoutList className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">No entries found.</p>
        <p className="text-zinc-600 text-xs mt-2">Run the seed script to create initial sections.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between min-h-5">
        {saveError ? (
          <div className="flex items-center gap-2 text-sm text-red-400 animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        ) : isSaving ? (
          <p className="text-xs text-zinc-500 animate-pulse">Processing sort operation…</p>
        ) : (
          <p className="text-xs text-zinc-600">Drag rows or use ↑↓ buttons to reorder</p>
        )}
      </div>

      <ReorderableList
        items={sections}
        onReorder={handleReorder}
        renderOverlay={(activeId) => {
          const activeSection = sections.find(s => s.id === activeId);
          if (!activeSection) return null;
          return (
            <SectionRow
              section={activeSection}
              isFirst={false}
              isLast={false}
              onMove={() => {}}
              isDragOverlay
            />
          );
        }}
      >
        {sections.map((section, idx) => (
          <SectionRow
            key={section.id}
            section={section}
            isFirst={idx === 0}
            isLast={idx === sections.length - 1}
            onMove={handleKeyboardMove}
          />
        ))}
      </ReorderableList>
    </div>
  );
}
