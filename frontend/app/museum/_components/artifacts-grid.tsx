"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { MuseumArtifactItem } from "@/lib/museum";

import { ArtworkCard } from "./artwork-card";

type ArtifactsGridProps = {
  artifacts: MuseumArtifactItem[];
  onSelect?: (artifact: MuseumArtifactItem) => void;
};

export function ArtifactsGrid({ artifacts, onSelect }: ArtifactsGridProps) {
  if (!artifacts.length) {
    return (
      <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--card)]/60 p-12 text-center text-sm text-[var(--muted)]/80">
        The curator is preparing pieces for this space. Please return soon.
      </div>
    );
  }

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key="grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {artifacts.map((artifact) => (
          <ArtworkCard key={artifact.id} artifact={artifact} onSelect={onSelect} layout="grid" />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
