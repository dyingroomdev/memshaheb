'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Check, Loader2, Paintbrush, Plus, Tag, Trash2 } from 'lucide-react';
import { RichEditor } from '@/components/admin/rich-editor';
import { FileUpload } from '@/components/admin/file-upload';
import type { MuseumArtifact, MuseumRoom, Painting } from '@/lib/api';

import { API_BASE_URL } from '@/lib/config';

const API_BASE = API_BASE_URL;

type PaintingFormState = {
  title: string;
  description: string;
  year: string;
  medium: string;
  dimensions: string;
  image_url: string;
  tags: string;
  is_featured: boolean;
  published_at: string;
};

type ArtifactWithPainting = MuseumArtifact & { painting?: Painting | null };

const createEmptyForm = (): PaintingFormState => ({
  title: '',
  description: '',
  year: '',
  medium: '',
  dimensions: '',
  image_url: '',
  tags: '',
  is_featured: false,
  published_at: '',
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

const parseDateForInput = (value: string | null | undefined) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  const offset = parsed.getTimezoneOffset();
  const adjusted = new Date(parsed.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 16);
};

const serializeDateFromInput = (value: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

export default function PaintingEditorPage() {
  const router = useRouter();
  const params = useParams<{ paintingId: string }>();
  const paintingId = Number.parseInt(params?.paintingId ?? '', 10);

  const [formValues, setFormValues] = useState<PaintingFormState>(() => createEmptyForm());
  const [painting, setPainting] = useState<Painting | null>(null);
  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<Record<number, ArtifactWithPainting>>({});
  const [loadingPainting, setLoadingPainting] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assigningRoomId, setAssigningRoomId] = useState<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(paintingId)) {
      setStatusMessage({ type: 'error', text: 'Invalid painting id.' });
      setLoadingPainting(false);
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    const fetchPainting = async () => {
      try {
        const response = await fetch(`${API_BASE}/paintings/${paintingId}`, {
          headers: buildAuthHeaders(token),
        });
        if (!response.ok) {
          if (response.status === 401) {
            redirectToLogin();
            return;
          }
          throw new Error('Failed to fetch painting');
        }
        const data = (await response.json()) as Painting;
        setPainting(data);
        setFormValues({
          title: data.title ?? '',
          description: data.description ?? '',
          year: data.year ? String(data.year) : '',
          medium: data.medium ?? '',
          dimensions: data.dimensions ?? '',
          image_url: data.image_url ?? '',
          tags: data.tags?.join(', ') ?? '',
          is_featured: Boolean(data.is_featured),
          published_at: parseDateForInput(data.published_at),
        });
      } catch (error) {
        console.error('Failed to load painting', error);
        setStatusMessage({ type: 'error', text: 'Could not load painting details.' });
      } finally {
        setLoadingPainting(false);
      }
    };

    const fetchRooms = async () => {
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
        const data = (await response.json()) as MuseumRoom[];
        setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load rooms', error);
        setAssignmentStatus({ type: 'error', text: 'Could not load museum rooms.' });
      } finally {
        setLoadingRooms(false);
      }
    };

    void fetchPainting();
    void fetchRooms();
  }, [paintingId]);

  useEffect(() => {
    if (!Number.isFinite(paintingId)) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    const fetchAssignments = async () => {
      try {
        setLoadingAssignments(true);
        const response = await fetch(`${API_BASE}/museum/artifacts?painting_id=${paintingId}`, {
          headers: buildAuthHeaders(token),
        });
        if (!response.ok) {
          if (response.status === 401) {
            redirectToLogin();
            return;
          }
          throw new Error('Failed to fetch assignments');
        }
        const data = (await response.json()) as ArtifactWithPainting[];
        const map: Record<number, ArtifactWithPainting> = {};
        data.forEach((artifact) => {
          map[artifact.room_id] = artifact;
        });
        setRoomAssignments(map);
      } catch (error) {
        console.error('Failed to load assignments', error);
        setAssignmentStatus({ type: 'error', text: 'Unable to load museum assignments.' });
      } finally {
        setLoadingAssignments(false);
      }
    };

    void fetchAssignments();
  }, [paintingId]);

  const handleUploadComplete = (file: { file_url: string }) => {
    setFormValues((prev) => ({
      ...prev,
      image_url: file.file_url,
    }));
  };

  const handleSavePainting = async () => {
    if (!painting) return;
    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const payload = {
      title: formValues.title.trim() || 'Untitled Painting',
      description: formValues.description.trim() || null,
      year: formValues.year ? Number.parseInt(formValues.year, 10) : null,
      medium: formValues.medium.trim() || null,
      dimensions: formValues.dimensions.trim() || null,
      image_url: formValues.image_url || null,
      tags: formValues.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_featured: formValues.is_featured,
      published_at: serializeDateFromInput(formValues.published_at),
    };

    try {
      const response = await fetch(`${API_BASE}/paintings/${painting.id}`, {
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
        const message = errorData.detail || 'Failed to update painting.';
        setStatusMessage({ type: 'error', text: message });
        return;
      }

      const updated = (await response.json()) as Painting;
      setPainting(updated);
      setStatusMessage({ type: 'success', text: 'Painting updated successfully.' });
    } catch (error) {
      console.error('Failed to update painting', error);
      setStatusMessage({ type: 'error', text: 'Network error while updating painting.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRoomAssignment = async (room: MuseumRoom, assign: boolean) => {
    if (!painting) return;
    const token = localStorage.getItem('admin_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    setAssigningRoomId(room.id);
    setAssignmentStatus(null);

    if (assign) {
      try {
        const countResponse = await fetch(`${API_BASE}/museum/artifacts?room_id=${room.id}`, {
          headers: buildAuthHeaders(token),
        });
        let sort = 0;
        if (countResponse.ok) {
          const data = (await countResponse.json()) as ArtifactWithPainting[];
          sort = data.length;
        }

        const response = await fetch(`${API_BASE}/museum/artifacts`, {
          method: 'POST',
          headers: buildAuthHeaders(token, { 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            room_id: room.id,
            painting_id: painting.id,
            sort,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            redirectToLogin();
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          setAssignmentStatus({ type: 'error', text: errorData.detail || 'Failed to assign painting to room.' });
          return;
        }

        const created = (await response.json()) as ArtifactWithPainting;
        setRoomAssignments((prev) => ({ ...prev, [room.id]: created }));
        setAssignmentStatus({ type: 'success', text: `Assigned to "${room.title}".` });
      } catch (error) {
        console.error('Failed to assign painting to room', error);
        setAssignmentStatus({ type: 'error', text: 'Network error while assigning painting.' });
      } finally {
        setAssigningRoomId(null);
      }
      return;
    }

    const existing = roomAssignments[room.id];
    if (!existing) {
      setAssigningRoomId(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/museum/artifacts/${existing.id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token),
      });
      if (!response.ok && response.status !== 204) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        setAssignmentStatus({ type: 'error', text: errorData.detail || 'Failed to remove painting from room.' });
        return;
      }

      setRoomAssignments((prev) => {
        const next = { ...prev };
        delete next[room.id];
        return next;
      });
      setAssignmentStatus({ type: 'success', text: `Removed from "${room.title}".` });
    } catch (error) {
      console.error('Failed to remove painting from room', error);
      setAssignmentStatus({ type: 'error', text: 'Network error while removing painting.' });
    } finally {
      setAssigningRoomId(null);
    }
  };

  const assignedRoomCount = useMemo(() => Object.keys(roomAssignments).length, [roomAssignments]);

  if (!Number.isFinite(paintingId)) {
    return (
      <main className="p-6">
        <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100">Invalid painting id.</p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/paintings')}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to paintings
        </button>
        <h1 className="text-2xl font-semibold text-ink">
          {loadingPainting ? 'Loading painting…' : painting?.title ?? 'Painting'}
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

      <section className="space-y-6 rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-muted">
            Title
            <input
              type="text"
              value={formValues.title}
              onChange={(event) => setFormValues((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              disabled={loadingPainting}
            />
          </label>

          <label className="text-sm text-muted">
            Year
            <input
              type="number"
              value={formValues.year}
              onChange={(event) => setFormValues((prev) => ({ ...prev, year: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              min="0"
            />
          </label>

          <label className="text-sm text-muted">
            Medium
            <input
              type="text"
              value={formValues.medium}
              onChange={(event) => setFormValues((prev) => ({ ...prev, medium: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </label>

          <label className="text-sm text-muted">
            Dimensions
            <input
              type="text"
              value={formValues.dimensions}
              onChange={(event) => setFormValues((prev) => ({ ...prev, dimensions: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </label>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-muted">Description</span>
          <RichEditor
            value={formValues.description}
            onChange={(value) => setFormValues((prev) => ({ ...prev, description: value }))}
            onSave={() => void handleSavePainting()}
            autoSave={false}
            className="min-h-[220px]"
          />
        </div>

        <label className="text-sm text-muted">
          Cover image URL
          <input
            type="url"
            value={formValues.image_url}
            onChange={(event) => setFormValues((prev) => ({ ...prev, image_url: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            placeholder="https://"
          />
        </label>

        <FileUpload onUpload={handleUploadComplete} className="mt-4" />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-muted">
            Tags
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Tag className="h-4 w-4 text-muted" />
              <input
                type="text"
                value={formValues.tags}
                onChange={(event) => setFormValues((prev) => ({ ...prev, tags: event.target.value }))}
                className="w-full bg-transparent text-sm text-ink focus:outline-none"
                placeholder="Comma separated"
              />
            </div>
          </label>

          <label className="text-sm text-muted">
            Publish at
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Calendar className="h-4 w-4 text-muted" />
              <input
                type="datetime-local"
                value={formValues.published_at}
                onChange={(event) => setFormValues((prev) => ({ ...prev, published_at: event.target.value }))}
                className="w-full bg-transparent text-sm text-ink focus:outline-none"
              />
            </div>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={formValues.is_featured}
            onChange={(event) => setFormValues((prev) => ({ ...prev, is_featured: event.target.checked }))}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
          Featured painting
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleSavePainting()}
            disabled={saving || loadingPainting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">Museum rooms</h2>
            <p className="text-sm text-muted">
              Assign this painting to rooms in the virtual museum. Currently in {assignedRoomCount} room
              {assignedRoomCount === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        {assignmentStatus && (
          <div
            className={`rounded-xl border px-4 py-2 text-sm ${
              assignmentStatus.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-green-500/40 bg-green-500/10 text-green-200'
            }`}
          >
            {assignmentStatus.text}
          </div>
        )}

        {loadingRooms || loadingAssignments ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-sm text-muted">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading rooms…
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-muted">
            No museum rooms have been created yet.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {rooms.map((room) => {
              const assigned = Boolean(roomAssignments[room.id]);
              const busy = assigningRoomId === room.id;
              return (
                <div key={room.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Paintbrush className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{room.title}</p>
                        <p className="text-xs text-muted">
                          Sort {room.sort} • Slug {room.slug}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleToggleRoomAssignment(room, !assigned)}
                        disabled={busy}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${
                          assigned
                            ? 'border-red-500/30 text-red-300 hover:bg-red-500/10'
                            : 'border-accent/40 text-accent hover:border-accent'
                        } ${busy ? 'opacity-60' : ''}`}
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : assigned ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {assigned ? 'Remove' : 'Assign'}
                      </button>
                    </div>
                    {assigned && (
                      <p className="mt-2 text-xs text-muted">
                        Sort order {roomAssignments[room.id]?.sort ?? 0}. Manage placement in room editor.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {formValues.image_url && (
        <section className="rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft">
          <h2 className="mb-4 text-xl font-semibold text-ink">Preview</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img src={formValues.image_url} alt={formValues.title || 'Painting preview'} className="w-full object-cover" />
          </div>
        </section>
      )}
    </main>
  );
}
