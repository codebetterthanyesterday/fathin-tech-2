'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, GraduationCap, Clock } from 'lucide-react';
import ExperienceFormModal from './experience-form-modal';
import DeleteConfirmModal from '../skills/delete-confirm-modal';
import { deleteExperience } from '@/app/actions/experience';
import { resolveExperience } from '@/lib/translations';

interface ExperienceListProps {
  work: any[];
  education: any[];
}

export default function ExperienceList({ work, education }: ExperienceListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExperience, setDeletingExperience] = useState<any>(null);

  const handleAdd = () => {
    setEditingExperience(null);
    setIsFormOpen(true);
  };

  const handleEdit = (exp: any) => {
    setEditingExperience(exp);
    setIsFormOpen(true);
  };

  const handleDelete = (exp: any) => {
    setDeletingExperience(exp);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingExperience) {
      await deleteExperience(deletingExperience.id);
      setDeletingExperience(null);
      setIsDeleteOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(date));
  };

  const renderTimeline = (items: any[], type: 'WORK' | 'EDUCATION') => {
    if (items.length === 0) {
      return (
        <div className="py-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <p className="text-zinc-500 text-sm">Belum ada riwayat {type === 'WORK' ? 'pekerjaan' : 'pendidikan'} terdaftar.</p>
        </div>
      );
    }

    return (
      <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-zinc-800/80">
        {items.map((rawExp, index) => {
          const exp = resolveExperience(rawExp, 'id') || rawExp;
          const isCurrent = rawExp.endDate === null;
          const hasId = rawExp.translations?.some((t: any) => t.locale === 'id');
          const hasEn = rawExp.translations?.some((t: any) => t.locale === 'en');
          
          return (
            <div key={rawExp.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-1.5 flex items-center justify-center">
                {isCurrent ? (
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-black"></span>
                  </div>
                ) : (
                  <div className="h-3 w-3 rounded-full bg-zinc-700 border-2 border-black group-hover:bg-zinc-500 transition-colors" />
                )}
              </div>

              {/* Content Card */}
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/80 hover:border-zinc-700 transition-all group-hover:shadow-lg group-hover:-translate-y-0.5 relative">
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(rawExp)}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rawExp)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pr-16">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">{exp.title}</h3>
                    <div className="inline-flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${hasId ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-500'}`}>
                        ID
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${hasEn ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'}`}>
                        EN {hasEn ? '' : '(Belum)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm font-medium mt-0.5 flex items-center gap-2">
                    {rawExp.institution}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-mono text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(rawExp.startDate)}</span>
                    <span className="text-zinc-700">—</span>
                    {isCurrent ? (
                      <span className="text-white bg-white/10 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,255,255,0.1)]">Sekarang (Present)</span>
                    ) : (
                      <span>{formatDate(rawExp.endDate)}</span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="mt-4 text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Riwayat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
        
        {/* Work Timeline */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="p-2 bg-zinc-900 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Pengalaman Kerja</h2>
          </div>
          {renderTimeline(work, 'WORK')}
        </div>

        {/* Education Timeline */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="p-2 bg-zinc-900 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Pendidikan</h2>
          </div>
          {renderTimeline(education, 'EDUCATION')}
        </div>

      </div>

      <ExperienceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        experience={editingExperience}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Riwayat"
        description={`Konfirmasi penghapusan riwayat "${deletingExperience?.translations?.[0]?.title || deletingExperience?.title}" di ${deletingExperience?.institution}. Data dan translasi akan dihapus secara permanen.`}
      />
    </div>
  );
}
