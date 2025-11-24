'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminHeader } from '@/components/admin/admin-header';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Image as ImageIcon,
  PenTool,
  Building2,
  Sparkles,
  Activity
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface Stats {
  totalViews: number;
  paintings: number;
  blogPosts: number;
  engagement: number;
  gaId?: string | null;
  gaSample?: number | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    paintings: 0,
    blogPosts: 0,
    engagement: 0,
    gaId: null,
    gaSample: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        const summaryRes = await fetch(`${API_BASE_URL}/analytics/summary`, { headers });
        const summary = summaryRes.ok ? await summaryRes.json() : null;

        setStats({
          totalViews: summary?.total_views ?? 0,
          paintings: summary?.paintings ?? 0,
          blogPosts: summary?.blog_posts ?? 0,
          engagement: 89,
          gaId: summary?.google_analytics_id ?? null,
          gaSample: summary?.ga_view_sample ?? null
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    { name: 'Total Views', value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), change: '', icon: Eye, color: 'from-blue-500 to-cyan-500' },
    { name: 'Paintings', value: stats.paintings.toString(), change: '+3', icon: ImageIcon, color: 'from-purple-500 to-pink-500' },
    { name: 'Blog Posts', value: stats.blogPosts.toString(), change: '+2', icon: PenTool, color: 'from-green-500 to-emerald-500' },
    { name: 'Engagement', value: `${stats.engagement}%`, change: '+5%', icon: Heart, color: 'from-rose-500 to-pink-500' },
  ];

  const quickActions = [
    { name: 'New Painting', icon: ImageIcon, href: '/admin/paintings', color: 'from-purple-500 to-pink-500' },
    { name: 'Write Post', icon: PenTool, href: '/admin/blog', color: 'from-green-500 to-emerald-500' },
    { name: 'Update Hero', icon: Sparkles, href: '/admin/hero', color: 'from-blue-500 to-cyan-500' },
    { name: 'Museum Setup', icon: Building2, href: '/admin/museum', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back to Memshaheb. Here's what's happening with your magazine."
      />
      
      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft hover:shadow-glow-medium transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink mb-1">{loading ? '...' : stat.value}</p>
                <p className="text-sm text-muted">{stat.name}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <h2 className="text-xl font-jost font-semibold text-ink mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.name}
                href={action.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors group"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${action.color} shadow-lg mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-ink">{action.name}</p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Google Analytics status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glow-soft"
        >
          <h2 className="text-xl font-jost font-semibold text-ink mb-2">Google Analytics</h2>
          <p className="text-sm text-muted mb-4">Track views with your GA property.</p>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted">Property</p>
              <p className="text-lg font-semibold text-ink truncate">
                {stats.gaId || 'Not configured'}
              </p>
              <p className="text-xs text-muted">
                {stats.gaSample ? `Recent views: ${stats.gaSample}` : 'Enter GA ID in Brand settings to enable tracking.'}
              </p>
            </div>
            <a
              href="/admin/brand"
              className="rounded-full px-4 py-2 border border-white/15 text-sm text-ink hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
            >
              Configure
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
