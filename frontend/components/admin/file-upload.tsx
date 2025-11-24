'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, File, Check } from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface MediaFile {
  id: number;
  filename: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
}

interface FileUploadProps {
  onUpload?: (file: MediaFile) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ 
  onUpload, 
  accept = "image/*", 
  maxSize = 10 * 1024 * 1024,
  className = ""
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize) {
      alert(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        setUploadedFile(uploadedFile);
        onUpload?.(uploadedFile);
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedFile) {
    const showImage = (uploadedFile.mime_type ?? '').startsWith('image/');
    const checker =
      'linear-gradient(45deg,rgba(255,255,255,0.08) 25%,transparent 25%,transparent 75%,rgba(255,255,255,0.08) 75%,rgba(255,255,255,0.08)),' +
      'linear-gradient(45deg,rgba(255,255,255,0.08) 25%,transparent 25%,transparent 75%,rgba(255,255,255,0.08) 75%,rgba(255,255,255,0.08))';

    return (
      <div className={`relative rounded-2xl border border-green-500/30 bg-green-500/10 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
            <Check className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{uploadedFile.filename}</p>
            <p className="text-xs text-muted">
              {uploadedFile.file_size ? `${Math.round(uploadedFile.file_size / 1024)} KB` : 'Size unavailable'} • Uploaded successfully
            </p>
          </div>
          <button
            onClick={clearFile}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>
        {showImage && (
          <div
            className="mt-3 rounded-xl overflow-hidden border border-white/10"
            style={{
              backgroundImage: checker,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 8px 8px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={uploadedFile.file_url} 
              alt={uploadedFile.filename}
              className="w-full h-32 object-contain bg-transparent"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed transition-colors ${
        dragOver 
          ? 'border-accent bg-accent/10' 
          : 'border-white/20 hover:border-white/30'
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      
      <div className="p-8 text-center">
        {uploading ? (
          <div className="space-y-3">
            <div className="h-12 w-12 mx-auto rounded-xl bg-accent/20 flex items-center justify-center">
              <Upload className="h-6 w-6 text-accent animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Uploading...</p>
              <p className="text-xs text-muted">Processing your file</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-12 w-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
              {accept.includes('image') ? (
                <ImageIcon className="h-6 w-6 text-muted" />
              ) : (
                <File className="h-6 w-6 text-muted" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted">
                Max {Math.round(maxSize / 1024 / 1024)}MB • {accept}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
