'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminHeader } from '@/components/admin/admin-header';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Eye,
  Clock,
  History,
  Trash2,
  Loader2,
} from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface BlogPost {
  id: number;
  title: string;
  excerpt?: string | null;
  content_md: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  slug: string;
  tags?: string[] | null;
  cover_url?: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  author_id?: number | null;
}

type Category = {
  id: number;
  name: string;
  slug: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const getWordCount = (content: string) => {
  if (!content.trim()) return 0;
  return content.trim().split(/\s+/).length;
};

const API_BASE = API_BASE_URL;

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const [postsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE}/blogs/admin`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }),
          fetch(`${API_BASE}/blog-categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }),
        ]);

        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.items || []);
        } else if (postsRes.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(catData || []);
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getStatus = (post: BlogPost) => {
    if (post.published_at) return 'published';
    return 'draft';
  };

  const handleAddPost = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      const newPost = {
        title: 'Untitled Post',
        content_md: '# New Post\n\nStart writing your content here...',
        tags: [],
        excerpt: '',
      };

      const response = await fetch(`${API_BASE}/blogs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        const createdPost: BlogPost = await response.json();
        setPosts((prev) => [createdPost, ...prev]);
        window.location.href = `/admin/blog/${createdPost.id}/editor`;
      } else {
        const errorData = await response.json();
        console.error('Failed to create blog post:', errorData);
        alert(`Failed to create blog post: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/admin/login';
        return;
      }

      setDeletingId(post.id);

      const response = await fetch(`${API_BASE}/blogs/${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to delete blog post: ${errorData.detail || response.statusText}`);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        return;
      }

      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewPost = (post: BlogPost) => {
    window.open(`/blogs/${post.slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleEditPost = (post: BlogPost) => {
    window.location.href = `/admin/blog/${post.id}/editor`;
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Blog" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredPosts = filterCategory
    ? posts.filter((post) => post.category?.id === Number(filterCategory))
    : posts;

  return (
    <div>
      <AdminHeader
        title="Blog"
        subtitle="Memshaheb Magazine — manage stories, categories, and voices"
        showAddButton
        onAddClick={handleAddPost}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search posts..."
              className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              disabled
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-muted">
            <Filter className="h-4 w-4" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-sm text-ink focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="h-16 w-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">No blog posts yet</h3>
            <p className="text-muted mb-6">Start sharing your thoughts and insights with your first post</p>
            <button
              onClick={handleAddPost}
              className="px-6 py-3 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-2xl shadow-lg shadow-accent/30"
            >
              Write First Post
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft hover:shadow-glow-medium transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-ink truncate">{post.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          getStatus(post) === 'published'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {getStatus(post)}
                      </span>
                    </div>
                    {post.excerpt && <p className="text-sm text-muted mb-3 line-clamp-2">{post.excerpt}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.published_at ?? post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Updated {formatDate(post.updated_at)}
                      </span>
                      <span>{getWordCount(post.content_md)} words</span>
                      {post.category && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
                          {post.category.name}
                        </span>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && <span className="text-muted">+{post.tags.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleViewPost(post)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4 text-muted" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditPost(post)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4 text-muted" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      disabled={deletingId === post.id}
                      className={`p-2 rounded-xl transition-colors ${
                        deletingId === post.id ? 'bg-red-500/20' : 'hover:bg-red-500/20'
                      }`}
                      title="Delete"
                    >
                      {deletingId === post.id ? (
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <h2 className="text-xl font-jost font-semibold text-ink mb-4">MDX Editor Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl">
              <h3 className="font-semibold text-ink mb-2">Slash Commands</h3>
              <p className="text-sm text-muted">Type /quote, /image, /callout for quick formatting</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
              <h3 className="font-semibold text-ink mb-2">Auto-save</h3>
              <p className="text-sm text-muted">Your work is saved automatically every 10 seconds</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
              <h3 className="font-semibold text-ink mb-2">Version History</h3>
              <p className="text-sm text-muted">Track changes with diff view and restore points</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
