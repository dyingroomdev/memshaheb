'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { AdminHeader } from '@/components/admin/admin-header';
import { API_BASE_URL } from '@/lib/config';
import type { PageSection } from '@/lib/api';
import { Loader2, Plus, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const RichEditor = dynamic(() => import('@/components/admin/rich-editor').then((mod) => mod.RichEditor), { ssr: false });

type PageInfo = {
  id: number;
  title: string;
  slug: string;
};

export default function PageSectionsAdmin() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState<PageInfo | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<Partial<PageSection>>({ title: '', content: '', order: 1, anchor: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/pages/${slug}`, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        setPage({ id: data.id, title: data.title, slug: data.slug });
        await fetchSections(data.id);
      } else {
        setPage(null);
        setSections([]);
      }
    } catch (err) {
      console.error('Failed to load page', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (pageId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/pages/admin/${pageId}/sections`, {
        headers: { Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
      });
      if (!res.ok) return;
      const data = await res.json();
      setSections((data || []).sort((a: PageSection, b: PageSection) => a.order - b.order));
    } catch (err) {
      console.error('Failed to load sections', err);
    }
  };

  useEffect(() => {
    if (slug) fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const addSection = async () => {
    if (!token || !page) return;
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        page_id: page.id,
        title: sectionForm.title?.trim() || 'Untitled',
        content: sectionForm.content || '',
        order: sectionForm.order || sections.length + 1,
        anchor: sectionForm.anchor || null
      };
      const res = await fetch(`${API_BASE_URL}/pages/admin/${page.id}/sections`, {
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
        throw new Error(err.detail || res.statusText);
      }
      setSectionForm({ title: '', content: '', order: sections.length + 2, anchor: '' });
      await fetchSections(page.id);
      setStatus('Section added');
    } catch (err: any) {
      setStatus(err.message || 'Add failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (id: number) => {
    if (!token) return;
    if (!confirm('Delete this section?')) return;
    try {
      await fetch(`${API_BASE_URL}/pages/admin/sections/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
      });
      if (page) fetchSections(page.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = (id: number, delta: number) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const targetIdx = Math.max(0, Math.min(prev.length - 1, idx + delta));
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const persistOrders = async () => {
    if (!token || !page) return;
    setSaving(true);
    try {
      await Promise.all(
        sections.map((section) =>
          fetch(`${API_BASE_URL}/pages/admin/sections/${section.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ order: section.order })
          })
        )
      );
      setStatus('Order saved');
    } catch (err) {
      console.error('Order update failed', err);
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
        <AdminHeader title={`Page "${slug}" not found`} subtitle="Create it from the Pages list first" showAddButton={false} />
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title={`Sections for ${page.title}`} subtitle={`/${page.slug}`} showAddButton={false} />
      <div className="p-6 space-y-6">
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
              {saving ? 'Saving...' : 'Add section'}
            </button>
            <button
              onClick={() => void persistOrders()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Save order
            </button>
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
                  <button onClick={() => handleMove(section.id, -1)} className="p-2 rounded-lg hover:bg-white/10">
                    <ArrowUp className="h-4 w-4 text-muted" />
                  </button>
                  <button onClick={() => handleMove(section.id, 1)} className="p-2 rounded-lg hover:bg-white/10">
                    <ArrowDown className="h-4 w-4 text-muted" />
                  </button>
                  <button onClick={() => deleteSection(section.id)} className="p-2 rounded-lg hover:bg-red-500/20">
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
        </div>
      </div>
    </div>
  );
}
