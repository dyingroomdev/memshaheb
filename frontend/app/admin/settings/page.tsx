'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminHeader } from '@/components/admin/admin-header';
import { Save, Globe, Link as LinkIcon } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface SiteSettings {
  id: number;
  social_links: Record<string, string>;
  theme: Record<string, any>;
  contact_phone?: string | null;
  contact_email?: string | null;
}

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/site/settings`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setSocialLinks(data.social_links || {});
          setContactPhone(data.contact_phone || '');
          setContactEmail(data.contact_email || '');
        } else if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_BASE_URL}/site/settings`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          social_links: socialLinks,
          contact_phone: contactPhone,
          contact_email: contactEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        alert('Settings saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save settings:', errorData);
        alert(`Failed to save settings: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (platform: string, url: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Settings" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-96 bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader 
        title="Settings" 
        subtitle="Manage your site configuration and social links"
      />
      
      <div className="p-6 space-y-8">
        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-jost font-semibold text-ink">Contact</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+8801xxxxxxxxx"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hello@memshaheb.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-jost font-semibold text-ink">Social Links</h2>
          </div>
          <div className="space-y-4">
            {['twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'website'].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-ink mb-2 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={socialLinks[platform] || ''}
                  onChange={(e) => updateSocialLink(platform, e.target.value)}
                  placeholder={`https://${platform === 'website' ? 'yoursite.com' : platform + '.com/username'}`}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-2xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
