"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import type { MuseumArtifactItem, MuseumRoomSummary } from "@/lib/museum";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { ArtifactsGrid } from "./artifacts-grid";
import { ArtworkCard } from "./artwork-card";
import { ArtworkModal } from "./artwork-modal";

type RoomSceneProps = {
  room: MuseumRoomSummary;
  artifacts: MuseumArtifactItem[];
  viewMode: "immersive" | "grid";
  onViewChange?: (view: "immersive" | "grid") => void;
  storeUrl?: string | null;
};

export function RoomScene({ room, artifacts, viewMode, onViewChange, storeUrl }: RoomSceneProps) {
  const [activeArtifact, setActiveArtifact] = useState<MuseumArtifactItem | null>(null);

  const themeClass = useMemo(() => `bg-room-${room.theme ?? "custom"}`, [room.theme]);

  const handleSelect = (artifact: MuseumArtifactItem) => {
    setActiveArtifact(artifact);
  };

  const handleModalChange = (open: boolean) => {
    if (!open) {
      setActiveArtifact(null);
    }
  };

  return (
    <section className={`relative overflow-hidden rounded-3xl border border-[var(--border-soft)] ${themeClass}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(213,155,246,0.18) 0%, transparent 42%), radial-gradient(circle at 80% 10%, rgba(255,170,207,0.12) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(213,155,246,0.18) 0%, transparent 55%)"
        }}
      />

      <div className="relative z-10 space-y-10 p-6 sm:p-10">
        <div className="space-y-4">
          <h1 className="font-jost text-4xl text-[var(--ink)] sm:text-5xl">{room.title}</h1>
          <p className={`max-w-2xl text-sm leading-relaxed text-[var(--muted)] ${room.curator_note ? "" : "italic text-[var(--muted)]/70"}`}>
            {room.curator_note ?? "The curator is composing a note for this gallery."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onViewChange?.("immersive")}
              aria-pressed={viewMode === "immersive"}
              className={`pill ${viewMode === "immersive" ? "border-[var(--accent)]/50 text-[var(--accent)]" : ""}`}
            >
              Immersive stroll
            </button>
            <button
              type="button"
              onClick={() => onViewChange?.("grid")}
              aria-pressed={viewMode === "grid"}
              className={`pill ${viewMode === "grid" ? "border-[var(--accent)]/50 text-[var(--accent)]" : ""}`}
            >
              Gallery grid
            </button>
          </div>
        </div>

        {viewMode === "immersive" ? (
          <ImmersiveTrack artifacts={artifacts} onSelect={handleSelect} />
        ) : (
          <ArtifactsGrid artifacts={artifacts} onSelect={handleSelect} />
        )}
      </div>

      <ArtworkModal artifact={activeArtifact} open={Boolean(activeArtifact)} onOpenChange={handleModalChange} storeUrl={storeUrl} />
    </section>
  );
}

type ImmersiveTrackProps = {
  artifacts: MuseumArtifactItem[];
  onSelect: (artifact: MuseumArtifactItem) => void;
};

function ImmersiveTrack({ artifacts, onSelect }: ImmersiveTrackProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!artifacts.length) {
    return (
      <div className="rounded-3xl border border-[var(--border-soft)] bg-[rgba(14,10,20,0.6)] p-12 text-center text-sm text-[var(--muted)]/80">
        This corridor is preparing its next illuminated piece.
      </div>
    );
  }

  return (
    <div className="relative">
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "radial-gradient(circle at 15% 50%, rgba(213,155,246,0.18) 0%, transparent 45%), radial-gradient(circle at 75% 60%, rgba(255,170,207,0.22) 0%, transparent 55%)"
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-y-6 left-0 z-20 hidden w-16 bg-gradient-to-r from-[rgba(14,10,20,0.92)] to-transparent sm:block" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-6 right-0 z-20 hidden w-16 bg-gradient-to-l from-[rgba(14,10,20,0.92)] to-transparent sm:block" aria-hidden="true" />
      <div className="relative z-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-12 pl-2 pr-2 hide-scrollbar sm:pl-4 sm:pr-4">
        <AnimatePresence initial={false}>
          {artifacts.map((artifact) => (
            <motion.div
              key={artifact.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-[min(300px,72vw)] flex-shrink-0 snap-center"
            >
              <ArtworkCard artifact={artifact} onSelect={onSelect} layout="immersive" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
