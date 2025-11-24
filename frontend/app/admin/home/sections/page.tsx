'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Plus, Save, Trash2, Image, Link as LinkIcon, FolderOpen, Eye } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { FileUpload } from '@/components/admin/file-upload';
import { API_BASE_URL } from '@/lib/config';

type HomeSectionKind = 'AD' | 'CATEGORY';

type HomeSection = {
  id: number;
  kind: HomeSectionKind;
  title?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
  target_url?: string | null;
  category_id?: number | null;
  sort_order: number;
  enabled: boolean;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

const defaultForm: Omit<HomeSection, 'id' | 'sort_order' | 'enabled'> & { sort_order?: number; enabled?: boolean } = {
  kind: 'AD',
  title: '',
  subtitle: '',
  image_url: '',
  target_url: '',
  category_id: null,
};

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const [sectionsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/home/sections/admin`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          }),
          fetch(`${API_BASE_URL}/blog-categories`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          }),
        ]);
        if (sectionsRes.ok) {
          const data = await sectionsRes.json();
          setSections(data || []);
        }
        if (categoriesRes.ok) {
          const cat = await categoriesRes.json();
          setCategories(cat || []);
        }
      } catch (err) {
        console.error('Failed to load sections', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setStatus(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setSaving(true);
    setStatus(null);
    const payload = {
      ...form,
      category_id: form.kind === 'CATEGORY' ? form.category_id : null,
      sort_order: form.sort_order ?? sections.length + 1,
      enabled: form.enabled ?? true,
    };

    const url = editingId
      ? `${API_BASE_URL}/home/sections/${editingId}`
      : `${API_BASE_URL}/home/sections`;
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
      const saved: HomeSection = await res.json();
      setSections((prev) => {
        const others = prev.filter((s) => s.id !== saved.id);
        return [...others, saved].sort((a, b) => a.sort_order - b.sort_order);
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

  const startEdit = (section: HomeSection) => {
    setEditingId(section.id);
    setForm({
      kind: section.kind,
      title: section.title ?? '',
      subtitle: section.subtitle ?? '',
      image_url: section.image_url ?? '',
      target_url: section.target_url ?? '',
      category_id: section.category_id ?? null,
      sort_order: section.sort_order,
      enabled: section.enabled,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this section?')) return;
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/home/sections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || res.statusText);
      }
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error('Delete failed', err);
      setStatus('Delete failed');
    }
  };

  return (
    <div>
      <AdminHeader
        title="Homepage Sections"
        subtitle="Control ads and category blocks on the Memshaheb homepage"
        showAddButton={false}
      />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-card/80 p-6 shadow-glow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-ink">Existing sections</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : sections.length === 0 ? (
              <p className="text-muted">No sections yet. Add an ad or category block.</p>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {section.kind === 'AD' ? 'Ad Banner' : 'Category Block'} — {section.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-muted">
                        Sort {section.sort_order} · {section.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                      {section.kind === 'CATEGORY' && (
                        <p className="text-xs text-accent">
                          Category ID: {section.category_id ?? 'n/a'}
                        </p>
                      )}
                      {section.kind === 'AD' && section.target_url && (
                        <p className="text-xs text-muted">Link: {section.target_url}</p>
                      )}
                    </div>
                    <button
                      onClick={() => startEdit(section)}
                      className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                    >
                      <Check className="h-4 w-4 text-muted" />
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="rounded-lg p-2 hover:bg-red-500/20 transition-colors"
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
                {editingId ? 'Edit section' : 'Add section'}
              </h2>
            </div>
            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Kind
                <select
                  value={form.kind}
                  onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value as HomeSectionKind }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                >
                  <option value="AD">Ad Banner</option>
                  <option value="CATEGORY">Category Block</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Title
                <input
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Subtitle
                <input
                  type="text"
                  value={form.subtitle || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </label>

              {form.kind === 'CATEGORY' && (
                <label className="flex flex-col gap-2 text-sm text-muted">
                  Category
                  <select
                    value={form.category_id ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-muted">
                  Sort Order
                  <input
                    type="number"
                    value={form.sort_order ?? sections.length + 1}
                    onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={form.enabled ?? true}
                    onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="h-4 w-4 rounded border-white/20 bg-white/5"
                  />
                  Enabled
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm text-muted">
                Banner Image (for ads)
                <input
                  type="url"
                  value={form.image_url || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="https://..."
                />
                <FileUpload
                  onUpload={(file) =>
                    setForm((prev) => ({
                      ...prev,
                      image_url: file.file_url,
                    }))
                  }
                  className="bg-white/5"
                />
                {form.image_url && (
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <img src={form.image_url} alt="Ad preview" className="h-36 w-full object-cover" />
                  </div>
                )}
              </label>

              <label className="flex flex-col gap-2 text-sm text-muted">
                Target URL (for ads)
                <input
                  type="url"
                  value={form.target_url || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, target_url: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="https://"
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
                      Update section
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save section
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
