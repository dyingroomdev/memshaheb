"use client";

import { ChevronDown, LayoutGrid, Rows } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

import type { MuseumRoomSummary, RoomTheme } from "@/lib/museum";

type MuseumTopBarProps = {
  rooms: MuseumRoomSummary[];
  currentRoomSlug?: string | null;
  pageIndexLabel?: string | null;
  currentView: "immersive" | "grid";
  onViewToggle?: (view: "immersive" | "grid") => void;
  onRoomChange?: (slug: string) => void;
  ambientSlot?: React.ReactNode;
  theme?: RoomTheme;
  showRoomSelect?: boolean;
};

export function MuseumTopBar({
  rooms,
  currentRoomSlug,
  pageIndexLabel,
  currentView,
  onViewToggle,
  onRoomChange,
  ambientSlot,
  showRoomSelect = true
}: MuseumTopBarProps) {
  const activeRoom = useMemo(() => rooms.find((room) => room.slug === currentRoomSlug), [rooms, currentRoomSlug]);

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 rounded-3xl border border-[var(--border-soft)] bg-[var(--card)]/90 p-5 shadow-[var(--shadow-ambient)] backdrop-blur md:flex-row md:items-center md:justify-between"
    >
      <nav className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-[var(--muted)]/80" aria-label="Museum breadcrumb">
        <span className="rounded-full border border-[var(--border-soft)] px-3 py-1">Museum</span>
        {showRoomSelect ? (
          <label className="relative flex items-center">
            <span className="sr-only">Select gallery room</span>
            <select
              value={activeRoom?.slug ?? ""}
              onChange={(event) => onRoomChange?.(event.target.value)}
              className="appearance-none rounded-full border border-[var(--border-soft)] bg-[rgba(24,19,34,0.9)] px-4 py-1 pr-8 text-[0.65rem] font-semibold tracking-[0.32em] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
            >
              <option value="">All rooms</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.slug}>
                  {room.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-[var(--muted)]" aria-hidden="true" />
          </label>
        ) : null}
        {pageIndexLabel && (
          <span className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-[var(--muted)]/70" aria-current="page">
            {pageIndexLabel}
          </span>
        )}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        {onViewToggle && (
          <button
            type="button"
            onClick={() => onViewToggle(currentView === "immersive" ? "grid" : "immersive")}
            className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-4 py-2 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
          >
            {currentView === "immersive" ? (
              <>
                <LayoutGrid className="h-4 w-4" />
                View in grid
              </>
            ) : (
              <>
                <Rows className="h-4 w-4" />
                View immersive
              </>
            )}
          </button>
        )}
        {ambientSlot}
      </div>
    </motion.header>
  );
}
