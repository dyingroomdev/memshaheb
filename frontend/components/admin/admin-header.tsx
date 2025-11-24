'use client';

import { Search, Bell, Plus } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function AdminHeader({ title, subtitle, showAddButton, onAddClick }: AdminHeaderProps) {
  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-jost font-semibold text-ink">{title}</h1>
          {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
            <Bell className="h-5 w-5 text-muted" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full border-2 border-card" />
          </button>

          {/* Add button */}
          {showAddButton && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          )}
        </div>
      </div>
    </header>
  );
}