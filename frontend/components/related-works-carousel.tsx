import Image from "next/image";
import Link from "next/link";

import type { Painting } from "@/lib/api";

type RelatedWorksCarouselProps = {
  paintings: Painting[];
  title?: string;
};

export function RelatedWorksCarousel({ paintings, title = "Related works" }: RelatedWorksCarouselProps) {
  if (paintings.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
      </div>
      <div className="flex snap-x gap-6 overflow-x-auto pb-4">
        {paintings.map((painting) => (
          <Link
            key={painting.id}
            href={`/paintings/${painting.slug}`}
            className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-lg shadow-black/10 transition duration-300 hover:border-accent/60 hover:shadow-glow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            prefetch
          >
            <div className="relative h-64 w-full overflow-hidden">
              {painting.image_url ? (
                <Image
                  src={painting.image_url}
                  alt={painting.title}
                  fill
                  sizes="256px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  placeholder={painting.lqip_data ? "blur" : "empty"}
                  blurDataURL={painting.lqip_data ?? undefined}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10 text-xs text-muted">
                  Image coming soon
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted/70">{painting.year ?? "Undated"}</p>
              <p className="mt-2 text-sm font-semibold text-ink">{painting.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
