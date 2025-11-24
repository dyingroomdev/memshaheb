'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { API_BASE_URL } from '@/lib/config';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type Page = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/pages/admin`, {
        headers: { Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
      });
      if (!res.ok) return;
      const data = await res.json();
      setPages(data || []);
    } catch (err) {
      console.error('Failed to load pages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div>
      <AdminHeader title="Pages" subtitle="Legal and submission pages" showAddButton={false} />
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-muted">
            No pages yet. Click a preset in the sidebar to start editing.
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/admin/pages/${page.slug}`}
                className="grid gap-3 md:grid-cols-[2fr_1fr_auto] items-center rounded-2xl border border-white/10 bg-card/70 p-4 hover:border-accent/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{page.title}</p>
                  <p className="text-xs text-muted">/{page.slug}</p>
                </div>
                <span className="text-xs text-muted">{page.is_active ? 'Active' : 'Inactive'}</span>
                <span className="text-xs text-muted">Updated {new Date(page.updated_at).toLocaleString()}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
