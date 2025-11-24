'use client';

import type { ComponentType } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Palette, 
  Building2, 
  PenTool, 
  Sparkles, 
  Settings,
  Search,
  Bell,
  Plus,
  Menu,
  X
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';

const navigation: { name: string; href: Route; icon: ComponentType<{ className?: string }> }[] = [
  { name: 'Dashboard', href: '/admin' as Route, icon: LayoutDashboard },
  { name: 'Hero Manager', href: '/admin/hero' as Route, icon: ImageIcon },
  { name: 'Paintings', href: '/admin/paintings' as Route, icon: Palette },
  { name: 'Museum Builder', href: '/admin/museum' as Route, icon: Building2 },
  { name: 'Blog Editor', href: '/admin/blog' as Route, icon: PenTool },
  { name: 'Brand & Social', href: '/admin/brand' as Route, icon: Sparkles },
  { name: 'Settings', href: '/admin/settings' as Route, icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0A14] via-[#1A0F2E] to-[#0E0A14]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-xl border-r border-white/10 lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
            <Logo className="h-8 w-auto" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-muted" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-accent/20 text-accent shadow-lg shadow-accent/20'
                      : 'text-muted hover:text-ink hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-accent' : ''
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/10 to-accent-2/10 border border-accent/30"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">Memshaheb</p>
                <p className="text-xs text-muted truncate">Night-mode magazine</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu className="h-5 w-5 text-muted" />
              </button>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
                <Bell className="h-5 w-5 text-muted" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full border-2 border-card" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-2" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>

        {/* Floating action button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 h-14 w-14 bg-gradient-to-r from-accent to-accent-2 rounded-2xl shadow-lg shadow-accent/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
}
