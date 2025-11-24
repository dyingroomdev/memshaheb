'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { FileUpload } from '@/components/admin/file-upload';
import { getSiteSettings } from '@/lib/api';
import { updateSiteSettings } from '@/lib/api';
import type { SiteSettings } from '@/lib/api';
import { Loader2, Save } from 'lucide-react';

export default function BrandPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      setSettings(data || {});
    } catch (err) {
      console.error('Failed to load settings', err);
      setStatus('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setStatus(null);
    try {
      await updateSiteSettings(settings);
      setStatus('Brand settings saved');
      await fetchSettings();
    } catch (err: any) {
      setStatus(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({ ...(prev || {}), [key]: value }));
  };

  return (
    <div>
      <AdminHeader title="Brand & SEO" subtitle="Logo, favicon, site identity and default SEO" showAddButton={false} />
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
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Site identity</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.24em] text-muted">Logo</label>
                  <FileUpload
                    accept="image/*"
                    onUpload={(file) => setField('logo_url', file.file_url)}
                    className="bg-white/5"
                  />
                  {settings?.logo_url && (
                    <img src={settings.logo_url} alt="Logo" className="h-12 object-contain" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.24em] text-muted">Favicon</label>
                  <FileUpload
                    accept="image/*"
                    onUpload={(file) => setField('favicon_url', file.file_url)}
                    className="bg-white/5"
                  />
                  {settings?.favicon_url && (
                    <img src={settings.favicon_url} alt="Favicon" className="h-10 w-10 object-contain" />
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={settings?.site_title || ''}
                  onChange={(e) => setField('site_title', e.target.value)}
                  placeholder="Site title"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="text"
                  value={settings?.site_tagline || ''}
                  onChange={(e) => setField('site_tagline', e.target.value)}
                  placeholder="Tagline / short punchline"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">SEO defaults</h3>
              <textarea
                value={settings?.seo_description || ''}
                onChange={(e) => setField('seo_description', e.target.value)}
                placeholder="Default meta description"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                rows={3}
              />
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.24em] text-muted">Social share image</label>
                <FileUpload
                  accept="image/*"
                  onUpload={(file) => setField('seo_image_url', file.file_url)}
                  className="bg-white/5"
                />
                {settings?.seo_image_url && (
                  <img src={settings.seo_image_url} alt="SEO" className="h-24 object-cover rounded-xl" />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Analytics & Verification</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="number"
                  value={settings?.manual_total_views ?? 0}
                  onChange={(e) => setField('manual_total_views', Number(e.target.value || 0))}
                  placeholder="Manual total views"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="number"
                  value={settings?.ga_view_sample ?? ''}
                  onChange={(e) => setField('ga_view_sample', e.target.value ? Number(e.target.value) : null)}
                  placeholder="GA recent views (optional)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={settings?.google_analytics_id || ''}
                  onChange={(e) => setField('google_analytics_id', e.target.value)}
                  placeholder="Google Analytics ID (e.g. G-XXXXXXX)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="text"
                  value={settings?.google_site_verification || ''}
                  onChange={(e) => setField('google_site_verification', e.target.value)}
                  placeholder="Google site verification token"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <input
                type="text"
                value={settings?.bing_site_verification || ''}
                onChange={(e) => setField('bing_site_verification', e.target.value)}
                placeholder="Bing webmaster verification token"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
              <p className="text-xs text-muted">Paste only the token/value (not the full meta tag).</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save brand'}
              </button>
              {status && <span className="text-sm text-muted">{status}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
