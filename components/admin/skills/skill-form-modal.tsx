'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { createSkill, updateSkill, SkillActionState } from '@/app/actions/skill';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import LocaleTabSelector from '@/components/admin/layout/locale-tab-selector';

export default function SkillFormModal({ 
  isOpen, 
  onClose, 
  skill 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  skill?: any; 
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeLocale, setActiveLocale] = useState<'id' | 'en'>('id');

  const idTranslation = skill?.translations?.find((t: any) => t.locale === 'id');
  const enTranslation = skill?.translations?.find((t: any) => t.locale === 'en');

  const [nameId, setNameId] = useState(idTranslation?.name || skill?.name || '');
  const [nameEn, setNameEn] = useState(enTranslation?.name || '');

  // Sync state when skill prop changes
  useEffect(() => {
    if (skill) {
      const idTrans = skill?.translations?.find((t: any) => t.locale === 'id');
      const enTrans = skill?.translations?.find((t: any) => t.locale === 'en');
      setNameId(idTrans?.name || skill?.name || '');
      setNameEn(enTrans?.name || '');
    } else {
      setNameId('');
      setNameEn('');
    }
  }, [skill]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const initialState: SkillActionState = { success: '', error: '', fieldErrors: {} };
  
  // Choose action based on whether we are editing or creating
  const actionToRun = skill 
    ? updateSkill.bind(null, skill.id) 
    : createSkill;

  const [state, formAction, isPending] = useActionState(actionToRun as any, initialState);

  const formRef = useRef<HTMLFormElement>(null);

  // When adding a new skill is successful, reset the form so the user can add another one.
  useEffect(() => {
    if (state?.success && !skill) {
      setNameId('');
      setNameEn('');
      formRef.current?.reset();
    }
  }, [state?.success, skill]);

  if (!isOpen) return null;

  const localeStatus = {
    id: { isComplete: Boolean(nameId.trim()) },
    en: { isComplete: Boolean(nameEn.trim()) },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          {skill ? 'Edit Skill Entry' : 'Create Skill Entry'}
        </h2>

        {state?.error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <p>{state.error}</p>
          </div>
        )}
        
        {state?.success && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <p>{state.success}</p>
          </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-5">
          {/* Language Selector Tab */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Bahasa / Language
            </label>
            <LocaleTabSelector
              activeLocale={activeLocale}
              onLocaleChange={setActiveLocale}
              status={localeStatus}
              className="w-full justify-start"
            />
          </div>

          {/* Hidden inputs to preserve both values on submit */}
          <input type="hidden" name="name_id" value={nameId} />
          <input type="hidden" name="name_en" value={nameEn} />

          {/* Localized Name Field */}
          {activeLocale === 'id' ? (
            <div className="space-y-2">
              <label htmlFor="name_id_input" className="block text-sm font-medium text-zinc-300">
                Nama Skill (Bahasa Indonesia) *
              </label>
              <input
                id="name_id_input"
                type="text"
                value={nameId}
                onChange={(e) => setNameId(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="mis. React.js, Arsitektur Sistem, Manajemen Proyek"
              />
              {state?.fieldErrors?.name_id && <p className="text-red-400 text-xs">{state.fieldErrors.name_id[0]}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="name_en_input" className="block text-sm font-medium text-zinc-300">
                Skill Name (English)
              </label>
              <input
                id="name_en_input"
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="e.g. React.js, System Architecture, Project Management"
              />
              <p className="text-[11px] text-zinc-500 italic">
                Leave empty to fallback to the Indonesian name.
              </p>
            </div>
          )}

          {/* Shared Fields */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-zinc-300">Category *</label>
            <select
              id="category"
              name="category"
              defaultValue={skill?.category || 'OTHER'}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
            >
              <option value="LANGUAGE">Programming Language</option>
              <option value="FRAMEWORK">Framework / Library</option>
              <option value="TOOL">Tool & DevOps</option>
              <option value="SOFT_SKILL">Soft Skill / Leadership</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="level" className="block text-sm font-medium text-zinc-300">Proficiency Level (Optional)</label>
            <select
              id="level"
              name="level"
              defaultValue={skill?.level || ''}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
            >
              <option value="">Do not display level</option>
              <option value="1">1 - Beginner</option>
              <option value="2">2 - Familiar</option>
              <option value="3">3 - Proficient</option>
              <option value="4">4 - Advanced</option>
              <option value="5">5 - Expert</option>
            </select>
            {state?.fieldErrors?.level && <p className="text-red-400 text-xs">{state.fieldErrors.level[0]}</p>}
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="relative flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg disabled:opacity-50 transition-transform active:scale-95"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {skill ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
