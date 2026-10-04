import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Star,
  Eye,
  X,
  FolderOpen
} from 'lucide-react';
import { api } from '../../services/api.js';

export function ImageUploader({
  images = [],
  onChange,
  multiple = true,
  maxFiles = 10,
  label = 'Upload Image(s)',
  helperText = 'PNG, JPG, WebP, AVIF up to 25MB. Files are saved directly to SQL Database.',
  aspectRatio = 'aspect-[3/4]',
  className = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Normalize images array
  const currentImages = Array.isArray(images)
    ? images
    : images
    ? [images]
    : [];

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processAndUploadFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processAndUploadFiles = async (files) => {
    setError('');
    setUploading(true);

    try {
      if (multiple) {
        const fileArray = Array.from(files);
        if (currentImages.length + fileArray.length > maxFiles) {
          setError(`You can upload a maximum of ${maxFiles} images.`);
          setUploading(false);
          return;
        }

        const res = await api.uploadMultipleImages(fileArray);
        if (res.success && res.urls) {
          const updated = [...currentImages, ...res.urls];
          onChange(updated);
        } else {
          setError(res.message || 'Failed to upload images');
        }
      } else {
        const file = files[0];
        const res = await api.uploadImage(file);
        if (res.success && res.url) {
          onChange(res.url);
        } else {
          setError(res.message || 'Failed to upload image');
        }
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (indexToRemove, e) => {
    e.stopPropagation();
    if (multiple) {
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const handleSetPrimary = (indexToPrimary, e) => {
    e.stopPropagation();
    if (!multiple || indexToPrimary === 0) return;
    const selected = currentImages[indexToPrimary];
    const rest = currentImages.filter((_, idx) => idx !== indexToPrimary);
    onChange([selected, ...rest]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processAndUploadFiles(e.dataTransfer.files);
    }
  };

  const openMediaLibrary = async () => {
    setShowMediaLibrary(true);
    setLoadingMedia(true);
    try {
      const res = await api.getMediaLibrary({ limit: 40 });
      if (res.success) {
        setMediaList(res.media || []);
      }
    } catch (e) {
      console.error('Failed to load media library:', e);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSelectFromLibrary = (mediaItem) => {
    if (multiple) {
      if (!currentImages.includes(mediaItem.url)) {
        onChange([...currentImages, mediaItem.url]);
      }
    } else {
      onChange(mediaItem.url);
    }
    setShowMediaLibrary(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
            {label} {multiple && currentImages.length > 0 && `(${currentImages.length}/${maxFiles})`}
          </label>
          <button
            type="button"
            onClick={openMediaLibrary}
            className="flex items-center space-x-1 text-[11px] font-semibold text-brand-maroon hover:underline cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Browse Media Library</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-brand-maroon bg-brand-maroon/5 scale-[1.01]'
            : 'border-neutral-300 hover:border-neutral-500 bg-[#FAF7F2]/50 hover:bg-[#FAF7F2]'
        } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center shadow-2xs">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-neutral-900">
              {uploading ? 'Uploading to SQL Database...' : 'Click to Upload or Drag & Drop Image Files'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">{helperText}</p>
          </div>

          <button
            type="button"
            className="px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold shadow-xs transition-all pointer-events-none"
          >
            {multiple ? 'Select Images from Device' : 'Select Image from Device'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Images Preview Grid */}
      {currentImages.length > 0 && (
        <div className="pt-2">
          <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-2">
            Uploaded Preview (Stored in SQL Database):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentImages.map((url, idx) => {
              const isPrimary = idx === 0;
              return (
                <div
                  key={`${url}-${idx}`}
                  className={`group relative rounded-xl overflow-hidden border bg-white shadow-2xs transition-all ${
                    isPrimary ? 'border-brand-maroon ring-2 ring-brand-maroon/30' : 'border-neutral-200'
                  }`}
                >
                  <div className={`relative w-full ${aspectRatio} bg-neutral-100`}>
                    <img
                      src={url}
                      alt={`Uploaded image ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />

                    {/* Primary Badge */}
                    {isPrimary && multiple && (
                      <span className="absolute top-1.5 left-1.5 bg-[#5A1827] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Cover Photo
                      </span>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalImg(url);
                        }}
                        title="View Full Size"
                        className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {multiple && !isPrimary && (
                        <button
                          type="button"
                          onClick={(e) => handleSetPrimary(idx, e)}
                          title="Set as Cover Photo"
                          className="w-7 h-7 rounded-full bg-white/90 hover:bg-amber-400 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleRemove(idx, e)}
                        title="Delete Image"
                        className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewModalImg}
              alt="Preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Media Library Selector Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">SQL Database Media Library</h3>
                <p className="text-xs text-neutral-500">Select any previously uploaded image from the database.</p>
              </div>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="text-neutral-500 hover:text-black text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingMedia ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
                </div>
              ) : mediaList.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto text-neutral-400" />
                  <p>No media files uploaded yet in the SQL database.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {mediaList.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectFromLibrary(m)}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-200 hover:border-brand-maroon hover:ring-2 hover:ring-brand-maroon/30 transition-all cursor-pointer bg-neutral-100"
                    >
                      <img
                        src={m.url}
                        alt={m.original_name}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate font-medium">{m.original_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-3 flex justify-end">
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
