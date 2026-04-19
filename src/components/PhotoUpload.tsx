'use client';
import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import Button from './Button';

interface PhotoUploadProps {
  onFile: (file: File) => void;
  preview?: string;
  onClear?: () => void;
}

export default function PhotoUpload({ onFile, preview, onClear }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(preview || null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLocalPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleClear() {
    setLocalPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear?.();
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="label">Player Photo</label>
      <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-brand-400 transition cursor-pointer bg-brand-50/50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 w-full"
        >
          {localPreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={localPreview} alt="preview" className="w-24 h-24 rounded-lg object-cover" />
              {onClear && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <>
              <Upload size={24} className="text-brand-600" />
              <div className="text-sm font-medium text-brand-700">Click to upload photo</div>
              <div className="text-xs text-slate-500">JPG, PNG (max 5MB)</div>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
