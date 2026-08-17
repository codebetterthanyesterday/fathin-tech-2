'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { UploadCloud, X, Loader2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';

export interface ProjectImage {
  id?: string;
  url: string;
  altText?: string;
  isUploading?: boolean; // Optimistic state
}

interface ImageGalleryProps {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;

    setUploadError('');
    
    // Client-side validation
    const validFiles = files.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError('Only JPG, PNG, and WebP are allowed.');
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File ${file.name} is too large (max 5MB).`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    // Create optimistic previews
    const optimisticImages: ProjectImage[] = validFiles.map(file => ({
      url: URL.createObjectURL(file), // temporary local URL
      altText: file.name,
      isUploading: true,
    }));

    // Update state to show optimistic previews immediately
    onChange([...images, ...optimisticImages]);

    try {
      const uploadPromises = validFiles.map(async (file, idx) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadImage(formData);
        if (res.error) throw new Error(res.error);
        return { 
          originalLocalUrl: optimisticImages[idx].url, 
          finalUrl: res.url as string, 
          altText: file.name 
        };
      });

      const results = await Promise.allSettled(uploadPromises);
      
      // Update the main images array by replacing optimistic ones with final ones
      const newImages = [...images];
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          // Push final image
          newImages.push({
            url: result.value.finalUrl,
            altText: result.value.altText
          });
        }
      });
      
      onChange(newImages);

      // Clean up object URLs to avoid memory leaks
      optimisticImages.forEach(img => URL.revokeObjectURL(img.url));

    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload some images');
      // Revert optimistic ones by only keeping the original images
      onChange([...images]); 
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [images]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onChange(items);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const updateAltText = (index: number, text: string) => {
    const newImages = [...images];
    newImages[index].altText = text;
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {uploadError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm animate-in fade-in">
          {uploadError}
        </div>
      )}

      {/* Upload Area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isDragActive 
            ? 'border-white bg-zinc-800/80 scale-[1.01]' 
            : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/jpeg, image/png, image/webp" 
          multiple
          className="hidden" 
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
        <UploadCloud className={`w-8 h-8 mb-4 transition-colors ${isDragActive ? 'text-white' : 'text-zinc-500'}`} />
        <p className="text-zinc-300 font-medium">Drag & drop images here, or click to select</p>
        <p className="text-zinc-500 text-sm mt-1">PNG, JPG, WebP up to 5MB</p>
      </div>

      {/* Gallery */}
      {isMounted && images.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="gallery" direction="vertical">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-3 mt-4"
              >
                {images.map((img, index) => (
                  <Draggable key={img.url + index} draggableId={img.url + index} index={index} isDragDisabled={img.isUploading}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-start sm:items-center gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg transition-all ${
                          snapshot.isDragging ? 'shadow-2xl ring-1 ring-white/20 z-50' : ''
                        } ${img.isUploading ? 'opacity-70 grayscale' : ''}`}
                      >
                        <div {...provided.dragHandleProps} className={`p-2 cursor-grab ${img.isUploading ? 'invisible' : 'text-zinc-600 hover:text-zinc-300'}`}>
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="w-20 h-20 bg-black rounded overflow-hidden flex-shrink-0 relative border border-zinc-800 flex items-center justify-center">
                          {img.isUploading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          ) : null}
                          <img src={img.url} alt={img.altText || 'Project preview'} className="object-cover w-full h-full" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Alt Text</label>
                          <input 
                            type="text" 
                            value={img.altText || ''}
                            onChange={(e) => updateAltText(index, e.target.value)}
                            disabled={img.isUploading}
                            placeholder="Describe this image..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={img.isUploading}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors self-center disabled:opacity-50"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
