'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import {
  createUserAdmin,
  deleteUserAdmin,
  getUsersAdmin,
  updateUserAdmin,
  type User
} from '@/lib/api';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';

const roles = ['ADMIN', 'EDITOR', 'AUTHOR', 'READER'];

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'EDITOR', display_name: '', bio: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getUsersAdmin();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
      setStatus('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addUser = async () => {
    if (!form.email || !form.password) {
      setStatus('Email and password required');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await createUserAdmin(form);
      setForm({ email: '', password: '', role: 'EDITOR', display_name: '', bio: '' });
      await load();
      setStatus('User created');
    } catch (err: any) {
      setStatus(err.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (id: number, role: string) => {
    try {
      await updateUserAdmin(id, { role });
      await load();
    } catch (err) {
      setStatus('Role update failed');
    }
  };

  const removeUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUserAdmin(id);
      await load();
    } catch (err) {
      setStatus('Delete failed');
    }
  };

  return (
    <div>
      <AdminHeader title="Users" subtitle="Manage admins and editors" showAddButton={false} />
      <div className="p-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
          <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Add user</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
              placeholder="Display name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Short bio"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
          <button
            onClick={addUser}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Add user'}
          </button>
          {status && <p className="text-sm text-muted">{status}</p>}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-muted">No users yet.</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="grid gap-3 md:grid-cols-[2fr_1fr_auto_auto] items-center rounded-2xl border border-white/10 bg-card/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{user.display_name || user.email}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => removeUser(user.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4 text-red-300" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
