'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminHeader } from '@/components/admin/admin-header';
import { Save, User } from 'lucide-react';
import { FileUpload } from '@/components/admin/file-upload';
import { RichEditor } from '@/components/admin/rich-editor';
import { API_BASE_URL } from '@/lib/config';

interface Biography {
  id: number;
  name?: string;
  tagline?: string;
  quote?: string;
  quote_attribution?: string;
  rich_text?: string;
  portrait_url?: string;
  instagram_handle?: string;
  timeline?: TimelineItem[];
  updated_at: string;
}

type TimelineItem = {
  time_label: string;
  title: string;
  description: string;
};

export default function BiographyManager() {
  const [biography, setBiography] = useState<Biography | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteAttribution, setQuoteAttribution] = useState('');
  const [richText, setRichText] = useState('');
  const [portraitUrl, setPortraitUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    const fetchBiography = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/biography`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBiography(data);
          setName(data.name || '');
          setTagline(data.tagline || '');
          setQuote(data.quote || '');
          setQuoteAttribution(data.quote_attribution || '');
          setRichText(data.rich_text || '');
          setPortraitUrl(data.portrait_url || '');
          setInstagramHandle(data.instagram_handle || '');
          setTimeline(
            (data.timeline ?? []).map((item: Partial<TimelineItem> | null) => ({
              time_label: item?.time_label ?? '',
              title: item?.title ?? '',
              description: item?.description ?? ''
            }))
          );
        } else if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      } catch (error) {
        console.error('Failed to fetch biography:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBiography();
  }, []);

  const addTimelineEntry = () => {
    setTimeline((prev) => [...prev, { time_label: '', title: '', description: '' }]);
  };

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    setTimeline((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const removeTimelineEntry = (index: number) => {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_BASE_URL}/biography`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim() || null,
          tagline: tagline.trim() || null,
          quote: quote.trim() || null,
          quote_attribution: quoteAttribution.trim() || null,
          rich_text: richText,
          portrait_url: portraitUrl,
          instagram_handle: instagramHandle.trim() || null,
          timeline: sanitizeTimelinePayload(timeline)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBiography(data);
        setName(data.name || '');
        setTagline(data.tagline || '');
        setQuote(data.quote || '');
        setQuoteAttribution(data.quote_attribution || '');
        setInstagramHandle(data.instagram_handle || '');
        setTimeline(
          (data.timeline ?? []).map((item: Partial<TimelineItem> | null) => ({
            time_label: item?.time_label ?? '',
            title: item?.title ?? '',
            description: item?.description ?? ''
          }))
        );
        alert('Biography saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save biography:', errorData);
        alert(`Failed to save biography: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Failed to save biography:', error);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Biography" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/5 rounded-3xl" />
            <div className="h-64 bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader 
        title="Biography" 
        subtitle="Manage your personal biography and portrait"
      />
      
      <div className="p-6 space-y-8">
        {/* Portrait Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <h2 className="text-xl font-jost font-semibold text-ink mb-6">Portrait Image</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div className="space-y-4 mx-auto max-w-[220px] w-full lg:mx-0">
              <div className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                {portraitUrl ? (
                  <img 
                    src={portraitUrl} 
                    alt="Portrait preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-center">
                      <User className="h-16 w-16 text-muted mx-auto mb-4" />
                      <p className="text-muted">No portrait image</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@instagram_handle"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4 mx-auto max-w-[220px] w-full lg:mx-0">
              <FileUpload
                onUpload={(file) => setPortraitUrl(file.file_url)}
                accept="image/*"
                className="aspect-[3/4]"
              />
              
              {portraitUrl && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Portrait URL
                  </label>
                  <input
                    type="url"
                    value={portraitUrl}
                    onChange={(e) => setPortraitUrl(e.target.value)}
                    placeholder="https://example.com/portrait.jpg"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Biography Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name to display on the About page"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short summary shown below the name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Quote</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Highlight quote to feature on the About page"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Quote Attribution</label>
              <input
                type="text"
                value={quoteAttribution}
                onChange={(e) => setQuoteAttribution(e.target.value)}
                placeholder="Person or context for the quote"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
            </div>
          </div>

          <RichEditor
            value={richText}
            onChange={setRichText}
            onSave={handleSave}
            autoSave={false}
            className="bg-white/5 border border-white/10 rounded-3xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-jost font-semibold text-ink">Timeline</h2>
              <p className="mt-1 text-sm text-muted">
                These entries power the milestone timeline on the About page. Leave blank fields to remove an entry.
              </p>
            </div>
            <button
              type="button"
              onClick={() => addTimelineEntry()}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:bg-white/10 transition-colors"
            >
              Add Entry
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {timeline.length === 0 && (
              <p className="text-sm text-muted">No timeline entries yet. Click “Add Entry” to create one.</p>
            )}
            {timeline.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="md:w-32">
                    <label className="block text-xs font-medium text-muted uppercase tracking-[0.2em]">Time Label</label>
                  </div>
                  <input
                    type="text"
                    value={item.time_label}
                    onChange={(e) => updateTimelineItem(index, 'time_label', e.target.value)}
                    placeholder="e.g. 2024 — New collection"
                    className="flex-1 rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="md:w-32">
                    <label className="block text-xs font-medium text-muted uppercase tracking-[0.2em]">Title</label>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                    placeholder="Headline for the milestone"
                    className="flex-1 rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                  <div className="md:w-32">
                    <label className="block text-xs font-medium text-muted uppercase tracking-[0.2em]">Description</label>
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateTimelineItem(index, 'description', e.target.value)}
                    rows={3}
                    placeholder="Short description of what happened"
                    className="flex-1 rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeTimelineEntry(index)}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function sanitizeTimelinePayload(items: TimelineItem[]): TimelineItem[] {
  return items
    .map((item) => ({
      time_label: item.time_label.trim(),
      title: item.title.trim(),
      description: item.description.trim()
    }))
    .filter((item) => item.time_label && item.title && item.description);
}
