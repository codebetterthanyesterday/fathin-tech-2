'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, User } from 'lucide-react';
import { deleteTestimonial, toggleTestimonialVisibility, moveTestimonialOrder, reorderTestimonials } from '@/app/actions/testimonial';
import DeleteConfirmModal from '@/components/admin/skills/delete-confirm-modal';
import TestimonialFormModal from './testimonial-form-modal';
import Image from 'next/image';
import { resolveTestimonial } from '@/lib/translations';
import {
  ReorderableList,
  useReorderableItem,
  ReorderableDragHandle,
  ReorderableFallbackControls,
} from '@/components/admin/shared/reorderable-list';

function TestimonialRow({
  rawTestimonial,
  isFirst,
  isLast,
  onMove,
  onToggleVisibility,
  onEdit,
  onDelete,
  isProcessingId,
  isDragOverlay = false,
}: {
  rawTestimonial: any;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onToggleVisibility: (id: string, currentVisible: boolean) => void;
  onEdit: (t: any) => void;
  onDelete: (t: any) => void;
  isProcessingId: string | null;
  isDragOverlay?: boolean;
}) {
  const [isPending] = useTransition();
  const { attributes, listeners, setNodeRef, style, isDragging } = useReorderableItem(rawTestimonial.id);

  const testimonial = resolveTestimonial(rawTestimonial, 'id') || rawTestimonial;
  const hasId = rawTestimonial.translations?.some((t: any) => t.locale === 'id');
  const hasEn = rawTestimonial.translations?.some((t: any) => t.locale === 'en');
  const isProcessing = isProcessingId === rawTestimonial.id || isPending;

  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[120px] rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
        isDragOverlay
          ? 'bg-zinc-800 border-zinc-600 shadow-2xl scale-[1.02] z-50 relative'
          : rawTestimonial.isVisible
          ? 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700'
          : 'bg-zinc-900/20 border-zinc-800/30 opacity-60 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
        <div className="hidden sm:block">
          <ReorderableDragHandle
            attributes={isDragOverlay ? {} : attributes}
            listeners={isDragOverlay ? {} : listeners}
            isDragging={isDragging && !isDragOverlay}
          />
        </div>

        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700/50">
          {rawTestimonial.photoUrl ? (
            <Image
              src={rawTestimonial.photoUrl}
              alt={rawTestimonial.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <User className="w-6 h-6 text-zinc-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium truncate">{rawTestimonial.name}</h4>
            <div className="inline-flex items-center gap-1">
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                  hasId ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                ID
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                  hasEn
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                }`}
              >
                EN {hasEn ? '' : '(Belum)'}
              </span>
            </div>
          </div>
          {testimonial.role && <p className="text-sm text-zinc-400 truncate">{testimonial.role}</p>}
          <p className="text-sm text-zinc-500 mt-1 line-clamp-1 italic">"{testimonial.quote}"</p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 justify-end sm:flex-shrink-0 mt-4 sm:mt-0 border-t sm:border-t-0 border-zinc-800/50 pt-4 sm:pt-0">
        <div className="sm:hidden mr-auto">
          <ReorderableDragHandle
            attributes={isDragOverlay ? {} : attributes}
            listeners={isDragOverlay ? {} : listeners}
            isDragging={isDragging && !isDragOverlay}
          />
        </div>

        <ReorderableFallbackControls
          onMoveUp={() => onMove(rawTestimonial.id, 'up')}
          onMoveDown={() => onMove(rawTestimonial.id, 'down')}
          isFirst={isFirst}
          isLast={isLast}
          isProcessing={isProcessing}
        />
        
        <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>

        <button
          onClick={() => onToggleVisibility(rawTestimonial.id, rawTestimonial.isVisible)}
          disabled={isProcessing}
          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Toggle visibility"
          title={rawTestimonial.isVisible ? 'Sembunyikan' : 'Tampilkan'}
        >
          {rawTestimonial.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onEdit(rawTestimonial)}
          disabled={isProcessing}
          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Edit testimonial"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(rawTestimonial)}
          disabled={isProcessing}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          aria-label="Delete testimonial"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function TestimonialListClient({ initialTestimonials }: { initialTestimonials: any[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTestimonial, setDeletingTestimonial] = useState<any>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTestimonials(initialTestimonials);
  }, [initialTestimonials]);

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
      const idx = testimonials.findIndex((t) => t.id === id);
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

  const handleReorder = async (newItems: any[]) => {
    // Optimistic UI update
    setTestimonials(newItems);
    
    // Persist to DB
    const updates = newItems.map((item: any, index: number) => ({
      id: item.id,
      order: index,
    }));
    await reorderTestimonials(updates);
  };

  if (!isMounted) return null;

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
        <ReorderableList
          items={testimonials}
          onReorder={handleReorder}
          renderOverlay={(activeId) => {
            const activeItem = testimonials.find((t) => t.id === activeId);
            if (!activeItem) return null;
            return (
              <TestimonialRow
                rawTestimonial={activeItem}
                isFirst={false}
                isLast={false}
                onMove={() => {}}
                onToggleVisibility={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isProcessingId={null}
                isDragOverlay
              />
            );
          }}
        >
          {testimonials.map((rawTestimonial, index) => (
            <TestimonialRow
              key={rawTestimonial.id}
              rawTestimonial={rawTestimonial}
              isFirst={index === 0}
              isLast={index === testimonials.length - 1}
              onMove={handleMove}
              onToggleVisibility={handleToggleVisibility}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isProcessingId={isProcessingId}
            />
          ))}
        </ReorderableList>
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
