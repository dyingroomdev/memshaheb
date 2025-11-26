'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/admin-header';
import { RichEditor } from '@/components/admin/rich-editor';
import { FileUpload } from '@/components/admin/file-upload';
import { ArrowLeft, Loader2, Trash2, Eye, Save } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Author = {
  id: number;
  display_name?: string | null;
  email: string;
  role: string;
};

interface BlogPost {
  id: number;
  title: string;
  excerpt?: string | null;
  content_md: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  slug: string;
  tags?: string[] | null;
  cover_url?: string | null;
  category_id?: number | null;
  author_id?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

type BlogFormState = {
  title: string;
  excerpt: string;
  content_md: string;
  tags: string;
  cover_url: string;
  published_at: string;
  category_id: string;
  author_id: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_image_url: string;
};

type StatusMessage = { type: 'success' | 'error'; text: string };

const formatDateTimeLocal = (value: string | null | undefined) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  const offset = parsed.getTimezoneOffset();
  const adjusted = new Date(parsed.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 16);
};

const buildFormState = (post: BlogPost): BlogFormState => ({
  title: post.title ?? '',
  excerpt: post.excerpt ?? '',
  content_md: post.content_md ?? '',
  tags: post.tags?.join(', ') ?? '',
  cover_url: post.cover_url ?? '',
  published_at: formatDateTimeLocal(post.published_at),
  category_id: post.category_id ? String(post.category_id) : '',
  author_id: post.author_id ? String(post.author_id) : '',
  meta_title: post.meta_title ?? post.title ?? '',
  meta_description: post.meta_description ?? post.excerpt ?? '',
  canonical_url: post.canonical_url ?? '',
  og_image_url: post.og_image_url ?? post.cover_url ?? '',
});

const getWordCount = (content: string) => {
  if (!content.trim()) return 0;
  return content.trim().split(/\s+/).length;
};

const getStatusLabel = (post: BlogPost | null, form: BlogFormState) => {
  if (form.published_at) return 'Will publish';
  if (post?.published_at) return 'Published';
  return 'Draft';
};

export default function BlogEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const blogId = params.id;
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [formValues, setFormValues] = useState<BlogFormState>(() => ({
    title: '',
    excerpt: '',
    content_md: '',
    tags: '',
    cover_url: '',
    published_at: '',
    category_id: '',
    author_id: '',
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    og_image_url: '',
  }));
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          const data: BlogPost = await response.json();
          const hydrated = {
            ...data,
            category_id: data.category_id ?? (data.category?.id ?? null),
          };
          setSelectedCategory(hydrated.category_id ? String(hydrated.category_id) : '');
          setBlog(hydrated);
          setFormValues(buildFormState(hydrated));
        } else if (response.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        } else if (response.status === 404) {
          setStatusMessage({ type: 'error', text: 'Blog post not found.' });
        } else {
          setStatusMessage({ type: 'error', text: 'Failed to load blog post.' });
        }
      } catch (error) {
        console.error('Failed to load blog post:', error);
        setStatusMessage({ type: 'error', text: 'Network error. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    const fetchTaxonomy = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const [catsRes, authorsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/blog-categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }),
          fetch(`${API_BASE_URL}/users?role=AUTHOR`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }),
        ]);
        if (catsRes.ok) {
          const catData = await catsRes.json();
          setCategories(catData || []);
        }
        if (authorsRes.ok) {
          const authorData = await authorsRes.json();
          setAuthors(authorData || []);
        }
      } catch (error) {
        console.error('Failed to load categories/authors', error);
      }
    };

    fetchPost();
    fetchTaxonomy();
  }, [blogId, router]);

  const handleInputChange =
    (field: keyof BlogFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSave = async () => {
    if (!blog) return;

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      setSaving(true);
      setStatusMessage(null);

      const tags = formValues.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

    const payload = {
      title: formValues.title.trim() || 'Untitled Post',
      content_md: formValues.content_md,
      excerpt: formValues.excerpt.trim() || null,
      tags: tags.length ? tags : [],
      cover_url: formValues.cover_url.trim() || null,
      published_at: formValues.published_at ? new Date(formValues.published_at).toISOString() : null,
      category_id: (() => {
        const value = formValues.category_id;
        if (!value) return null;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
      })(),
      author_id: formValues.author_id ? Number(formValues.author_id) : undefined,
      meta_title: formValues.meta_title.trim() || formValues.title.trim(),
      meta_description: formValues.meta_description.trim() || (formValues.excerpt || '').trim() || null,
      canonical_url: formValues.canonical_url.trim() || null,
      og_image_url: formValues.og_image_url.trim() || null,
      };

      const response = await fetch(`${API_BASE_URL}/blogs/${blog.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.detail || 'Failed to update blog post.';
        setStatusMessage({ type: 'error', text: message });
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        }
        return;
      }

      const updatedPost: BlogPost = await response.json();
      // Fallback to the submitted category if the API omitted it
      const mergedPost: BlogPost = {
        ...updatedPost,
        category_id: updatedPost.category_id ?? (payload.category_id ?? null),
        category: updatedPost.category ?? blog?.category ?? null,
      };
      setSelectedCategory(mergedPost.category_id ? String(mergedPost.category_id) : '');
      setBlog(mergedPost);
      setFormValues(buildFormState(mergedPost));
      setStatusMessage({ type: 'success', text: 'Blog post updated successfully.' });
    } catch (error) {
      console.error('Error updating blog post:', error);
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!blog) return;
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      setDeleting(true);
      const response = await fetch(`${API_BASE_URL}/blogs/${blog.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to delete blog post: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        }
        return;
      }

      router.push('/admin/blog');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePreview = () => {
    if (blog) {
      window.open(`/blogs/${blog.slug}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSave();
  };

  const wordCount = useMemo(() => getWordCount(formValues.content_md), [formValues.content_md]);

  if (loading) {
    return (
      <div>
        <AdminHeader title="Blog Editor" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Blog Editor"
        subtitle={blog ? `Editing “${blog.title || 'Untitled Post'}”` : 'Create or refine your post'}
        showAddButton={false}
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!blog}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:bg-white/10 transition-colors disabled:opacity-60"
            title="Open public preview"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted">
              Status: {getStatusLabel(blog, formValues)} · Word count: {wordCount}
            </span>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`rounded-xl border px-4 py-2 text-sm ${
              statusMessage.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-green-500/40 bg-green-500/10 text-green-200'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-muted">
              Title
              <input
                type="text"
                value={formValues.title}
                onChange={handleInputChange('title')}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-muted">
              Publish At
              <input
                type="datetime-local"
                value={formValues.published_at}
                onChange={handleInputChange('published_at')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
            </label>
            <div className="flex flex-col gap-3 text-sm text-muted md:col-span-2">
              <span>Cover Image</span>
              <input
                type="url"
                value={formValues.cover_url}
                onChange={handleInputChange('cover_url')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="https://..."
              />
              <FileUpload
                onUpload={(file) =>
                  setFormValues((prev) => ({
                    ...prev,
                    cover_url: file.file_url,
                  }))
                }
                className="bg-white/5"
              />
              {formValues.cover_url && (
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <img
                    src={formValues.cover_url}
                    alt={formValues.title || 'Blog cover preview'}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>
            <label className="flex flex-col gap-2 text-sm text-muted md:col-span-2">
              Excerpt
              <textarea
                value={formValues.excerpt}
                onChange={handleInputChange('excerpt')}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="Optional teaser shown in listings"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted">
            <span>Content (Markdown)</span>
            <RichEditor
              value={formValues.content_md}
              onChange={(value) =>
                setFormValues((prev) => ({
                  ...prev,
                  content_md: value,
                }))
              }
              onSave={() => {
                void handleSave();
              }}
              autoSave={false}
              className="min-h-[320px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 text-sm text-muted">
              Tags
              <input
                type="text"
                value={formValues.tags}
                onChange={handleInputChange('tags')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="Separate tags by commas"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted">
              Category
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setFormValues((prev) => ({ ...prev, category_id: e.target.value }));
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted">
              Author
              <select
                value={formValues.author_id}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    author_id: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              >
                <option value="">Auto (current user)</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.display_name || author.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end text-xs text-muted">
              <span>Last updated: {blog ? new Date(blog.updated_at).toLocaleString() : '—'}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-muted">
              SEO Title
              <input
                type="text"
                value={formValues.meta_title}
                onChange={handleInputChange('meta_title')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="Meta title"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-muted">
              Canonical URL
              <input
                type="url"
                value={formValues.canonical_url}
                onChange={handleInputChange('canonical_url')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="https://memshaheb.com/article/..."
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-muted md:col-span-2">
              Meta Description
              <textarea
                value={formValues.meta_description}
                onChange={handleInputChange('meta_description')}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="SEO description for search and social"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-muted">
              OG Image URL
              <input
                type="url"
                value={formValues.og_image_url}
                onChange={handleInputChange('og_image_url')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="https://..."
              />
            </label>
            {formValues.og_image_url && (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <img
                  src={formValues.og_image_url}
                  alt="OG preview"
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
