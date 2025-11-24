import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeepZoomModal } from "@/components/deep-zoom-modal";
import { PaintingMetadata } from "@/components/painting-metadata";
import { RelatedWorksCarousel } from "@/components/related-works-carousel";
import { getCommerceProducts, getPainting, getPaintings, getWooCommerceBadgeForPainting, getSiteSettings } from "@/lib/api";
import {
  getAmbientBackgroundStyle,
  inferColorFamily,
  selectRelatedPaintings,
  sortPaintings
} from "@/lib/painting-utils";

type PaintingPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PaintingPageProps) {
  const painting = await getPainting(params.slug);
  if (!painting) {
    return {};
  }
  return {
    title: `${painting.title} — Paintings — Memshaheb`,
    description: painting.description ?? "Explore this painting from the Memshaheb night-mode catalog."
  };
}

export default async function PaintingDetailPage({ params }: PaintingPageProps) {
  const painting = await getPainting(params.slug);
  if (!painting) {
    notFound();
  }

  const [{ items: candidates }, commerceProducts, siteSettings] = await Promise.all([
    getPaintings({ limit: 60 }),
    getCommerceProducts({ kind: "PAINTING" }),
    getSiteSettings().catch(() => null)
  ]);

  const badge = await getWooCommerceBadgeForPainting(painting.id, painting.wc_product_id, commerceProducts);
  const related = selectRelatedPaintings(painting, candidates, 6);
  const ordered = sortPaintings(candidates, "newest");
  const index = ordered.findIndex((item) => item.id === painting.id);
  const previous = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;
  const colorFamily = inferColorFamily(painting);

  const ambientStyle = getAmbientBackgroundStyle(painting.lqip_data, colorFamily);
  const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL ?? null;

  return (
    <>
    <main className="bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 blur-3xl opacity-70" style={ambientStyle} />
        <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-20 sm:px-12">
          <nav className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-muted/60">
            {previous && (
              <Link
                href={`/paintings/${previous.slug}`}
                prefetch
                className="rounded-full border border-white/10 px-3 py-1 transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                ← {previous.title}
              </Link>
            )}
            <span className="flex-1 text-center text-muted/40">Paintings</span>
            {next && (
              <Link
                href={`/paintings/${next.slug}`}
                prefetch
                className="rounded-full border border-white/10 px-3 py-1 transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                {next.title} →
              </Link>
            )}
          </nav>

          <header className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/80 shadow-glow-soft">
              <div className="relative aspect-[4/5]">
                {painting.image_url ? (
                  <Image
                    src={painting.image_url}
                    alt={painting.title}
                    fill
                    sizes="(max-width: 1024px) 90vw, 50vw"
                    className="object-cover"
                    placeholder={painting.lqip_data ? "blur" : "empty"}
                    blurDataURL={painting.lqip_data ?? undefined}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/15 to-accent-2/15 text-sm text-muted">
                    Image coming soon
                  </div>
                )}
              </div>
              {painting.image_url && (
                <div className="absolute right-6 top-6 flex gap-3">
                  <DeepZoomModal imageUrl={painting.image_url} title={painting.title} lqip={painting.lqip_data ?? undefined} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-3 rounded-3xl border border-white/10 bg-card/70 p-6 shadow-lg shadow-black/10">
                <p className="text-xs uppercase tracking-[0.32em] text-muted/60">{painting.year ?? "Undated"}</p>
                <h1 className="text-4xl font-semibold text-ink sm:text-5xl">{painting.title}</h1>
                <p
                  className={`text-base leading-relaxed sm:text-lg ${
                    painting.description ? "text-muted" : "text-muted/70 italic"
                  }`}
                >
                  {painting.description?.trim() || "A new artwork waiting to be described."}
                </p>
              </div>

              <PaintingMetadata painting={painting} badge={badge} storeUrl={storeUrl} />
            </div>
          </header>

          <RelatedWorksCarousel paintings={related} />
        </div>
      </div>
    </main>
  </>
);
}
