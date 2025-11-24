"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { MuseumArtifactItem } from "@/lib/museum";

type ArtworkCardProps = {
  artifact: MuseumArtifactItem;
  onSelect?: (artifact: MuseumArtifactItem) => void;
  layout?: "immersive" | "grid";
};

export function ArtworkCard({ artifact, onSelect, layout = "grid" }: ArtworkCardProps) {
  const hasImage = Boolean(artifact.image);

  return (
    <motion.article
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--card)] shadow-[var(--shadow-ambient)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {hasImage ? (
          <Image
            src={artifact.image!}
            alt={artifact.title}
            fill
            priority={layout === "immersive"}
            placeholder={artifact.lqip ? "blur" : "empty"}
            blurDataURL={artifact.lqip ?? undefined}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[rgba(255,255,255,0.04)] text-sm text-[var(--muted)]">
            Image arriving soon
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            background:
              "linear-gradient(120deg, rgba(213,155,246,0.20) 0%, rgba(255,170,207,0.08) 45%, rgba(14,10,20,0.45) 100%)"
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-3">
          <span className="pill">{artifact.year ?? "Undated"}</span>
          <span className="pill">{artifact.medium ?? "Medium forthcoming"}</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[var(--ink)]">{artifact.title}</h3>
          <p className={`text-sm leading-relaxed ${artifact.excerpt ? "text-[var(--muted)]" : "italic text-[var(--muted)]/70"}`}>
            {artifact.excerpt ?? "Artist note is being penned in the studio."}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(artifact)}
              className="pill hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
            >
              View
            </button>
          )}
          {artifact.slug && (
            <Link
              href={`/paintings/${artifact.slug}`}
              className="pill hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
            >
              Enter the piece
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
