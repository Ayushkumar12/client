import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, Check, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { api } from '../../services/api.js';

export function ImageUploadField({
  value,
  onChange,
  label = 'Image',
  placeholder = 'Select image file',
  aspectRatio = 'aspect-[4/3]',
  recommendedSize = 'Recommended: 1200 x 1500px (JPG, PNG, WEBP)',
  helperText = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP, SVG)');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      // Fallback: create local base64 data URI so user is never blocked
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-neutral-500 hover:text-brand-maroon flex items-center space-x-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Switch to File Upload' : 'Paste URL instead'}</span>
          </button>
        </div>
      )}

      {showUrlInput ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... or /uploads/..."
            className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          />
          {value && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            /* Uploaded Image Preview & Replace Zone */
            <div className="relative rounded-2xl border border-neutral-300 bg-neutral-50 overflow-hidden group shadow-2xs">
              <div className={`relative w-full ${aspectRatio} max-h-56 bg-neutral-900/5 flex items-center justify-center overflow-hidden`}>
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover object-center"
                />

                {/* Hover Overlay with Action Buttons */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2.5 p-4 text-white">
                  <p className="text-xs font-bold text-center truncate max-w-full px-2">{value.split('/').pop() || 'Image'}</p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-3.5 py-1.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      {uploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>Change File</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Info Bar */}
              <div className="p-2.5 bg-white flex items-center justify-between border-t border-neutral-200 text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-mono text-[11px] text-neutral-600 truncate">{value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-brand-maroon hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Upload New
                </button>
              </div>
            </div>
          ) : (
            /* Empty Drag & Drop File Upload Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-brand-maroon bg-brand-maroon/5 ring-4 ring-brand-maroon/10 scale-[1.01]'
                  : 'border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50/80 shadow-2xs'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className={`p-3 rounded-full ${dragOver ? 'bg-brand-maroon text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-brand-maroon" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    {uploading ? 'Uploading image...' : 'Click to upload image file'}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    or drag and drop here from your computer
                  </p>
                </div>

                <div className="inline-flex items-center px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-medium">
                  {recommendedSize}
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/avif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}

      {helperText && (
        <p className="text-[11px] text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
