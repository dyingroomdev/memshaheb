'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Paintbrush, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { RichEditor } from '@/components/admin/rich-editor';
import type { MuseumArtifact, MuseumRoom, Painting } from '@/lib/api';

import { API_BASE_URL } from '@/lib/config';

const API_BASE = API_BASE_URL;

type RoomFormState = {
  title: string;
  intro: string;
  sort: string;
};

type ArtifactWithPainting = MuseumArtifact & { painting?: Painting | null };

const createEmptyRoomForm = (): RoomFormState => ({
  title: '',
  intro: '',
  sort: '',
});

const buildAuthHeaders = (token: string, extra?: Record<string, string>) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
  ...extra,
});

const redirectToLogin = () => {
  localStorage.removeItem('admin_token');
  window.location.href = '/admin/login';
};

const sortArtifacts = (a: ArtifactWithPainting, b: ArtifactWithPainting) => {
  if (a.sort !== b.sort) {
    return a.sort - b.sort;
  }
  return a.id - b.id;
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

export default function MuseumRoomEditorPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = Number.parseInt(params?.roomId ?? '', 10);

  const [initialised, setInitialised] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [loadingPaintings, setLoadingPaintings] = useState(true);
  const [savingRoom, setSavingRoom] = useState(false);
  const [room, setRoom] = useState<MuseumRoom | null>(null);
  const [formValues, setFormValues] = useState<RoomFormState>(() => createEmptyRoomForm());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactWithPainting[]>([]);
  const [artifactStatus, setArtifactStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [artifactEdits, setArtifactEdits] = useState<Record<number, string>>({});
  const [artifactSavingId, setArtifactSavingId] = useState<number | null>(null);
  const [artifactDeletingId, setArtifactDeletingId] = useState<number | null>(null);
  const [newPaintingId, setNewPaintingId] = useState('');
  const [newPaintingSort, setNewPaintingSort] = useState('0');
  const [addingArtifact, setAddingArtifact] = useState(false);
  const [loadingArtifacts, setLoadingArtifacts] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(roomId)) {
      setLoadingRoom(false);
      setStatusMessage({ type: 'error', text: 'Invalid room id.' });
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    const fetchRoom = async () => {
      try {
        const response = await fetch(`${API_BASE}/museum/rooms`, {
          headers: buildAuthHeaders(token),
        });
        if (!response.ok) {
          if (response.status === 401) {
            redirectToLogin();
            return;
          }
          throw new Error('Failed to fetch rooms');
        }
        const rooms = (await response.json()) as MuseumRoom[];
        const current = rooms.find((candidate) => candidate.id === roomId) ?? null;
        if (!current) {
          setStatusMessage({ type: 'error', text: 'Room not found.' });
        }
        setRoom(current);
        if (current) {
          setFormValues({
            title: current.title ?? '',
            intro: current.intro ?? '',
            sort: current.sort !== undefined ? String(current.sort) : '',
          });
        }
      } catch (error) {
        console.error('Failed to load room', error);
        setStatusMessage({ type: 'error', text: 'Could not load room details.' });
      } finally {
        setLoadingRoom(false);
      }
    };

    const fetchPaintings = async () => {
      try {
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
        console.error('Failed to load paintings', error);
        setStatusMessage({ type: 'error', text: 'Could not load paintings.' });
      } finally {
        setLoadingPaintings(false);
      }
    };

    void fetchRoom();
    void fetchPaintings();
  }, [roomId]);

  useEffect(() => {
    if (!room || initialised) {
      return;
    }
    setInitialised(true);
    void refreshArtifacts();
  }, [room, initialised]);

  const refreshArtifacts = async () => {
    if (!room) {
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }
    try {
      setLoadingArtifacts(true);
      const response = await fetch(`${API_BASE}/museum/artifacts?room_id=${room.id}`, {
        headers: buildAuthHeaders(token),
      });
      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        throw new Error('Failed to fetch artifacts');
      }
      const data = (await response.json()) as ArtifactWithPainting[];
      const sorted = (Array.isArray(data) ? data : []).sort(sortArtifacts);
      setArtifacts(sorted);
      setArtifactEdits(Object.fromEntries(sorted.map((artifact) => [artifact.id, String(artifact.sort)])));
      setNewPaintingSort(String(sorted.length));
      setArtifactStatus(null);
    } catch (error) {
      console.error('Failed to load artifacts', error);
      setArtifactStatus({ type: 'error', text: 'Unable to load assigned paintings.' });
    } finally {
      setLoadingArtifacts(false);
    }
  };

  const selectablePaintings = useMemo(() => {
    const assignedIds = new Set(artifacts.map((artifact) => artifact.painting_id));
    return paintings.filter((painting) => !assignedIds.has(painting.id));
  }, [artifacts, paintings]);

  const handleUpdateRoom = async () => {
    if (!room) return;
    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    setSavingRoom(true);
    setStatusMessage(null);

    const sortValue = Number.parseInt(formValues.sort, 10);
    const payload = {
      title: formValues.title.trim() || 'Untitled Room',
      intro: formValues.intro.trim() || null,
      sort: Number.isNaN(sortValue) ? undefined : sortValue,
    };

    try {
      const response = await fetch(`${API_BASE}/museum/rooms/${room.id}`, {
        method: 'PATCH',
        headers: buildAuthHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Failed to update room.';
        setStatusMessage({ type: 'error', text: message });
        return;
      }

      const updated = (await response.json()) as MuseumRoom;
      setRoom(updated);
      setStatusMessage({ type: 'success', text: 'Room updated successfully.' });
    } catch (error) {
      console.error('Failed to update room', error);
      setStatusMessage({ type: 'error', text: 'Network error while updating room.' });
    } finally {
      setSavingRoom(false);
    }
  };

  const handleArtifactSortChange = (id: number, value: string) => {
    setArtifactEdits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveArtifactSort = async (artifact: ArtifactWithPainting) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }
    const raw = artifactEdits[artifact.id] ?? '';
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      setArtifactStatus({ type: 'error', text: 'Sort order must be a non-negative number.' });
      return;
    }

    setArtifactSavingId(artifact.id);
    setArtifactStatus(null);

    try {
      const response = await fetch(`${API_BASE}/museum/artifacts/${artifact.id}`, {
        method: 'PATCH',
        headers: buildAuthHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ sort: parsed }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        setArtifactStatus({ type: 'error', text: errorData.detail || 'Failed to update sort order.' });
        return;
      }

      const updated = (await response.json()) as ArtifactWithPainting;
      setArtifacts((prev) =>
        prev
          .map((item) => (item.id === updated.id ? { ...item, sort: updated.sort } : item))
          .sort(sortArtifacts)
      );
      setArtifactEdits((prev) => ({ ...prev, [updated.id]: String(updated.sort) }));
      setArtifactStatus({ type: 'success', text: 'Sort order updated.' });
    } catch (error) {
      console.error('Failed to update artifact', error);
      setArtifactStatus({ type: 'error', text: 'Network error while updating sort order.' });
    } finally {
      setArtifactSavingId(null);
    }
  };

  const handleRemoveArtifact = async (artifactId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }
    setArtifactDeletingId(artifactId);
    setArtifactStatus(null);

    try {
      const response = await fetch(`${API_BASE}/museum/artifacts/${artifactId}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token),
      });
      if (!response.ok && response.status !== 204) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        setArtifactStatus({ type: 'error', text: errorData.detail || 'Failed to remove painting.' });
        return;
      }

      setArtifacts((prev) => prev.filter((item) => item.id !== artifactId));
      setArtifactEdits((prev) => {
        const next = { ...prev };
        delete next[artifactId];
        return next;
      });
      setArtifactStatus({ type: 'success', text: 'Painting removed from room.' });
    } catch (error) {
      console.error('Failed to delete artifact', error);
      setArtifactStatus({ type: 'error', text: 'Network error while removing painting.' });
    } finally {
      setArtifactDeletingId(null);
    }
  };

  const handleAddArtifact = async () => {
    if (!room) return;
    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    const paintingId = Number.parseInt(newPaintingId, 10);
    if (Number.isNaN(paintingId)) {
      setArtifactStatus({ type: 'error', text: 'Select a painting to add.' });
      return;
    }

    const parsedSort = Number.parseInt(newPaintingSort, 10);
    const sort = Number.isNaN(parsedSort) || parsedSort < 0 ? artifacts.length : parsedSort;

    setAddingArtifact(true);
    setArtifactStatus(null);

    try {
      const response = await fetch(`${API_BASE}/museum/artifacts`, {
        method: 'POST',
        headers: buildAuthHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          room_id: room.id,
          painting_id: paintingId,
          sort,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        setArtifactStatus({ type: 'error', text: errorData.detail || 'Failed to assign painting.' });
        return;
      }

      const created = (await response.json()) as ArtifactWithPainting;
      setArtifacts((prev) => [...prev, created].sort(sortArtifacts));
      setArtifactEdits((prev) => ({ ...prev, [created.id]: String(created.sort) }));
      setArtifactStatus({ type: 'success', text: 'Painting assigned to room.' });
      setNewPaintingId('');
      setNewPaintingSort(String(artifacts.length + 1));
    } catch (error) {
      console.error('Failed to assign painting', error);
      setArtifactStatus({ type: 'error', text: 'Network error while assigning painting.' });
    } finally {
      setAddingArtifact(false);
    }
  };

  if (!Number.isFinite(roomId)) {
    return (
      <main className="p-6">
        <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100">Invalid room id.</p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/museum')}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to rooms
        </button>
        <h1 className="text-2xl font-semibold text-ink">
          {loadingRoom ? 'Loading room…' : room?.title ?? 'Museum Room'}
        </h1>
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

      <section className="space-y-4 rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft">
        <div className="space-y-2">
          <label className="text-sm text-muted">
            Room Title
            <input
              type="text"
              value={formValues.title}
              onChange={(event) => setFormValues((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              disabled={loadingRoom}
            />
          </label>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-muted">Intro</span>
          <RichEditor
            value={formValues.intro}
            onChange={(value) => setFormValues((prev) => ({ ...prev, intro: value }))}
            onSave={() => void handleUpdateRoom()}
            autoSave={false}
            className="min-h-[240px]"
          />
        </div>

        <label className="text-sm text-muted">
          Sort Order
          <input
            type="number"
            min="0"
            value={formValues.sort}
            onChange={(event) => setFormValues((prev) => ({ ...prev, sort: event.target.value }))}
            className="mt-2 w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            disabled={loadingRoom}
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => void handleUpdateRoom()}
            disabled={savingRoom || loadingRoom}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
          >
            {savingRoom ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {savingRoom ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">Assigned paintings</h2>
            <p className="text-sm text-muted">Choose which artworks appear in this room and control their order.</p>
          </div>
          <button
            type="button"
            onClick={() => void refreshArtifacts()}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh list
          </button>
        </div>

        {artifactStatus && (
          <div
            className={`rounded-xl border px-4 py-2 text-sm ${
              artifactStatus.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-green-500/40 bg-green-500/10 text-green-200'
            }`}
          >
            {artifactStatus.text}
          </div>
        )}

        {loadingArtifacts ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-sm text-muted">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading assigned paintings…
          </div>
        ) : artifacts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-muted">
            No paintings have been assigned to this room yet.
          </div>
        ) : (
          <div className="space-y-4">
            {artifacts.map((artifact) => {
              const painting =
                artifact.painting ??
                paintings.find((candidate) => candidate.id === artifact.painting_id) ??
                null;
              return (
                <div
                  key={artifact.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-1 items-start gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      {painting?.image_url ? (
                        <img src={painting.image_url} alt={painting.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Paintbrush className="h-4 w-4 text-accent" />
                        <p className="font-semibold text-ink">{painting?.title ?? 'Untitled painting'}</p>
                      </div>
                      <p className="text-xs text-muted">
                        {painting?.medium ?? 'Mixed media'}
                        {painting?.year ? ` · ${painting.year}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <div className="flex items-center gap-2">
                      <label className="text-xs uppercase tracking-[0.32em] text-muted">Sort</label>
                      <input
                        type="number"
                        min="0"
                        value={artifactEdits[artifact.id] ?? String(artifact.sort)}
                        onChange={(event) => handleArtifactSortChange(artifact.id, event.target.value)}
                        className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleSaveArtifactSort(artifact)}
                        disabled={artifactSavingId === artifact.id}
                        className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-60"
                      >
                        {artifactSavingId === artifact.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemoveArtifact(artifact.id)}
                        disabled={artifactDeletingId === artifact.id}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${
                          artifactDeletingId === artifact.id
                            ? 'border-red-500/30 bg-red-500/10 text-red-200'
                            : 'border-red-500/30 text-red-300 hover:bg-red-500/10'
                        }`}
                      >
                        {artifactDeletingId === artifact.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.32em] text-muted">Painting</label>
              <select
                value={newPaintingId}
                onChange={(event) => setNewPaintingId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                disabled={loadingPaintings || selectablePaintings.length === 0}
              >
                <option value="">Select a painting</option>
                {selectablePaintings.length === 0 && !loadingPaintings && (
                  <option value="" disabled>
                    All paintings already assigned
                  </option>
                )}
                {selectablePaintings.map((painting) => (
                  <option key={painting.id} value={painting.id}>
                    {painting.title}
                    {painting.year ? ` (${painting.year})` : ''}
                  </option>
                ))}
              </select>
              {loadingPaintings && (
                <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading paintings…
                </p>
              )}
            </div>

            <div className="w-full md:w-40">
              <label className="text-xs uppercase tracking-[0.32em] text-muted">Sort</label>
              <input
                type="number"
                min="0"
                value={newPaintingSort}
                onChange={(event) => setNewPaintingSort(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleAddArtifact()}
              disabled={addingArtifact || !newPaintingId}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
            >
              {addingArtifact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {addingArtifact ? 'Adding…' : 'Add painting'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
