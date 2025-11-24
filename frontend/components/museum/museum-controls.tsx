"use client";

import Link from "next/link";

import type { MuseumRoom, Painting } from "@/lib/api";

type MuseumControlsProps = {
  rooms: MuseumRoom[];
  activeIndex: number;
  onRoomChange: (index: number) => void;
  viewMode: "scene" | "grid";
  onToggleView: () => void;
  focusedPainting: Painting | null;
  ambientControl: React.ReactNode;
};

export function MuseumControls({
  rooms,
  activeIndex,
  onRoomChange,
  viewMode,
  onToggleView,
  focusedPainting,
  ambientControl
}: MuseumControlsProps) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.32em] text-muted/60">
        <Link
          href="/museum"
          className="rounded-full border border-transparent px-3 py-1 transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Museum
        </Link>
        <span className="text-muted/40">/</span>

        <div className="relative">
          <select
            value={rooms[activeIndex]?.slug ?? ""}
            onChange={(event) => {
              const index = rooms.findIndex((room) => room.slug === event.target.value);
              if (index >= 0) {
                onRoomChange(index);
              }
            }}
            className="rounded-full border border-white/10 bg-[#141020] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.38em] text-ink focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.slug}>
                {room.title}
              </option>
            ))}
          </select>
        </div>

        {focusedPainting && (
          <>
            <span className="text-muted/40">/</span>
            <Link
              href={`/paintings/${focusedPainting.slug}`}
              className="rounded-full border border-transparent px-3 py-1 transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {focusedPainting.title}
            </Link>
          </>
        )}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleView}
          className="motion-spring rounded-full border border-accent/40 bg-transparent px-4 py-2 text-sm font-medium text-accent transition hover:-translate-y-px hover:scale-[1.02] hover:border-accent focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          {viewMode === "scene" ? "View in grid" : "View rooms"}
        </button>
        {ambientControl}
      </div>
    </header>
  );
}
