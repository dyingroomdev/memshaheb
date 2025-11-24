import Image from "next/image";
import Link from "next/link";

import type { Painting } from "@/lib/api";
import { getAmbientBackgroundStyle } from "@/lib/painting-utils";

type PaintingCardProps = {
  painting: Painting;
  colorFamily: string;
};

export function PaintingCard({ painting, colorFamily }: PaintingCardProps) {
  const ambientStyle = getAmbientBackgroundStyle(painting.lqip_data, colorFamily);

  return (
    <article className="group relative mb-6 break-inside-avoid rounded-3xl border border-white/10 bg-card/70 shadow-lg shadow-black/10 transition duration-300 hover:border-accent/60 hover:shadow-glow-soft">
      <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-70 blur-3xl" style={ambientStyle} aria-hidden />
      <div className="relative flex flex-col overflow-hidden rounded-3xl">
        <Link
          href={`/paintings/${painting.slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            {painting.image_url ? (
              <Image
                src={painting.image_url}
                alt={painting.title}
                fill
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                className="object-cover transition duration-500 group-hover:scale-105"
                priority={painting.is_featured}
                placeholder={painting.lqip_data ? "blur" : "empty"}
                blurDataURL={painting.lqip_data ?? undefined}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10 text-sm text-muted">
                Image coming soon
              </div>
            )}
          </div>
        </Link>

        <div className="relative z-10 flex flex-col gap-3 p-5">
          <header>
            <p className="text-xs uppercase tracking-[0.3em] text-muted/70">{painting.year ?? "Undated"}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">{painting.title}</h3>
          </header>
          <p className="text-sm text-muted line-clamp-2">{painting.description}</p>
          <div className="flex flex-wrap gap-2">
            {painting.medium && (
              <span className="rounded-full border border-white/10 bg-card/60 px-3 py-1 text-xs text-muted">{painting.medium}</span>
            )}
            {painting.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs text-accent">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
