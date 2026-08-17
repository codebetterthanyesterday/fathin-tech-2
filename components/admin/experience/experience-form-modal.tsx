'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { upsertExperience, ExperienceActionState } from '@/app/actions/experience';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ExperienceType } from '@/app/generated/prisma/client';
import LocaleTabSelector from '../layout/locale-tab-selector';

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

  // Translations
  const idTrans = experience?.translations?.find((t: any) => t.locale === 'id');
  const enTrans = experience?.translations?.find((t: any) => t.locale === 'en');

  const [activeLocale, setActiveLocale] = useState<'id' | 'en'>('id');
  const [translations, setTranslations] = useState({
    id: {
      title: idTrans?.title || experience?.title || '',
      description: idTrans?.description || experience?.description || '',
    },
    en: {
      title: enTrans?.title || '',
      description: enTrans?.description || '',
    },
  });

  const handleTransChange = (field: 'title' | 'description', value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  const isIdComplete = !!translations.id.title?.trim();
  const isEnComplete = !!translations.en.title?.trim();
  
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
      const currId = experience.translations?.find((t: any) => t.locale === 'id');
      const currEn = experience.translations?.find((t: any) => t.locale === 'en');
      setTranslations({
        id: {
          title: currId?.title || experience.title || '',
          description: currId?.description || experience.description || '',
        },
        en: {
          title: currEn?.title || '',
          description: currEn?.description || '',
        },
      });
    } else {
      setType('WORK');
      setIsCurrent(false);
      setTranslations({
        id: { title: '', description: '' },
        en: { title: '', description: '' },
      });
    }
  }, [experience, isOpen]);

  const initialState: { success?: string; error?: string; fieldErrors?: Record<string, string[]> } = { success: '', error: '', fieldErrors: {} };
  const [state, formAction, isPending] = useActionState(upsertExperience, initialState);

  // Reset on success
  useEffect(() => {
    if (state?.success && !experience) {
      formRef.current?.reset();
      setIsCurrent(false);
      setTranslations({
        id: { title: '', description: '' },
        en: { title: '', description: '' },
      });
    }
  }, [state?.success, experience]);

  if (!isOpen) return null;

  const currentTrans = translations[activeLocale];

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
          {experience ? 'Edit Riwayat' : 'Tambah Riwayat Pengalaman'}
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
          <input type="hidden" name="id" value={experience?.id || ''} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="title_id" value={translations.id.title} />
          <input type="hidden" name="description_id" value={translations.id.description} />
          <input type="hidden" name="title_en" value={translations.en.title} />
          <input type="hidden" name="description_en" value={translations.en.description} />

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
              Pekerjaan (Work)
            </button>
            <button
              type="button"
              onClick={() => setType('EDUCATION')}
              className={`flex-1 relative z-10 py-1.5 text-sm font-medium transition-colors ${
                type === 'EDUCATION' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Pendidikan (Education)
            </button>
          </div>

          {/* Bilingual Tab Selector */}
          <div className="pt-1">
            <LocaleTabSelector
              activeLocale={activeLocale}
              onLocaleChange={setActiveLocale}
              status={{
                id: { isComplete: isIdComplete },
                en: { isComplete: isEnComplete },
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300">
                {type === 'WORK' ? 'Posisi / Job Title *' : 'Gelar / Jurusan *'} ({activeLocale.toUpperCase()})
              </label>
              <span className="text-xs text-zinc-500 font-mono">
                {activeLocale === 'id' ? 'Bahasa Indonesia' : 'English'}
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={currentTrans.title}
              onChange={(e) => handleTransChange('title', e.target.value)}
              required={activeLocale === 'id'}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder={type === 'WORK' ? (activeLocale === 'id' ? 'cth. Senior Software Engineer' : 'e.g. Senior Software Engineer') : (activeLocale === 'id' ? 'cth. Sarjana Ilmu Komputer' : 'e.g. Bachelor of Computer Science')}
            />
            {activeLocale === 'id' && state?.fieldErrors?.title_id && (
              <p className="text-red-400 text-xs">{state.fieldErrors.title_id[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="institution" className="block text-sm font-medium text-zinc-300">
              {type === 'WORK' ? 'Perusahaan / Organisasi *' : 'Institusi / Universitas *'}
            </label>
            <input
              id="institution"
              name="institution"
              type="text"
              defaultValue={experience?.institution || ''}
              required
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder={type === 'WORK' ? 'cth. Google, Tokopedia' : 'cth. Universitas Indonesia'}
            />
            {state?.fieldErrors?.institution && <p className="text-red-400 text-xs">{state.fieldErrors.institution[0]}</p>}
          </div>

          {/* Date Picker Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-zinc-300">Tanggal Mulai *</label>
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
              <label htmlFor="endDate" className="block text-sm font-medium text-zinc-300">Tanggal Selesai</label>
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
              Saat ini saya {type === 'WORK' ? 'bekerja' : 'menempuh studi'} di sini
            </label>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
                Deskripsi Tanggung Jawab / Prestasi ({activeLocale.toUpperCase()})
              </label>
            </div>
            <textarea
              id="description"
              rows={4}
              value={currentTrans.description}
              onChange={(e) => handleTransChange('description', e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-y text-sm"
              placeholder={activeLocale === 'id' ? 'Tuliskan poin pencapaian dan tanggung jawab utama...' : 'Write key responsibilities and achievements...'}
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-zinc-800/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="relative flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg disabled:opacity-50 transition-transform active:scale-95"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {experience ? 'Perbarui Data' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
