'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { FileUpload } from '@/components/admin/file-upload';
import { getSiteSettings, updateSiteSettings, type SiteSettings, type Blog, getBlogs } from '@/lib/api';
import { Loader2, Save } from 'lucide-react';

export default function MastheadAdmin() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, blogRes] = await Promise.all([
          getSiteSettings().catch(() => null),
          getBlogs({ limit: 50 }).catch(() => ({ items: [] }))
        ]);
        setSettings(s || {});
        setPosts(blogRes.items || []);
      } catch (err) {
        console.error('Failed to load masthead settings', err);
        setStatus('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setField = (key: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({ ...(prev || {}), [key]: value }));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setStatus(null);
    try {
      await updateSiteSettings(settings);
      setStatus('Masthead saved');
    } catch (err: any) {
      setStatus(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader title="Homepage Masthead" subtitle="Edit hero text/buttons and pick a featured post" showAddButton={false} />
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Text content</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={settings?.hero_title || ''}
                  onChange={(e) => setField('hero_title', e.target.value)}
                  placeholder="Hero label (badge) e.g. Memshaheb"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="text"
                  value={settings?.hero_tagline || ''}
                  onChange={(e) => setField('hero_tagline', e.target.value)}
                  placeholder="Headline"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <textarea
                value={settings?.hero_body || ''}
                onChange={(e) => setField('hero_body', e.target.value)}
                placeholder="Short supporting copy"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                rows={3}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Buttons</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={settings?.hero_primary_label || ''}
                  onChange={(e) => setField('hero_primary_label', e.target.value)}
                  placeholder="Primary label (Read now)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="text"
                  value={settings?.hero_primary_href || ''}
                  onChange={(e) => setField('hero_primary_href', e.target.value)}
                  placeholder="Primary link (e.g. /blogs/slug)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={settings?.hero_secondary_label || ''}
                  onChange={(e) => setField('hero_secondary_label', e.target.value)}
                  placeholder="Secondary label"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="text"
                  value={settings?.hero_secondary_href || ''}
                  onChange={(e) => setField('hero_secondary_href', e.target.value)}
                  placeholder="Secondary link"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Featured post</h3>
              <select
                value={settings?.hero_featured_blog_id ?? ''}
                onChange={(e) => setField('hero_featured_blog_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              >
                <option value="">Auto (latest)</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">If blank, we show the latest published post.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save masthead'}
              </button>
              {status && <span className="text-sm text-muted">{status}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
