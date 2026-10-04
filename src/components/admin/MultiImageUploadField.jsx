import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, Plus, ArrowUp, ArrowDown, Star, Check } from 'lucide-react';
import { api } from '../../services/api.js';

export function MultiImageUploadField({
  images = [],
  onChange,
  label = 'Product Gallery Images',
  maxImages = 10,
  recommendedSize = 'Recommended: 1200 x 1600px portrait (JPG, PNG, WEBP)'
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilesSelect = async (files) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const res = await api.uploadMultipleImages(files);
      if (res.success && res.urls && res.urls.length > 0) {
        onChange([...images, ...res.urls].slice(0, maxImages));
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload multiple images:', err);
      // Fallback base64 conversion
      const newUrls = [];
      for (const file of Array.from(files)) {
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            newUrls.push(e.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      onChange([...images, ...newUrls].slice(0, maxImages));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleSetMain = (index) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    onChange([target, ...remaining]);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
            {label} ({images.length} / {maxImages})
          </label>
          <p className="text-[11px] text-neutral-500">{recommendedSize}</p>
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Add More Photos</span>
          </button>
        )}
      </div>

      {/* Grid of Existing Photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden border bg-white group shadow-2xs ${
                idx === 0 ? 'border-brand-maroon ring-2 ring-brand-maroon/30' : 'border-neutral-200'
              }`}
            >
              <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover object-top" />

              {/* Main Photo Badge */}
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-brand-maroon text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase">
                  Cover / Main
                </span>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-white">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(idx)}
                    className="w-full py-1 bg-white/90 hover:bg-white text-neutral-900 rounded text-[10px] font-bold shadow cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Set Main</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="w-full py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold shadow cursor-pointer flex items-center justify-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}

          {/* Quick Add Tile */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white flex flex-col items-center justify-center p-3 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-brand-maroon" />
              ) : (
                <Plus className="w-5 h-5 mb-1 text-neutral-400" />
              )}
              <span className="text-[11px] font-bold">Upload Photo</span>
            </button>
          )}
        </div>
      )}

      {/* Main Drag and Drop Zone if empty */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-maroon bg-brand-maroon/5 ring-4 ring-brand-maroon/10'
              : 'border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 shadow-2xs'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-neutral-100 rounded-full text-neutral-600">
              {uploading ? (
                <Loader2 className="w-7 h-7 animate-spin text-brand-maroon" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">
                {uploading ? 'Uploading photos...' : 'Click to select multiple product photos'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                or drag and drop multiple images at once (up to 10 photos)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Multiple File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelect(e.target.files);
          }
        }}
      />

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
