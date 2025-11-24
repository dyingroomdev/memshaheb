'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { API_BASE_URL } from '@/lib/config';
import { Loader2, Save } from 'lucide-react';

type Submission = {
  id: number;
  name: string;
  email: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
};

const statuses = ['pending', 'reviewed', 'accepted', 'rejected'];

export default function SubmissionsAdmin() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/submissions/admin`, {
        headers: { Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
      });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/submissions/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || res.statusText);
      }
      fetchSubmissions();
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <AdminHeader title="Submissions" subtitle="Reader submissions for Memshaheb" showAddButton={false} />
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-muted">No submissions yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.name} • {item.email} • {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                      disabled={savingId === item.id}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {savingId === item.id && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                  </div>
                </div>
                <p className="text-sm text-muted line-clamp-4">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
