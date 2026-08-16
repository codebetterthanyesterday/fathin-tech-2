'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, User } from 'lucide-react';
import { deleteTestimonial, toggleTestimonialVisibility, moveTestimonialOrder } from '@/app/actions/testimonial';
import DeleteConfirmModal from '@/components/admin/skills/delete-confirm-modal';
import TestimonialFormModal from './testimonial-form-modal';
import Image from 'next/image';

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
        <h2 className="text-xl font-semibold">Endorsement Index</h2>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Entry
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center p-12 border border-zinc-800 border-dashed rounded-xl text-zinc-500">
          No entries found. Action required: Create an entry.
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                testimonial.isVisible ? 'bg-zinc-900/40 border-zinc-800/50' : 'bg-zinc-900/20 border-zinc-800/30 opacity-60'
              } hover:border-zinc-700`}
            >
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {testimonial.photoUrl ? (
                    <Image src={testimonial.photoUrl} alt={testimonial.name} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-6 h-6 text-zinc-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{testimonial.name}</h4>
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
                    onClick={() => handleMove(testimonial.id, 'up')}
                    disabled={index === 0 || isProcessingId === testimonial.id}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(testimonial.id, 'down')}
                    disabled={index === testimonials.length - 1 || isProcessingId === testimonial.id}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleVisibility(testimonial.id, testimonial.isVisible)}
                  disabled={isProcessingId === testimonial.id}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label="Toggle visibility"
                >
                  {testimonial.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(testimonial)}
                  disabled={isProcessingId === testimonial.id}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label="Edit testimonial"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial)}
                  disabled={isProcessingId === testimonial.id}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
        title="Delete Entry"
        description={`Confirm deletion of endorsement from "${deletingTestimonial?.name}". This action is irreversible.`}
      />
    </div>
  );
}
