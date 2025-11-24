'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { AdminHeader } from '@/components/admin/admin-header';
import { FileUpload } from '@/components/admin/file-upload';
import { Plus, GripVertical, Edit3, Eye, Trash2, Loader2, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface HeroSlide {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  image_url: string;
  sort: number;
  created_at: string;
  updated_at: string;
}

type HeroFormState = {
  image_url: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  sort: string;
};

const createEmptyHeroForm = (): HeroFormState => ({
  image_url: '',
  title: '',
  subtitle: '',
  cta_label: '',
  cta_href: '',
  sort: '',
});

export default function HeroManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formValues, setFormValues] = useState<HeroFormState>(() => createEmptyHeroForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/hero-slides?page=1&page_size=12`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSlides(data.items || []);
        } else if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      } catch (error) {
        console.error('Failed to fetch hero slides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const openEditModal = (slide: HeroSlide) => {
    setStatusMessage(null);
    setFormValues({
      image_url: slide.image_url ?? '',
      title: slide.title ?? '',
      subtitle: slide.subtitle ?? '',
      cta_label: slide.cta_label ?? '',
      cta_href: slide.cta_href ?? '',
      sort: slide.sort !== undefined ? String(slide.sort) : '',
    });
    setEditingSlide(slide);
  };

  const closeEditModal = () => {
    setEditingSlide(null);
    setFormValues(createEmptyHeroForm());
    setStatusMessage(null);
    setSaving(false);
  };

  const handleTextChange =
    (field: keyof HeroFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleAddSlide = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      const newSlide = {
        image_url: 'https://via.placeholder.com/1920x1080/1a0f2e/ffffff?text=New+Hero+Slide',
        title: 'New Hero Slide',
        subtitle: 'Add your compelling subtitle here',
        cta_label: 'Learn More',
        cta_href: '#',
        sort: slides.length,
      };

      const response = await fetch(`${API_BASE_URL}/hero-slides`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newSlide),
      });

      if (response.ok) {
        const createdSlide = await response.json();
        setSlides((prev) => [...prev, createdSlide]);
        openEditModal(createdSlide);
        setStatusMessage({
          type: 'success',
          text: 'Hero slide created! Customize the details below.',
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to create hero slide:', errorData);
        alert(`Failed to create hero slide: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Error creating hero slide:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleSaveSlide = async () => {
    if (!editingSlide) return;

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      setSaving(true);
      setStatusMessage(null);

      const sortValue = parseInt(formValues.sort, 10);
      const payload = {
        image_url: formValues.image_url.trim(),
        title: formValues.title.trim() || null,
        subtitle: formValues.subtitle.trim() || null,
        cta_label: formValues.cta_label.trim() || null,
        cta_href: formValues.cta_href.trim() || null,
        sort: Number.isNaN(sortValue) ? undefined : sortValue,
      };

      const response = await fetch(`${API_BASE_URL}/hero-slides/${editingSlide.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.detail || 'Failed to update hero slide.';
        setStatusMessage({ type: 'error', text: message });
        setSaving(false);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        return;
      }

      const updatedSlide = await response.json();
      setSlides((prev) => prev.map((item) => (item.id === updatedSlide.id ? updatedSlide : item)));
      setEditingSlide(updatedSlide);
      setStatusMessage({ type: 'success', text: 'Hero slide updated successfully.' });
    } catch (error) {
      console.error('Error updating hero slide:', error);
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (slide: HeroSlide) => {
    if (!confirm(`Delete slide "${slide.title || 'Untitled'}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      setDeletingId(slide.id);

      const response = await fetch(`${API_BASE_URL}/hero-slides/${slide.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to delete hero slide: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        return;
      }

      setSlides((prev) => prev.filter((item) => item.id !== slide.id));
      if (editingSlide?.id === slide.id) {
        closeEditModal();
      }
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewSlide = (slide: HeroSlide) => {
    if (slide.image_url) {
      window.open(slide.image_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleModalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSaveSlide();
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Hero Manager" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Hero Manager"
        subtitle="Manage your homepage hero slides with drag-and-drop reordering"
        showAddButton
        onAddClick={handleAddSlide}
      />

      <div className="p-6">
        {slides.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="h-16 w-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">No hero slides yet</h3>
            <p className="text-muted mb-6">Create your first hero slide to showcase your work</p>
            <button
              onClick={handleAddSlide}
              className="px-6 py-3 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-2xl shadow-lg shadow-accent/30"
            >
              Create First Slide
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft hover:shadow-glow-medium transition-shadow duration-200"
              >
                <div className="flex items-center gap-6">
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted" />
                  </div>
                  <div className="h-20 w-32 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    {slide.image_url ? (
                      <img src={slide.image_url} alt={slide.title || 'Hero slide'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-accent/20 to-accent-2/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-ink truncate">
                        {slide.title || 'Untitled Slide'}
                      </h3>
                      <span className="text-xs text-muted">Sort: {slide.sort}</span>
                    </div>
                    {slide.subtitle && <p className="text-sm text-muted mb-2 truncate">{slide.subtitle}</p>}
                    {slide.cta_label && (
                      <p className="text-xs text-muted">
                        CTA: {slide.cta_label}
                        {slide.cta_href && <span className="text-muted/70"> · {slide.cta_href}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewSlide(slide)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      title="Preview image"
                    >
                      <Eye className="h-4 w-4 text-muted" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(slide)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4 text-muted" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide)}
                      disabled={deletingId === slide.id}
                      className={`p-2 rounded-xl transition-colors ${
                        deletingId === slide.id ? 'bg-red-500/20' : 'hover:bg-red-500/20'
                      }`}
                      title="Delete"
                    >
                      {deletingId === slide.id ? (
                        <Loader2 className="h-4 w-4 text-red-300 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {editingSlide && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={closeEditModal}
        >
          <div
            className="relative w-full max-w-2xl bg-card border border-white/10 rounded-3xl shadow-glow-medium p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">Edit Hero Slide</h2>
                <p className="text-sm text-muted">
                  Adjust imagery and call-to-action for this slide.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4 text-muted" />
              </button>
            </div>

            {statusMessage && (
              <div
                className={`mt-4 rounded-xl border px-4 py-2 text-sm ${
                  statusMessage.type === 'error'
                    ? 'border-red-500/40 bg-red-500/10 text-red-200'
                    : 'border-green-500/40 bg-green-500/10 text-green-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="mt-6 space-y-5">
              <div className="flex flex-col gap-3 text-sm text-muted">
                <span>Image</span>
                <input
                  type="url"
                  value={formValues.image_url}
                  onChange={handleTextChange('image_url')}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="https://..."
                />
                <FileUpload
                  onUpload={(file) =>
                    setFormValues((prev) => ({
                      ...prev,
                      image_url: file.file_url,
                    }))
                  }
                  className="bg-white/5"
                />
                {formValues.image_url && (
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <img
                      src={formValues.image_url}
                      alt={formValues.title || 'Hero preview'}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-muted">
                  Title
                  <input
                    type="text"
                    value={formValues.title}
                    onChange={handleTextChange('title')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-muted">
                  Subtitle
                  <input
                    type="text"
                    value={formValues.subtitle}
                    onChange={handleTextChange('subtitle')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-muted">
                  CTA Label
                  <input
                    type="text"
                    value={formValues.cta_label}
                    onChange={handleTextChange('cta_label')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-muted">
                  CTA Link
                  <input
                    type="url"
                    value={formValues.cta_href}
                    onChange={handleTextChange('cta_href')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm text-muted">
                Sort Order
                <input
                  type="number"
                  min="0"
                  value={formValues.sort}
                  onChange={handleTextChange('sort')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-muted hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
