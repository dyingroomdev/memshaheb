'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { Logo } from './logo';
import { SIDEBAR_ITEMS, type SidebarItem } from './sidebarConfig';

function isActivePath(pathname: string, path?: string) {
  if (!path) return false;
  return pathname === path || pathname.startsWith(path + '/');
}

function hasActiveChild(pathname: string, item: SidebarItem): boolean {
  if (isActivePath(pathname, item.path)) return true;
  if (item.children) {
    return item.children.some((child) => hasActiveChild(pathname, child));
  }
  return false;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    SIDEBAR_ITEMS.forEach((item) => {
      if (item.sectionKey) state[item.sectionKey] = true; // always open
    });
    return state;
  });

  const logout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const renderItems = (items: SidebarItem[], depth = 0) => (
    <div className={depth === 0 ? 'space-y-1' : 'space-y-1 pl-4'}>
      {items.map((item) => {
        const active = isActivePath(pathname, item.path);
        const hasChildren = !!item.children?.length;
        const open = item.sectionKey ? openSections[item.sectionKey] : false;

        if (hasChildren) {
          return (
            <div key={item.label} className="space-y-1">
              <div
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${
                  hasActiveChild(pathname, item) ? 'text-accent' : 'text-muted'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-muted">
                  {item.icon}
                </span>
                <div className="flex-1 text-sm font-semibold uppercase tracking-[0.16em]">{item.label}</div>
              </div>
              {open && (
                <div className="space-y-1">
                  {renderItems(item.children!, depth + 1)}
                </div>
              )}
            </div>
          );
        }

        const isLogout = item.label.toLowerCase() === 'logout';

        return (
          <div key={item.label} className="space-y-1">
            <Link
              href={item.path || '#'}
              onClick={(e) => {
                if (isLogout) {
                  e.preventDefault();
                  logout();
                }
              }}
              className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors ${
                active ? 'bg-accent/15 text-accent shadow-lg shadow-accent/20' : 'text-muted hover:text-ink hover:bg-white/5'
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-muted group-hover:text-ink">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              {active && (
                <motion.div layoutId="activeNav" className="absolute inset-0 rounded-2xl border border-accent/40" />
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
        <Logo className="h-8 w-auto" />
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-4">
        {renderItems(SIDEBAR_ITEMS)}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card/80 backdrop-blur-xl border border-white/10 text-ink hover:bg-white/10 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:bg-gradient-to-b lg:from-[#080516] lg:to-[#050313] lg:border-r lg:border-white/10">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#080516] to-[#050313] border-r border-white/10"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
