'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Upload, Image, Tag, Calendar, Eye } from 'lucide-react';
import { RichEditor } from '@/components/admin/rich-editor';
import { FileUpload } from '@/components/admin/file-upload';

import { API_BASE_URL } from '@/lib/config';

// Custom Quill styles for dark theme
const quillStyles = `
  .ql-editor {
    color: #e5e7eb !important;
    background: transparent !important;
  }
  .ql-toolbar {
    border-color: rgba(255, 255, 255, 0.1) !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }
  .ql-container {
    border-color: rgba(255, 255, 255, 0.1) !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = quillStyles;
  document.head.appendChild(style);
}

interface BlogPost {
  id: number;
  title: string;
  content_md: string;
  cover_url?: string;
  excerpt?: string;
  tags?: string[];
  published_at?: string;
}

export default function EditBlogPost() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/blogs/preview/${params.id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPost(data);
        }
      } catch (error) {
        console.error('Failed to fetch blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const handleSave = () => {
    if (!post) return;
    
    setSaving(true);
    
    // Save to localStorage as backup
    localStorage.setItem(`blog_draft_${post.id}`, JSON.stringify(post));
    
    setTimeout(() => {
      setSaving(false);
      alert('Post saved locally!');
    }, 500);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const url = data.file_url ?? data.url;
        if (url) {
          setPost(prev => prev ? {...prev, cover_url: url} : null);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = () => {
    if (!post) return;
    
    setSaving(true);
    
    // Save to localStorage and mark as published
    const publishedPost = { ...post, published_at: new Date().toISOString() };
    localStorage.setItem(`blog_draft_${post.id}`, JSON.stringify(publishedPost));
    setPost(publishedPost);
    
    setTimeout(() => {
      setSaving(false);
      alert('Post published locally!');
    }, 500);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-white/5 rounded" />
          <div className="h-64 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return <div className="p-6 text-muted">Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-white/10 bg-card/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/admin/blog')}
            className="flex items-center gap-2 px-4 py-2 text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-white/10 border border-white/20 text-ink rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            
            {!post.published_at && (
              <button 
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-accent to-accent-2 text-white rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200 disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                Publish
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1 max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost(prev => prev ? {...prev, title: e.target.value} : null)}
              className="w-full text-4xl font-bold bg-transparent border-none outline-none text-ink placeholder-muted"
              placeholder="Add title"
            />
            
            <RichEditor
              value={post.content_md}
              onChange={(content) => setPost(prev => prev ? {...prev, content_md: content} : null)}
              onSave={handleSave}
              placeholder="Tell your story..."
              autoSave={true}
            />
          </div>
        </div>

        <div className="w-80 border-l border-white/10 bg-card/50 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Featured Image
              </h3>
              
              <FileUpload
                onUpload={(file) => setPost(prev => prev ? {...prev, cover_url: file.file_url} : null)}
                accept="image/*"
                className="aspect-video"
              />
              
              {post.cover_url && (
                <div className="mt-3">
                  <input
                    type="url"
                    value={post.cover_url}
                    onChange={(e) => setPost(prev => prev ? {...prev, cover_url: e.target.value} : null)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="Image URL"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-ink mb-4">Excerpt</h3>
              <textarea
                value={post.excerpt || ''}
                onChange={(e) => setPost(prev => prev ? {...prev, excerpt: e.target.value} : null)}
                rows={4}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                placeholder="Brief description..."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </h3>
              <input
                type="text"
                value={post.tags?.join(', ') || ''}
                onChange={(e) => setPost(prev => prev ? {...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)} : null)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="art, culture, creativity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
