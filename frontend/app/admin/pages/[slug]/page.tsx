'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { AdminHeader } from '@/components/admin/admin-header';
import type { PageSection } from '@/lib/api';
import { fetchAdminPage, updateAdminPageMeta, createPageSectionBySlug, updatePageSection, deletePageSection } from '@/lib/api';
import { Loader2, Plus, Save, Trash2, ArrowUp, ArrowDown, Tag } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

const RichEditor = dynamic(() => import('@/components/admin/rich-editor').then((mod) => mod.RichEditor), {
  ssr: false
});

type AdminPage = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
};

export default function AdminPageEditor() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState<AdminPage | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<Partial<PageSection>>({ title: '', content: '', order: 1, anchor: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pageForm, setPageForm] = useState<Pick<AdminPage, 'title' | 'description' | 'is_active'>>({
    title: '',
    description: '',
    is_active: true
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const [creating, setCreating] = useState(false);

  const fetchPage = async () => {
    setLoading(true);
    try {
      let data: any;
      try {
        data = await fetchAdminPage(slug);
      } catch (err) {
        // fallback to public endpoint if admin fetch fails (e.g., token missing)
        const res = await fetch(`${API_BASE_URL}/pages/${slug}`, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          data = await res.json();
        } else {
          throw err;
        }
      }
      setPage(data as any);
      setPageForm({
        title: data.title,
        description: data.description ?? '',
        is_active: data.is_active ?? true
      });
      setSections((data.sections || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setStatus(null);
    } catch (err) {
      console.error('Failed to load page', err);
      setPage(null);
      if (!creating && token) {
        await createPage();
      } else {
        setStatus('Page not found or not authorized. Please login as admin.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const createPage = async () => {
    if (!token) return;
    setCreating(true);
    setSaving(true);
    try {
      const payload = {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        slug,
        description: `${slug} placeholder.`,
        is_active: true
      };
      const res = await fetch(`${API_BASE_URL}/pages/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // If slug already exists, just refetch
        if (res.status === 400 && err.detail?.toString().toLowerCase().includes('slug already exists')) {
          await fetchPage();
          return;
        }
        throw new Error(err.detail || res.statusText);
      }
      setStatus('Page created');
      await fetchPage();
    } catch (err: any) {
      setStatus(err.message || 'Create failed');
    } finally {
      setCreating(false);
      setSaving(false);
    }
  };

  const savePageMeta = async () => {
    if (!token || !page) {
      setStatus('Login required to save.');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await updateAdminPageMeta(slug, {
        title: pageForm.title || page.title,
        description: pageForm.description ?? '',
        is_active: pageForm.is_active
      });
      setStatus('Page details updated');
      await fetchPage();
    } catch (err: any) {
      setStatus(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addSection = async () => {
    if (!token || !page) {
      setStatus('Login required to add sections.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        page_id: page.id,
        title: sectionForm.title?.trim() || 'Untitled',
        content: sectionForm.content || '',
        order: sectionForm.order || sections.length + 1,
        anchor: sectionForm.anchor || null
      };
      if (editingId) {
        await updatePageSection(editingId, payload);
      } else {
        await createPageSectionBySlug(slug, payload);
      }
      setSectionForm({ title: '', content: '', order: sections.length + 2, anchor: '' });
      setEditingId(null);
      await fetchPage();
      setStatus(editingId ? 'Section updated' : 'Section added');
    } catch (err: any) {
      setStatus(err.message || 'Add failed');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (section: PageSection) => {
    setEditingId(section.id);
    setSectionForm({
      title: section.title,
      content: section.content,
      order: section.order,
      anchor: section.anchor || ''
    });
    setStatus('Editing section...');
  };

  const deleteSection = async (id: number) => {
    if (!token) return;
    if (!confirm('Delete this section?')) return;
    try {
      await deletePageSection(id);
      if (page) fetchPage();
      setEditingId((prev) => (prev === id ? null : prev));
    } catch (err) {
      console.error(err);
    }
  };

  const moveSection = (id: number, delta: number) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = Math.max(0, Math.min(prev.length - 1, idx + delta));
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const persistOrder = async () => {
    setSaving(true);
    try {
      await Promise.all(sections.map((s) => updatePageSection(s.id, { order: s.order })));
      setStatus('Order saved');
      await fetchPage();
    } catch (err) {
      setStatus('Order update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6 space-y-4">
        <AdminHeader title={`Create "${slug}"`} subtitle="Page not found, create it to start editing" showAddButton={false} />
        <button
          onClick={createPage}
          disabled={saving || creating || !token}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
        >
          {saving || creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {saving || creating ? 'Creating...' : token ? 'Create page' : 'Login required'}
        </button>
        {status && <p className="text-sm text-muted">{status}</p>}
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title={`Edit ${page.title}`} subtitle={`/${page.slug}`} showAddButton={false} />
      <div className="p-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Page details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={pageForm.title}
              onChange={(e) => setPageForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Page title"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
            <select
              value={pageForm.is_active ? 'true' : 'false'}
              onChange={(e) => setPageForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="text-xs text-muted inline-flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Slug: admin/{page.slug}
          </div>
          <textarea
            value={pageForm.description ?? ''}
            onChange={(e) => setPageForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Short description"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            rows={2}
          />
          <button
            onClick={savePageMeta}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save page'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Add section</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={sectionForm.title || ''}
              onChange={(e) => setSectionForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Section title"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
            <input
              type="text"
              value={sectionForm.anchor || ''}
              onChange={(e) => setSectionForm((p) => ({ ...p, anchor: e.target.value }))}
              placeholder="Anchor (optional)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
          <RichEditor
            value={sectionForm.content || ''}
            onChange={(val) => setSectionForm((p) => ({ ...p, content: val }))}
            onSave={() => void addSection()}
            autoSave={false}
            className="min-h-[220px]"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={addSection}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : editingId ? 'Update section' : 'Add section'}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setSectionForm({ title: '', content: '', order: sections.length + 1, anchor: '' });
                  setStatus(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:text-ink"
              >
                Cancel edit
              </button>
            )}
            {status && <span className="text-sm text-muted">{status}</span>}
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{section.title}</p>
                  <p className="text-xs text-muted">Order {section.order}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveSection(section.id, -1)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ArrowUp className="h-4 w-4 text-muted" />
                  </button>
                  <button
                    onClick={() => moveSection(section.id, 1)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ArrowDown className="h-4 w-4 text-muted" />
                  </button>
                  <button
                    onClick={() => startEdit(section)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Save className="h-4 w-4 text-muted" />
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-300" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-muted line-clamp-4" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          ))}
          {sections.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-muted">No sections yet.</div>
          )}
          {sections.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={persistOrder}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:text-ink"
              >
                Save order
              </button>
              {status && <span className="text-sm text-muted">{status}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
