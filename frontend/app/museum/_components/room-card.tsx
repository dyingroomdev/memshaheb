"use client";

import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";

import { useParallax } from "@/hooks/use-parallax";
import type { MuseumArtifactItem, MuseumRoomSummary } from "@/lib/museum";

type RoomCardProps = {
  room: MuseumRoomSummary;
  spotlight?: MuseumArtifactItem | null;
  index?: number;
};

export const RoomCard = memo(function RoomCard({ room, spotlight, index = 0 }: RoomCardProps) {
  const { style, onPointerLeave, onPointerMove } = useParallax();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="grid grid-cols-1 gap-6 rounded-3xl border border-[var(--border-soft)] bg-[var(--card)] p-6 shadow-[var(--shadow-ambient)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
    >
      <div className="flex flex-col gap-4">
        <header className="space-y-2">
          <h2 className="font-jost text-3xl text-[var(--ink)]">{room.title}</h2>
          {room.subtitle && <p className="text-sm text-[var(--muted)]">{room.subtitle}</p>}
        </header>
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill">
            Featuring {room.artifacts_count} {room.artifacts_count === 1 ? "story" : "stories"} on canvas
          </span>
          <span className="pill">
            Now illuminating {room.spotlight_count || (spotlight ? 1 : 0)}
          </span>
          <Link href={`/museum/${room.slug}`} className="btn-primary" aria-label={`Enter ${room.title}`}>
            Enter room
          </Link>
        </div>
        <p className="flex items-center gap-2 text-xs text-[var(--muted)]/80">
          <Info className="h-4 w-4" aria-hidden="true" />
          {room.curator_note ?? "Curator’s note is being prepared for this gallery."}
        </p>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-room-custom parallax-wrapper"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {room.hero_image ? (
          <Image
            src={room.hero_image}
            alt={`${room.title} preview`}
            fill
            placeholder={room.hero_lqip ? "blur" : "empty"}
            blurDataURL={room.hero_lqip ?? undefined}
            className="parallax-item h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        ) : (
          <div className="parallax-item flex h-full w-full items-center justify-center bg-room-custom text-sm text-[var(--muted)]/70">
            Visual is in the works.
          </div>
        )}
      </motion.div>
    </motion.article>
  );
});
