'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';

export interface UploadedFileItem {
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'document';
  file_size: number;
}

interface FileUploaderProps {
  files: UploadedFileItem[];
  onChangeFiles: (files: UploadedFileItem[]) => void;
  maxFiles?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onChangeFiles,
  maxFiles = 4,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);

    const availableSlots = maxFiles - files.length;
    if (fileList.length > availableSlots) {
      setError(`Maksimal hanya dapat melampirkan ${maxFiles} berkas bukti.`);
      return;
    }

    Array.from(fileList).forEach((file) => {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setError(`Berkas "${file.name}" melebihi batas 10MB.`);
        return;
      }

      let type: 'image' | 'video' | 'document' = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      const reader = new FileReader();
      reader.onload = (e) => {
        const resultUrl = e.target?.result as string;
        onChangeFiles([
          ...files,
          {
            file_name: file.name,
            file_url: resultUrl,
            file_type: type,
            file_size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    onChangeFiles(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Bukti Foto / Video / Dokumen (Opsional)
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {files.length}/{maxFiles} berkas (Maks 10MB)
        </span>
      </div>

      {files.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf"
            onChange={(e) => processFiles(e.target.files)}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-2">
            <Upload className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            Klik untuk memilih berkas atau seret ke sini
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Mendukung Foto (JPG, PNG), Video (MP4), dan Dokumen PDF
          </p>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview items */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl border border-slate-200 overflow-hidden bg-white p-2 flex flex-col items-center text-center shadow-2xs"
            >
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-md transition-colors"
                title="Hapus lampiran"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center mb-1.5">
                {file.file_type === 'image' ? (
                  <img
                    src={file.file_url}
                    alt={file.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : file.file_type === 'video' ? (
                  <Video className="w-8 h-8 text-sky-600" />
                ) : (
                  <FileText className="w-8 h-8 text-amber-600" />
                )}
              </div>

              <span className="text-[11px] font-medium text-slate-800 truncate w-full">
                {file.file_name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {(file.file_size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
