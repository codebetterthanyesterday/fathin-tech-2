'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, User } from 'lucide-react';
import { deleteTestimonial, toggleTestimonialVisibility, moveTestimonialOrder } from '@/app/actions/testimonial';
import DeleteConfirmModal from '@/components/admin/skills/delete-confirm-modal';
import TestimonialFormModal from './testimonial-form-modal';
import Image from 'next/image';
import { resolveTestimonial } from '@/lib/translations';

export default function TestimonialListClient({ initialTestimonials }: { initialTestimonials: any[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTestimonial, setDeletingTestimonial] = useState<any>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const handleDelete = (testimonial: any) => {
    setDeletingTestimonial(testimonial);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingTestimonial) {
      await deleteTestimonial(deletingTestimonial.id);
      setTestimonials(testimonials.filter((t) => t.id !== deletingTestimonial.id));
      setDeletingTestimonial(null);
      setIsDeleteOpen(false);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    setIsProcessingId(id);
    const res = await toggleTestimonialVisibility(id, !currentVisible);
    if (res.success) {
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, isVisible: !currentVisible } : t));
    }
    setIsProcessingId(null);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    setIsProcessingId(id);
    const res = await moveTestimonialOrder(id, direction);
    if (res.success) {
      const idx = testimonials.findIndex(t => t.id === id);
      const newItems = [...testimonials];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      
      if (swapIdx >= 0 && swapIdx < newItems.length) {
        const temp = newItems[idx];
        newItems[idx] = newItems[swapIdx];
        newItems[swapIdx] = temp;
        setTestimonials(newItems);
      }
    }
    setIsProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Daftar Testimoni & Rekomendasi</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Kelola ulasan dan endorsement dari klien atau rekan kerja.</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Testimoni
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center p-12 border border-zinc-800 border-dashed rounded-xl text-zinc-500">
          Belum ada testimoni yang terdaftar.
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((rawTestimonial, index) => {
            const testimonial = resolveTestimonial(rawTestimonial, 'id') || rawTestimonial;
            const hasId = rawTestimonial.translations?.some((t: any) => t.locale === 'id');
            const hasEn = rawTestimonial.translations?.some((t: any) => t.locale === 'en');

            return (
              <div
                key={rawTestimonial.id}
                className={`flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  rawTestimonial.isVisible ? 'bg-zinc-900/40 border-zinc-800/50' : 'bg-zinc-900/20 border-zinc-800/30 opacity-60'
                } hover:border-zinc-700`}
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {rawTestimonial.photoUrl ? (
                      <Image src={rawTestimonial.photoUrl} alt={rawTestimonial.name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium truncate">{rawTestimonial.name}</h4>
                      <div className="inline-flex items-center gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${hasId ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-500'}`}>
                          ID
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${hasEn ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'}`}>
                          EN {hasEn ? '' : '(Belum)'}
                        </span>
                      </div>
                    </div>
                    {testimonial.role && (
                      <p className="text-sm text-zinc-400 truncate">{testimonial.role}</p>
                    )}
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1 italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end sm:flex-shrink-0">
                  {/* Reorder Buttons */}
                  <div className="flex items-center bg-zinc-900 rounded-lg p-1 mr-2 border border-zinc-800/80">
                    <button
                      onClick={() => handleMove(rawTestimonial.id, 'up')}
                      disabled={index === 0 || isProcessingId === rawTestimonial.id}
                      className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                      title="Pindah ke atas"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(rawTestimonial.id, 'down')}
                      disabled={index === testimonials.length - 1 || isProcessingId === rawTestimonial.id}
                      className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                      title="Pindah ke bawah"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleVisibility(rawTestimonial.id, rawTestimonial.isVisible)}
                    disabled={isProcessingId === rawTestimonial.id}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    aria-label="Toggle visibility"
                    title={rawTestimonial.isVisible ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {rawTestimonial.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(rawTestimonial)}
                    disabled={isProcessingId === rawTestimonial.id}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    aria-label="Edit testimonial"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rawTestimonial)}
                    disabled={isProcessingId === rawTestimonial.id}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    aria-label="Delete testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TestimonialFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        testimonial={editingTestimonial} 
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Testimoni"
        description={`Konfirmasi penghapusan testimoni dari "${deletingTestimonial?.name}". Data dan translasi akan dihapus secara permanen.`}
      />
    </div>
  );
}
