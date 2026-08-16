'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { upsertExperience, ExperienceActionState } from '@/app/actions/experience';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ExperienceType } from '@/app/generated/prisma/client';

export default function ExperienceFormModal({ 
  isOpen, 
  onClose, 
  experience 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  experience?: any; 
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Type selection (WORK or EDUCATION)
  const [type, setType] = useState<ExperienceType>(experience?.type || 'WORK');
  
  // Date states
  const [isCurrent, setIsCurrent] = useState<boolean>(experience ? !experience.endDate : false);
  
  // Format Date for native date input (YYYY-MM-DD)
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

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

  // Update local state when experience prop changes
  useEffect(() => {
    if (experience) {
      setType(experience.type);
      setIsCurrent(!experience.endDate);
    } else {
      setType('WORK');
      setIsCurrent(false);
    }
  }, [experience, isOpen]);

  const initialState: { success?: string; error?: string; fieldErrors?: Record<string, string[]> } = { success: '', error: '', fieldErrors: {} };
  const actionToRun = experience ? upsertExperience.bind(null, experience.id) : upsertExperience.bind(null, null);
  const [state, formAction, isPending] = useActionState(actionToRun as any, initialState);

  // Reset on success
  useEffect(() => {
    if (state?.success && !experience) {
      formRef.current?.reset();
      setIsCurrent(false);
    }
    // We don't auto-close so the user can see success and optionally add more.
  }, [state?.success, experience]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {experience ? 'Edit Entry' : 'Create Entry'}
        </h2>

        {state?.error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{state.error}</p>
          </div>
        )}
        
        {state?.success && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <p>{state.success}</p>
          </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-5">
          <input type="hidden" name="type" value={type} />

          {/* Segmented Control for Type */}
          <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg relative">
            <div 
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-zinc-700 rounded-md transition-all duration-300 ease-out ${
                type === 'WORK' ? 'left-1' : 'left-[calc(50%+4px)]'
              }`}
            />
            <button
              type="button"
              onClick={() => setType('WORK')}
              className={`flex-1 relative z-10 py-1.5 text-sm font-medium transition-colors ${
                type === 'WORK' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Work
            </button>
            <button
              type="button"
              onClick={() => setType('EDUCATION')}
              className={`flex-1 relative z-10 py-1.5 text-sm font-medium transition-colors ${
                type === 'EDUCATION' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Education
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300">
              {type === 'WORK' ? 'Position / Job Title *' : 'Degree / Major *'}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={experience?.title || ''}
              required
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder={type === 'WORK' ? 'e.g. Senior Frontend Engineer' : 'e.g. Bachelor of Computer Science'}
            />
            {state?.fieldErrors?.title && <p className="text-red-400 text-xs">{state.fieldErrors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="institution" className="block text-sm font-medium text-zinc-300">
              {type === 'WORK' ? 'Company *' : 'Institution / University *'}
            </label>
            <input
              id="institution"
              name="institution"
              type="text"
              defaultValue={experience?.institution || ''}
              required
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder={type === 'WORK' ? 'e.g. Google' : 'e.g. Massachusetts Institute of Technology'}
            />
            {state?.fieldErrors?.institution && <p className="text-red-400 text-xs">{state.fieldErrors.institution[0]}</p>}
          </div>

          {/* Date Picker Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-zinc-300">Start Date *</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDate(experience?.startDate)}
                required
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all [color-scheme:dark]"
              />
              {state?.fieldErrors?.startDate && <p className="text-red-400 text-xs">{state.fieldErrors.startDate[0]}</p>}
            </div>

            <div className={`space-y-2 transition-opacity duration-300 ${isCurrent ? 'opacity-50' : 'opacity-100'}`}>
              <label htmlFor="endDate" className="block text-sm font-medium text-zinc-300">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={isCurrent ? '' : formatDate(experience?.endDate)}
                disabled={isCurrent}
                required={!isCurrent}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all [color-scheme:dark] disabled:cursor-not-allowed"
              />
              {state?.fieldErrors?.endDate && <p className="text-red-400 text-xs">{state.fieldErrors.endDate[0]}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="isCurrent"
                name="isCurrent"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-white focus:ring-white/30 focus:ring-offset-zinc-950 transition-colors"
              />
            </div>
            <label htmlFor="isCurrent" className="text-sm text-zinc-400 cursor-pointer select-none hover:text-zinc-200 transition-colors">
              I currently {type === 'WORK' ? 'work' : 'study'} here
            </label>
          </div>

          <div className="space-y-2 pt-2">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={experience?.description || ''}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-y text-sm"
              placeholder="Enter achievements and responsibilities..."
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-zinc-800/50">
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
              {experience ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
