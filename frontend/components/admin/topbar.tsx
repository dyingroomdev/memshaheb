"use client";

import { motion } from "framer-motion";
import { Bell, Search, UserCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type TopbarProps = {
  onLogout?: () => void;
};

export function AdminTopbar({ onLogout }: TopbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2.5rem] border border-white/10 bg-[rgba(24,19,34,0.85)] px-6 py-4 text-muted shadow-[0_30px_60px_-30px_rgba(10,8,20,0.6)] backdrop-blur-xl">
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <label htmlFor="admin-search" className="sr-only">
          Search dashboard
        </label>
        <input
          id="admin-search"
          type="search"
          placeholder="Search modules, entries, or commands…"
          className="w-full rounded-full border border-white/10 bg-[#1a1326] px-11 py-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70" />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1a1326] text-muted transition hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-accent/90 shadow-[0_0_10px_rgba(213,155,246,0.9)]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1a1326] px-3 py-2 text-sm text-ink transition hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-accent/50">
              <Image
                src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=96&q=80"
                alt="Profile avatar"
                fill
                className="object-cover"
              />
            </div>
            <span className="hidden sm:inline">Memshaheb</span>
            <UserCircle className="hidden h-4 w-4 text-muted/70 sm:inline" />
          </button>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#1a1326] p-2 text-sm text-muted shadow-lg"
            >
              <button className="w-full rounded-xl px-4 py-2 text-left transition hover:bg-accent/10 hover:text-ink">
                Edit Profile
              </button>
              <button
                className="w-full rounded-xl px-4 py-2 text-left transition hover:bg-accent/10 hover:text-danger"
                onClick={onLogout}
              >
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
