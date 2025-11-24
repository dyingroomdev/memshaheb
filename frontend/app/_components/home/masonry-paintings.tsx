"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { Painting } from "@/lib/api";

type MasonryPaintingsProps = {
  paintings: Painting[];
};

export function MasonryPaintings({ paintings }: MasonryPaintingsProps) {
  if (!paintings.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]/70">Featured works</p>
          <h3 className="font-jost text-3xl text-[var(--ink)] sm:text-4xl">Curated paintings from the current collection</h3>
        </div>
        <Link
          href="/museum"
          className="pill hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Wander the museum
        </Link>
      </div>
      <div className="columns-1 gap-6 sm:columns-2 xl:columns-3">
        {paintings.map((painting) => (
          <MasonryItem key={painting.id} painting={painting} />
        ))}
      </div>
    </section>
  );
}

function MasonryItem({ painting }: { painting: Painting }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.32, 1, 0.36, 1] }}
      className="group mb-6 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[rgba(24,19,34,0.85)] shadow-[var(--shadow-ambient)] break-inside-avoid"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {painting.image_url ? (
          <Image
            src={painting.image_url}
            alt={painting.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-[1.07]"
            placeholder={painting.lqip_data ? "blur" : "empty"}
            blurDataURL={painting.lqip_data ?? undefined}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]/70">
            Image coming soon
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(12,8,20,0.85)] via-transparent to-transparent opacity-70" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--ink)]">
          <h4 className="font-jost text-2xl">{painting.title}</h4>
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]/70">
            {painting.year ?? "Undated"} · {painting.medium ?? "Medium forthcoming"}
          </p>
        </div>
      </div>
      <div className="space-y-4 p-6 text-[var(--muted)]">
        <p className="text-sm leading-relaxed">
          {painting.description?.slice(0, 160) ?? "An abstract reflection waiting to be described."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/paintings/${painting.slug}`}
            className="pill hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Enter the piece
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
