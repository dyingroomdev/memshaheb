'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { motion } from 'framer-motion';
import { AdminHeader } from '@/components/admin/admin-header';
import type { Painting } from '@/lib/api';
import { Edit3, ImageIcon, Loader2, Paintbrush, Plus, Trash2 } from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

const API_BASE = API_BASE_URL;

const buildAuthHeaders = (token: string, extra?: Record<string, string>) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
  ...extra,
});

const redirectToLogin = () => {
  localStorage.removeItem('admin_token');
  window.location.href = '/admin/login';
};

async function fetchAllPaintings(token: string): Promise<Painting[]> {
  const items: Painting[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < 12; page += 1) {
    const url = new URL(`${API_BASE}/paintings/admin`);
    url.searchParams.set('limit', '50');
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const response = await fetch(url.toString(), {
      headers: buildAuthHeaders(token),
    });

    if (!response.ok) {
      return Promise.reject(response);
    }

    const data = await response.json();
    const pageItems: Painting[] = data.items ?? [];
    items.push(...pageItems);

    const nextCursor = data.next_cursor;
    if (!nextCursor) {
      break;
    }
    cursor = String(nextCursor);
  }

  return items;
}

export default function PaintingsManagerList() {
  const router = useRouter();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          return;
        }
        try {
          const all = await fetchAllPaintings(token);
          setPaintings(all);
        } catch (response: unknown) {
          if (response instanceof Response) {
            if (response.status === 401) {
              redirectToLogin();
              return;
            }
            throw new Error(`Failed with status ${response.status}`);
          }
          throw response;
        }
      } catch (error) {
        console.error('Failed to fetch paintings', error);
        setStatusMessage({ type: 'error', text: 'Network error while loading paintings.' });
      } finally {
        setLoading(false);
      }
    };

    void fetchPaintings();
  }, []);

  const handleCreatePainting = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        redirectToLogin();
        return;
      }

      const payload = {
        title: 'Untitled Painting',
        description: 'A new artwork waiting to be described…',
        year: new Date().getFullYear(),
        medium: '',
        dimensions: '',
        tags: [],
        is_featured: false,
      };

      const response = await fetch(`${API_BASE}/paintings`, {
        method: 'POST',
        headers: buildAuthHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const created = (await response.json()) as Painting;
        router.push(`/admin/paintings/${created.id}/editor` as Route);
      } else if (response.status === 401) {
        redirectToLogin();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Unable to create painting.';
        setStatusMessage({ type: 'error', text: message });
      }
    } catch (error) {
      console.error('Error creating painting', error);
      setStatusMessage({ type: 'error', text: 'Network error while creating painting.' });
    }
  };

  const handleDeletePainting = async (painting: Painting) => {
    if (!confirm(`Delete painting "${painting.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        redirectToLogin();
        return;
      }

      setDeletingId(painting.id);
      const response = await fetch(`${API_BASE}/paintings/${painting.id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token),
      });

      if (response.ok || response.status === 204) {
        setPaintings((prev) => prev.filter((item) => item.id !== painting.id));
        setStatusMessage({ type: 'success', text: `"${painting.title}" was deleted.` });
      } else if (response.status === 401) {
        redirectToLogin();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Failed to delete painting.';
        setStatusMessage({ type: 'error', text: message });
      }
    } catch (error) {
      console.error('Failed to delete painting', error);
      setStatusMessage({ type: 'error', text: 'Network error while deleting painting.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Paintings"
        subtitle="Manage artworks in the collection"
        showAddButton
        onAddClick={handleCreatePainting}
      />

      <div className="space-y-6 p-6">
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

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : paintings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
              <ImageIcon className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-ink">No paintings yet</h3>
            <p className="mb-6 text-muted">Start building the gallery by adding your first artwork.</p>
            <button
              onClick={handleCreatePainting}
              className="rounded-2xl bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-medium text-white shadow-lg shadow-accent/30"
            >
              Create Painting
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paintings.map((painting) => (
              <motion.article
                key={painting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full flex-col rounded-3xl border border-white/10 bg-card/80 p-5 shadow-glow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Paintbrush className="h-6 w-6 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-ink">{painting.title}</h3>
                    <p className="text-xs text-muted">
                      {painting.year ?? 'Undated'}
                      {painting.medium ? ` · ${painting.medium}` : ''}
                    </p>
                  </div>
                </div>

                {painting.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted">{painting.description}</p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/admin/paintings/${painting.id}/editor` as Route)
                    }
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <Edit3 className="h-4 w-4" />
                    Manage
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePainting(painting)}
                    disabled={deletingId === painting.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                      deletingId === painting.id
                        ? 'border-red-500/30 bg-red-500/10 text-red-200'
                        : 'border-red-500/30 text-red-300 hover:bg-red-500/10'
                    }`}
                  >
                    {deletingId === painting.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
