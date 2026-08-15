'use client';

import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { UploadCloud, X, Loader2, GripVertical } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';

export interface ProjectImage {
  id?: string;
  url: string;
  altText?: string;
}

interface ImageGalleryProps {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
}

export default function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    setUploadError('');

    const newImages = [...images];
    
    // Upload files sequentially or with Promise.all. 
    // Promise.all is faster but might fail if many files. We'll use Promise.all for now.
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadImage(formData);
        if (res.error) throw new Error(res.error);
        return { url: res.url as string, altText: file.name };
      });

      const results = await Promise.all(uploadPromises);
      onChange([...newImages, ...results]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

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
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      {/* Upload Area */}
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${
          isUploading ? 'border-zinc-800 bg-zinc-900/50 cursor-not-allowed' : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          multiple
          className="hidden" 
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-4" />
            <p className="text-zinc-400 font-medium text-sm">Uploading images...</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-zinc-500 mb-4" />
            <p className="text-zinc-300 font-medium">Click to upload images</p>
            <p className="text-zinc-500 text-sm mt-1">You can select multiple files at once</p>
          </>
        )}
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
                  <Draggable key={img.url} draggableId={img.url} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-start sm:items-center gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg transition-all ${
                          snapshot.isDragging ? 'shadow-2xl ring-1 ring-white/20 z-50' : ''
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="p-2 text-zinc-600 hover:text-zinc-300 cursor-grab">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="w-20 h-20 bg-black rounded overflow-hidden flex-shrink-0 relative border border-zinc-800">
                          <img src={img.url} alt={img.altText || 'Project preview'} className="object-cover w-full h-full" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Alt Text (Accessiblity)</label>
                          <input 
                            type="text" 
                            value={img.altText || ''}
                            onChange={(e) => updateAltText(index, e.target.value)}
                            placeholder="Describe this image..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors self-center"
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
