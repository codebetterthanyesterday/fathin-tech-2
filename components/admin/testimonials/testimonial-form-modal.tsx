'use client';

import { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Loader2, Save } from 'lucide-react';
import { createTestimonial, updateTestimonial, TestimonialActionState } from '@/app/actions/testimonial';
import { uploadImage } from '@/app/actions/upload';
import Image from 'next/image';

export default function TestimonialFormModal({
  isOpen,
  onClose,
  testimonial,
}: {
  isOpen: boolean;
  onClose: () => void;
  testimonial?: any;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPhotoUrl(testimonial?.photoUrl || '');
      setError('');
    }
  }, [isOpen, testimonial]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);
    
    // Create local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPhotoUrl(localUrl);

    // Upload to Supabase
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadImage(formData);
    
    if (result.error) {
      setError(result.error);
      setPhotoUrl(testimonial?.photoUrl || ''); // Revert on failure
    } else if (result.url) {
      setPhotoUrl(result.url); // Set to actual public URL
    }
    
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('photoUrl', photoUrl);

    let res: TestimonialActionState;
    if (testimonial) {
      res = await updateTestimonial(testimonial.id, {}, formData);
    } else {
      res = await createTestimonial({}, formData);
    }

    setIsPending(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Area */}
          <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
            <div 
              className="relative w-20 h-20 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 group/avatar cursor-pointer flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity z-10">
                <UploadCloud className="text-white w-5 h-5" />
              </div>
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                </div>
              ) : null}
              {photoUrl ? (
                <Image 
                  src={photoUrl} 
                  alt="Photo Preview" 
                  width={80}
                  height={80}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-2">
                  No Photo
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-200">Author Photo</h3>
              <p className="text-xs text-zinc-500 mb-2 mt-1">Optional. Recommended: Square, less than 5MB.</p>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                Choose Image
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={testimonial?.name || ''}
                required
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/30"
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-zinc-300">Role / Company</label>
              <input
                id="role"
                name="role"
                type="text"
                defaultValue={testimonial?.role || ''}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/30"
                placeholder="CEO at TechCorp"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quote" className="block text-sm font-medium text-zinc-300">Quote *</label>
              <textarea
                id="quote"
                name="quote"
                required
                rows={5}
                defaultValue={testimonial?.quote || ''}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/30 resize-y"
                placeholder="Their recommendation..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isUploading}
              className="px-5 py-2.5 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {testimonial ? 'Save Changes' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
