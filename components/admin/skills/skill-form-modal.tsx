'use client';

import { useEffect, useRef, useActionState } from 'react';
import { createSkill, updateSkill, SkillActionState } from '@/app/actions/skill';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
  // We do not auto-close the modal, as requested.
  useEffect(() => {
    if (state?.success && !skill) {
      formRef.current?.reset();
    }
  }, [state?.success, skill]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {skill ? 'Edit Skill' : 'Add New Skill'}
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
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300">Skill Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={skill?.name || ''}
              required
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="e.g. React.js, Python, Figma"
            />
            {state?.fieldErrors?.name && <p className="text-red-400 text-xs">{state.fieldErrors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-zinc-300">Category *</label>
            <select
              id="category"
              name="category"
              defaultValue={skill?.category || 'OTHER'}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
            >
              <option value="LANGUAGE">Language</option>
              <option value="FRAMEWORK">Framework</option>
              <option value="TOOL">Tool</option>
              <option value="SOFT_SKILL">Soft Skill</option>
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
              {skill ? 'Save Changes' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
