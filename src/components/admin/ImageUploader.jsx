import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

const PRESET_IMAGES = [
  { label: 'Ponni Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Basmati Rice', url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Dal & Pulses', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cold-Pressed Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Spices & Maligai', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Idli Rice', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80' },
];

export const ImageUploader = ({
  value = '',
  onChange = () => {},
  aspectRatio = 'aspect-4/3',
  label = 'Product Image',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file size must be less than 8MB.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        try {
          const res = await api.uploadImage(base64, file.name);
          onChange(res.url || base64);
        } catch {
          // Fallback to data URI if upload server route is transient
          onChange(base64);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image file.');
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onChange(inputUrl.trim());
    setShowUrlInput(false);
    setInputUrl('');
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#16402A] uppercase tracking-wider font-heading">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {value ? (
        /* Image Preview Box with Consistent Crop */
        <div className="relative group rounded-2xl overflow-hidden border border-[#E0DBC8] bg-[#FAF8F2] shadow-xs">
          <div className={`w-full ${aspectRatio} relative overflow-hidden bg-gray-100`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-2xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white text-[#16402A] text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-emerald-50 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-rose-700 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <div className="p-2.5 bg-white border-t border-[#F0EBDD] flex items-center justify-between text-[11px] text-[#5A5A5A]">
            <span className="truncate max-w-[200px]">{value.slice(0, 40)}...</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Placeholder */
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#DFBA5C] hover:border-[#16402A] rounded-2xl p-6 bg-[#FAF8F2] hover:bg-white text-center cursor-pointer transition duration-200 flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E0DBC8] flex items-center justify-center text-[#205A3B] group-hover:scale-110 transition-transform shadow-xs">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-[#205A3B]/30 border-t-[#205A3B] rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-[#205A3B]" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#16402A]">
                {isUploading ? 'Uploading & Processing...' : 'Click to upload image'}
              </p>
              <p className="text-[11px] text-[#5A5A5A] mt-0.5">PNG, JPG, WebP up to 8MB</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs font-semibold text-[#205A3B] hover:text-[#16402A] flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste image link instead</span>
            </button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E0DBC8] bg-white focus:outline-none focus:border-[#205A3B]"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-1.5 rounded-xl bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {/* Quick Presets for Instant Grocery Testing */}
          <div className="pt-1">
            <span className="text-[10px] uppercase font-bold text-[#8A8A8A] tracking-wider block mb-1.5">
              Quick Harvest Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className="text-[11px] font-medium px-2 py-1 rounded-lg bg-white border border-[#E0DBC8] text-[#2B2B2B] hover:bg-emerald-50 hover:border-emerald-300 transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
