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
  FolderOpen,
  Camera,
  RefreshCw,
  Upload
} from 'lucide-react';
import { api, formatImageUrl } from '../../services/api.js';

export function ImageUploader({
  images,
  onChange,
  multiple = false,
  maxFiles = 8,
  label = '',
  helperText = '',
  aspectRatio = 'aspect-[16/7]',
  className = '',
  rounded = 'rounded-2xl',
  showLibraryButton = true,
  fallbackImage = '/banners/hero_banner_2.png'
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [localPreview, setLocalPreview] = useState(null);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Normalize image list
  const currentImages = (
    Array.isArray(images)
      ? images
      : typeof images === 'string' && images.trim().length > 0
      ? [images]
      : []
  ).filter((img) => typeof img === 'string' && img.trim().length > 0);

  const singleImageUrl = !multiple && currentImages.length > 0 ? currentImages[0] : '';
  const activeSingleDisplayUrl = localPreview || (singleImageUrl ? formatImageUrl(singleImageUrl) : '');

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processAndUploadFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processAndUploadFiles = async (files) => {
    setError('');
    setUploading(true);
    setUploadSuccess(false);

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
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2500);
        } else {
          setError(res.message || 'Failed to upload images');
        }
      } else {
        const file = files[0];
        // Create immediate preview
        const objectUrl = URL.createObjectURL(file);
        setLocalPreview(objectUrl);

        const res = await api.uploadImage(file);
        if (res.success && res.url) {
          onChange(res.url);
          setLocalPreview(null);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2500);
        } else {
          setError(res.message || 'Failed to upload image');
          setLocalPreview(null);
        }
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Image upload failed. Please check file format and try again.');
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSingle = (e) => {
    e.stopPropagation();
    setLocalPreview(null);
    onChange('');
  };

  const handleRemoveGalleryItem = (indexToRemove, e) => {
    e.stopPropagation();
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary, e) => {
    e.stopPropagation();
    if (indexToPrimary === 0) return;
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

  const openMediaLibrary = async (e) => {
    if (e) e.stopPropagation();
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
      setLocalPreview(null);
      onChange(mediaItem.url);
    }
    setShowMediaLibrary(false);
  };

  const triggerFileInput = (e) => {
    if (e) e.stopPropagation();
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ==========================================
  // SINGLE IMAGE MODE (Banners, Arches, Cards)
  // ==========================================
  if (!multiple) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={false}
          onChange={handleFileChange}
          className="hidden"
        />

        {label && (
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-800">{label}</span>
            {showLibraryButton && (
              <button
                type="button"
                onClick={openMediaLibrary}
                className="flex items-center space-x-1 text-[11px] font-semibold text-brand-maroon hover:underline cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>
            )}
          </div>
        )}

        {/* Interactive Single Preview Canvas */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`group relative w-full ${aspectRatio} ${rounded} overflow-hidden border-2 transition-all duration-200 bg-neutral-900 shadow-2xs cursor-pointer select-none ${
            isDragging
              ? 'border-brand-maroon ring-4 ring-brand-maroon/20 scale-[1.01]'
              : 'border-neutral-200/90 hover:border-neutral-400'
          }`}
        >
          {activeSingleDisplayUrl ? (
            <>
              <img
                src={activeSingleDisplayUrl}
                alt="Banner Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage || '/banners/hero_banner_2.png';
                }}
              />

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-3.5 py-1.5 rounded-full bg-white text-neutral-900 text-xs font-bold shadow-lg flex items-center space-x-1.5 hover:bg-neutral-100 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Change Image</span>
                  </button>
                  {showLibraryButton && (
                    <button
                      type="button"
                      onClick={openMediaLibrary}
                      className="px-3.5 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-white text-xs font-semibold shadow-lg flex items-center space-x-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Library</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-neutral-200 font-medium">
                  Click or drag a new image file from your device
                </p>
              </div>

              {/* Top-Right Quick Action Badges */}
              <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-10">
                {uploadSuccess && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-md animate-fadeIn">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Saved in SQL</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewModalImg(activeSingleDisplayUrl);
                  }}
                  title="View Full Resolution"
                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveSingle}
                  title="Remove Image"
                  className="w-7 h-7 rounded-full bg-red-600/85 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Empty Dropzone State */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F2] space-y-2.5 border border-dashed border-neutral-300 rounded-2xl hover:bg-[#F5EFEB] transition-colors">
              <div className="w-11 h-11 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center shadow-2xs">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-800">
                  {uploading ? 'Uploading to SQL Database...' : 'Click to Upload Image'}
                </p>
                <p className="text-[11px] text-neutral-500">Drag & drop or browse from device</p>
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] font-bold shadow-xs hover:bg-neutral-800 cursor-pointer"
              >
                Select Image File
              </button>
            </div>
          )}

          {/* Uploading Spinner Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
              <p className="text-xs font-bold tracking-wide">Saving to SQL Database...</p>
            </div>
          )}
        </div>

        {helperText && <p className="text-[11px] text-neutral-500 font-normal">{helperText}</p>}
        {error && (
          <div className="flex items-center space-x-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal: Full Resolution Preview */}
        {previewModalImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
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

        {/* Modal: SQL Media Library */}
        {showMediaLibrary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-900">SQL Database Media Library</h3>
                  <p className="text-xs text-neutral-500">Pick any previously uploaded image from your database.</p>
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
                    <p>No images uploaded yet in SQL database.</p>
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
                          src={formatImageUrl(m.url)}
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

  // ==========================================
  // MULTIPLE IMAGES MODE (Product Photo Gallery)
  // ==========================================
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={true}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
            {label || 'Product Photos (Direct SQL Database Upload)'} ({currentImages.length}/{maxFiles})
          </label>
          {helperText && <p className="text-[11px] text-neutral-500 mt-0.5">{helperText}</p>}
        </div>
        <button
          type="button"
          onClick={openMediaLibrary}
          className="flex items-center space-x-1 text-[11px] font-semibold text-brand-maroon hover:underline cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Browse Media Library</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Uploaded Images + Add Photo Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {currentImages.map((url, idx) => {
          const isPrimary = idx === 0;
          return (
            <div
              key={`${url}-${idx}`}
              className={`group relative rounded-xl overflow-hidden border bg-white shadow-2xs transition-all ${
                isPrimary ? 'border-brand-maroon ring-2 ring-brand-maroon/30' : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="relative w-full aspect-[3/4] bg-neutral-100">
                <img
                  src={formatImageUrl(url)}
                  alt={`Product view ${idx + 1}`}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/oct9-logo.jpg';
                  }}
                />

                {/* Primary Cover Badge */}
                {isPrimary && (
                  <span className="absolute top-1.5 left-1.5 bg-[#5A1827] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    Cover Photo
                  </span>
                )}

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewModalImg(formatImageUrl(url))}
                    title="View Full Size"
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {!isPrimary && (
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
                    onClick={(e) => handleRemoveGalleryItem(idx, e)}
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

        {/* Add More Photos Slot */}
        {currentImages.length < maxFiles && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-brand-maroon bg-brand-maroon/5 scale-102'
                : 'border-neutral-300 hover:border-neutral-500 bg-[#FAF7F2] hover:bg-[#F5EFEB]'
            } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-1.5">
                <Loader2 className="w-6 h-6 text-brand-maroon animate-spin" />
                <span className="text-[10px] font-bold text-neutral-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1.5 text-neutral-600">
                <div className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center shadow-2xs">
                  <Plus className="w-4 h-4 text-neutral-800" />
                </div>
                <span className="text-[11px] font-bold text-neutral-800">Add Photo</span>
                <span className="text-[9px] text-neutral-400">or drop here</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Full Resolution Preview */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
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

      {/* Modal: SQL Media Library */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">SQL Database Media Library</h3>
                <p className="text-xs text-neutral-500">Pick any previously uploaded image from your database.</p>
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
                  <p>No images uploaded yet in SQL database.</p>
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
                        src={formatImageUrl(m.url)}
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
