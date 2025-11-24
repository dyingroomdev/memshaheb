'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, Copy, Check } from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface MediaFile {
  id: number;
  filename: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_at: string;
}

interface MediaGalleryProps {
  onSelect?: (file: MediaFile) => void;
  className?: string;
}

export function MediaGallery({ onSelect, className = "" }: MediaGalleryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/media`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data: MediaFile[] = await response.json();
        setFiles(data);
      } else if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const deleteFile = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/media/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className={`bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 ${className}`}>
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-ink">Media Library</h3>
        <span className="text-sm text-muted">{files.length} files</span>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No media files uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => onSelect?.(file)}
            >
              {(file.mime_type ?? '').startsWith('image/') ? (
                <img
                  src={file.file_url}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyUrl(file.file_url);
                  }}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl === file.file_url ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>

              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs text-white truncate">{file.filename}</p>
                <p className="text-xs text-white/70">{formatFileSize(file.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
