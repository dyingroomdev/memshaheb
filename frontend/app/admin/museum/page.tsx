'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { motion } from 'framer-motion';
import { AdminHeader } from '@/components/admin/admin-header';
import type { MuseumRoom } from '@/lib/api';
import { Building2, Edit3, Loader2, Plus, Trash2 } from 'lucide-react';

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

export default function MuseumManagerList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          return;
        }
        const response = await fetch(`${API_BASE}/museum/rooms`, {
          headers: buildAuthHeaders(token),
        });
        if (response.ok) {
          const data = (await response.json()) as MuseumRoom[];
          setRooms(Array.isArray(data) ? data : []);
        } else if (response.status === 401) {
          redirectToLogin();
        } else {
          setStatusMessage({ type: 'error', text: 'Failed to load rooms. Please try again.' });
        }
      } catch (error) {
        console.error('Failed to fetch museum rooms:', error);
        setStatusMessage({ type: 'error', text: 'Network error while loading rooms.' });
      } finally {
        setLoading(false);
      }
    };

    void fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        redirectToLogin();
        return;
      }

      const payload = {
        title: 'New Gallery Room',
        intro: 'A new room in your virtual museum',
        sort: rooms.length,
      };

      const response = await fetch(`${API_BASE}/museum/rooms`, {
        method: 'POST',
        headers: buildAuthHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const created = (await response.json()) as MuseumRoom;
        router.push(`/admin/museum/${created.id}/editor` as Route);
      } else if (response.status === 401) {
        redirectToLogin();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Unable to create museum room.';
        setStatusMessage({ type: 'error', text: message });
      }
    } catch (error) {
      console.error('Error creating museum room', error);
      setStatusMessage({ type: 'error', text: 'Network error while creating room.' });
    }
  };

  const handleDeleteRoom = async (room: MuseumRoom) => {
    if (!confirm(`Delete room "${room.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        redirectToLogin();
        return;
      }

      setDeletingId(room.id);
      const response = await fetch(`${API_BASE}/museum/rooms/${room.id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token),
      });

      if (response.ok || response.status === 204) {
        setRooms((prev) => prev.filter((item) => item.id !== room.id));
        setStatusMessage({ type: 'success', text: `"${room.title}" was deleted.` });
      } else if (response.status === 401) {
        redirectToLogin();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Failed to delete room.';
        setStatusMessage({ type: 'error', text: message });
      }
    } catch (error) {
      console.error('Failed to delete museum room', error);
      setStatusMessage({ type: 'error', text: 'Network error while deleting room.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Museum"
        subtitle="Manage the rooms in your virtual museum"
        showAddButton
        onAddClick={handleCreateRoom}
      />

      <div className="p-6 space-y-6">
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
              <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
              <Building2 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-ink">No museum rooms yet</h3>
            <p className="text-muted mb-6">Create your first virtual gallery room.</p>
            <button
              onClick={handleCreateRoom}
              className="rounded-2xl bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-medium text-white shadow-lg shadow-accent/30"
            >
              Create Room
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-white/10 bg-card/80 p-6 shadow-glow-soft transition-shadow duration-200 hover:shadow-glow-medium"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-ink">{room.title}</h3>
                      <span className="text-xs text-muted">Sort: {room.sort}</span>
                    </div>
                    {room.intro && <p className="mt-2 text-sm text-muted line-clamp-2">{room.intro}</p>}
                    <p className="mt-2 text-xs text-muted">Slug: {room.slug}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/admin/museum/${room.id}/editor` as Route)
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      <Edit3 className="h-4 w-4" />
                      Manage
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room)}
                      disabled={deletingId === room.id}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        deletingId === room.id
                          ? 'border-red-500/30 bg-red-500/10 text-red-200'
                          : 'border-red-500/30 text-red-300 hover:bg-red-500/10'
                      }`}
                    >
                      {deletingId === room.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
