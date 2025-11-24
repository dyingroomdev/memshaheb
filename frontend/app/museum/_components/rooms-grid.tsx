"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { MuseumRoomSummary } from "@/lib/museum";

type RoomsGridProps = {
  rooms: MuseumRoomSummary[];
};

export function RoomsGrid({ rooms }: RoomsGridProps) {
  if (!rooms.length) {
    return (
      <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--card)]/60 p-12 text-center text-sm text-[var(--muted)]/80">
        Rooms are being curated. Please check back soon.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {rooms.map((room, index) => {
        const themeClass = `bg-room-${room.theme ?? "custom"}`;
        return (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -3 }}
            className="relative overflow-hidden rounded-3xl border border-[var(--border-soft)] shadow-[var(--shadow-ambient)]"
          >
            <Link
              href={`/museum/${room.slug}`}
              className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
            >
              <div className="relative h-56 overflow-hidden">
                {room.hero_image ? (
                  <Image
                    src={room.hero_image}
                  alt={`${room.title} preview`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  placeholder={room.hero_lqip ? "blur" : "empty"}
                  blurDataURL={room.hero_lqip ?? undefined}
                  />
                ) : (
                  <div className={`h-full w-full ${themeClass}`} aria-hidden="true" />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[rgba(14,10,20,0.85)] via-transparent to-transparent"
                />
            </div>
            <div className="flex flex-col gap-3 p-6">
              <h3 className="font-jost text-2xl text-[var(--ink)]">{room.title}</h3>
              <p className={`text-sm ${room.subtitle ? "text-[var(--muted)]" : "italic text-[var(--muted)]/70"}`}>
                {room.subtitle ?? "Curator subtitle is in progress."}
              </p>
              <span className="pill self-start">Now illuminating {room.spotlight_count || 0}</span>
            </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
