'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { API_BASE_URL } from '@/lib/config';
import { Loader2, Plus, Trash2, Save, ChevronDown, Layers } from 'lucide-react';
import type { NavLinkNode } from '@/lib/api';

type Page = { id: number; slug: string; title: string };
type Category = { id: number; slug: string; name: string };

const defaultLink = (order: number): NavLinkNode => ({
  label: 'New Link',
  href: '/',
  sort_order: order,
  enabled: true,
  kind: 'custom',
  children: [],
});

export default function NavLinksPage() {
  const [links, setLinks] = useState<NavLinkNode[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, pagesRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/site/settings`, { headers: { Accept: 'application/json' } }),
          fetch(`${API_BASE_URL}/pages`, { headers: { Accept: 'application/json' } }),
          fetch(`${API_BASE_URL}/blog-categories`, { headers: { Accept: 'application/json' } })
        ]);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (Array.isArray(data?.nav_links)) {
            const sorted = [...data.nav_links].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            setLinks(sorted);
          }
        }
        if (pagesRes.ok) {
          const data = await pagesRes.json();
          const staticPages: Page[] = [
            { id: -1, slug: '', title: 'Home' },
            { id: -2, slug: 'about', title: 'About' },
            { id: -3, slug: 'contact', title: 'Contact' },
            { id: -4, slug: 'museum', title: 'Virtual Museum' },
            { id: -5, slug: 'paintings', title: 'Paintings' },
            { id: -6, slug: 'blogs', title: 'Magazine' },
            { id: -7, slug: 'privacy-policy', title: 'Privacy Policy' },
            { id: -8, slug: 'terms', title: 'Terms & Conditions' },
            { id: -9, slug: 'copyright', title: 'Copyright' },
          ];
          // Deduplicate by slug
          const merged = [...data, ...staticPages].reduce((acc: Page[], page) => {
            if (!acc.some((p) => p.slug === page.slug)) acc.push(page);
            return acc;
          }, []);
          setPages(merged);
        }
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error('Failed to load nav links', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    setLinks((prev) => [...prev, defaultLink((prev.at(-1)?.sort_order ?? prev.length) + 1)]);
  };

  const handleAddChild = (path: number[]) => {
    setLinks((prev) => {
      const next: NavLinkNode[] = JSON.parse(JSON.stringify(prev));
      const parent = getNodeByPath(next, path);
      if (!parent.children) parent.children = [];
      parent.children.push(defaultLink(parent.children.length + 1));
      return next;
    });
  };

  const handleChange = (path: number[], field: keyof NavLinkNode, value: any) => {
    setLinks((prev) => {
      const next: NavLinkNode[] = JSON.parse(JSON.stringify(prev));
      const node = getNodeByPath(next, path);
      (node as any)[field] = value;
      // auto-fill href/label when selecting page/category
      if (field === 'kind') {
        if (value === 'page') {
          node.href = pages[0] ? `/${pages[0].slug}` : '/';
          node.label = pages[0]?.title || node.label;
        } else if (value === 'category') {
          node.href = categories[0] ? `/blogs?category=${categories[0].slug}` : '/blogs';
          node.label = categories[0]?.name || node.label;
        } else if (value === 'dropdown') {
          node.href = undefined;
          if (!node.children) node.children = [];
        } else {
          node.href = '/';
        }
      }
      return next;
    });
  };

  const handleSelectTarget = (path: number[], kind: 'page' | 'category', id: number) => {
    setLinks((prev) => {
      const next: NavLinkNode[] = JSON.parse(JSON.stringify(prev));
      const node = getNodeByPath(next, path);
      if (kind === 'page') {
        const page = pages.find((p) => p.id === id);
        if (page) {
          node.label = page.title;
          node.href = `/${page.slug}`;
          node.target_id = page.id;
        }
      } else {
        const cat = categories.find((c) => c.id === id);
        if (cat) {
          node.label = cat.name;
          node.href = `/blogs?category=${cat.slug}`;
          node.target_id = cat.id;
        }
      }
      return next;
    });
  };

  const handleDelete = (path: number[]) => {
    setLinks((prev) => {
      const next: NavLinkNode[] = JSON.parse(JSON.stringify(prev));
      if (path.length === 1) {
        next.splice(path[0], 1);
      } else {
        const parentPath = path.slice(0, -1);
        const parent = getNodeByPath(next, parentPath);
        parent.children?.splice(path.at(-1)!, 1);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!token) {
      setStatus('Please login again.');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const payload = { nav_links: links };
      const res = await fetch(`${API_BASE_URL}/site/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || res.statusText);
      }
      setStatus('Saved');
    } catch (err: any) {
      console.error('Save failed', err);
      setStatus(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const renderLink = (link: NavLinkNode, path: number[], depth = 0) => {
    const type = link.kind || 'custom';
    return (
      <div key={path.join('-')} className="space-y-2 rounded-2xl border border-white/10 bg-card/70 p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto] items-center">
          <input
            type="text"
            value={link.label}
            onChange={(e) => handleChange(path, 'label', e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            placeholder="Label"
          />
          <select
            value={type}
            onChange={(e) => handleChange(path, 'kind', e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
          >
            <option value="custom">Custom</option>
            <option value="page">Page</option>
            <option value="category">Category</option>
            <option value="dropdown">Dropdown</option>
          </select>
          {type === 'page' ? (
            <select
              value={(link.target_id as number) ?? pages[0]?.id ?? ''}
              onChange={(e) => handleSelectTarget(path, 'page', Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          ) : type === 'category' ? (
            <select
              value={(link.target_id as number) ?? categories[0]?.id ?? ''}
              onChange={(e) => handleSelectTarget(path, 'category', Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={link.href || ''}
              onChange={(e) => handleChange(path, 'href', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              placeholder="/path or https://"
            />
          )}
          <div className="flex items-center gap-3 justify-end">
            <input
              type="number"
              value={link.sort_order ?? path[path.length - 1]}
              onChange={(e) => handleChange(path, 'sort_order', Number(e.target.value))}
              className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              placeholder="Order"
            />
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={link.enabled !== false}
                onChange={(e) => handleChange(path, 'enabled', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              Enabled
            </label>
            <button
              type="button"
              onClick={() => handleDelete(path)}
              className="rounded-lg p-2 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-300" />
            </button>
          </div>
        </div>

        {type === 'dropdown' && (
          <div className="space-y-2 rounded-2xl border border-white/5 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted inline-flex items-center gap-2">
                <Layers className="h-4 w-4" /> Dropdown items
              </p>
              <button
                onClick={() => handleAddChild(path)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-ink border border-white/10 hover:border-accent/50"
              >
                <Plus className="h-4 w-4" /> Add child
              </button>
            </div>
            <div className="space-y-2">
              {(link.children ?? []).map((child, idx) => renderLink(child, [...path, idx], depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <AdminHeader title="Nav Links" subtitle="Control navbar links, pages, categories, and dropdowns" showAddButton={false} />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-ink border border-white/10 hover:border-accent/50"
          >
            <Plus className="h-4 w-4" /> Add link
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
          {status && <span className="text-sm text-muted">{status}</span>}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-muted">
            No links yet. Add your first one.
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, idx) => renderLink(link, [idx]))}
          </div>
        )}
      </div>
    </div>
  );
}

function getNodeByPath(tree: NavLinkNode[], path: number[]): NavLinkNode {
  let node: NavLinkNode = tree[path[0]];
  for (let i = 1; i < path.length; i++) {
    node = node.children?.[path[i]] as NavLinkNode;
  }
  return node;
}
