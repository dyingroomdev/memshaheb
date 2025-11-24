"use client";

import type { ComponentType } from "react";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  Brush,
  Building2,
  ChevronLeft,
  ChevronRight,
  Grid,
  Home,
  Image,
  LayoutDashboard,
  Palette,
  Settings,
  Sun
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: Route;
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin" as Route, icon: LayoutDashboard },
  { label: "Hero Manager", href: "/admin/hero" as Route, icon: Image },
  { label: "Paintings", href: "/admin/paintings" as Route, icon: Palette },
  { label: "Museum Builder", href: "/admin/museum" as Route, icon: Building2 },
  { label: "Blog Editor", href: "/admin/blog" as Route, icon: Sun },
  { label: "Brand & Social", href: "/admin/brand" as Route, icon: Brush },
  { label: "Settings", href: "/admin/settings" as Route, icon: Settings }
];

type SidebarProps = {
  activePath: string;
};

export function AdminSidebar({ activePath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setCollapsed(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 88 : 260 }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[rgba(24,19,34,0.75)] px-4 py-6 text-muted shadow-[0_40px_80px_-40px_rgba(10,8,20,0.65)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-2">
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -20 : 0 }}
          transition={{ duration: 0.2 }}
          className="font-display text-lg font-semibold text-ink"
        >
          Memshaheb
        </motion.div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-card/60 text-muted transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = activePath.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition ${
                active
                  ? "border-accent/60 bg-accent/20 text-ink shadow-[0_10px_30px_-15px_rgba(213,155,246,0.8)]"
                  : "text-muted hover:border-accent/40 hover:bg-accent/10 hover:text-ink"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-accent" : "text-muted/80"}`} />
              {!collapsed && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-accent/10 px-4 py-4 text-xs text-muted shadow-inner">
        {!collapsed ? (
          <>
            <p className="font-semibold text-ink">Night studio tip</p>
            <p className="mt-1 text-muted">
              Drafts save automatically. Undo with ⌘Z / Ctrl+Z if you change your mind.
            </p>
          </>
        ) : (
          <Grid className="mx-auto h-4 w-4 text-accent" />
        )}
      </div>
    </motion.aside>
  );
}
