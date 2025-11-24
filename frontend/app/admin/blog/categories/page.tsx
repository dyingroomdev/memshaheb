'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Trash2, Save, FolderOpen, Edit3, Check } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { API_BASE_URL } from '@/lib/config';

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
};

const defaultForm: FormState = { name: '', slug: '', description: '' };

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/blog-categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        } else if (res.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    if (!form.name.trim()) {
      setStatus('Name is required');
      return;
    }
    setSaving(true);
    setStatus(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    const url = editingId
      ? `${API_BASE_URL}/blog-categories/${editingId}`
      : `${API_BASE_URL}/blog-categories`;
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || res.statusText);
      }
      const saved: Category = await res.json();
      setCategories((prev) => {
        const others = prev.filter((c) => c.id !== saved.id);
        return [saved, ...others].sort((a, b) => a.name.localeCompare(b.name));
      });
      resetForm();
      setStatus('Saved');
    } catch (err: any) {
      console.error('Save failed', err);
      setStatus(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete category? Posts will become uncategorized.')) return;
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/blog-categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || res.statusText);
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('Delete failed', err);
      setStatus('Delete failed');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
    });
  };

  return (
    <div>
      <AdminHeader
        title="Blog Categories"
        subtitle="Organize Memshaheb stories by theme"
        showAddButton={false}
      />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-card/80 p-6 shadow-glow-soft">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-ink">All categories</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-muted">No categories yet. Add your first one.</p>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{cat.name}</p>
                      <p className="text-xs text-muted">/{cat.slug}</p>
                      {cat.description && <p className="text-xs text-muted mt-1 line-clamp-2">{cat.description}</p>}
                    </div>
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4 text-muted" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="rounded-lg p-2 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-card/80 p-6 shadow-glow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-ink">
                {editingId ? 'Edit category' : 'Add category'}
              </h2>
            </div>
            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="Culture, Essays, Poetry..."
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Slug (optional)
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="culture"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="Optional helper copy for this category"
                />
              </label>
              {status && <p className="text-xs text-muted">{status}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Check className="h-4 w-4" />
                      Update category
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save category
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:bg-white/10 transition-colors"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
