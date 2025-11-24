'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { changePassword, getCurrentUser, updateProfile, type User } from '@/lib/api';
import { Loader2, Save } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', display_name: '', bio: '' });
  const [pwd, setPwd] = useState({ old_password: '', new_password: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getCurrentUser();
        setUser(me);
        setForm({
          email: me?.email || '',
          display_name: me?.display_name || '',
          bio: me?.bio || ''
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        setStatus('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      setStatus('Profile saved');
    } catch (err: any) {
      setStatus(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!pwd.old_password || !pwd.new_password) {
      setStatus('Enter both passwords');
      return;
    }
    setPasswordSaving(true);
    setStatus(null);
    try {
      await changePassword(pwd);
      setPwd({ old_password: '', new_password: '' });
      setStatus('Password updated');
    } catch (err: any) {
      setStatus(err.message || 'Password update failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader title="My Profile" subtitle="Update your name, email, bio, and password" showAddButton={false} />
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
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Profile</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Short bio"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                rows={3}
              />
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/70 p-4 space-y-3">
              <h3 className="text-sm uppercase tracking-[0.32em] text-muted">Change password</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="password"
                  value={pwd.old_password}
                  onChange={(e) => setPwd((p) => ({ ...p, old_password: e.target.value }))}
                  placeholder="Current password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <input
                  type="password"
                  value={pwd.new_password}
                  onChange={(e) => setPwd((p) => ({ ...p, new_password: e.target.value }))}
                  placeholder="New password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <button
                onClick={savePassword}
                disabled={passwordSaving}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-ink hover:text-ink hover:border-accent/50"
              >
                {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {passwordSaving ? 'Saving...' : 'Update password'}
              </button>
            </div>
            {status && <p className="text-sm text-muted">{status}</p>}
          </>
        )}
      </div>
    </div>
  );
}
