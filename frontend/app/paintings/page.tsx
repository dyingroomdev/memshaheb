
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { getPaintings } from "@/lib/api";

export const metadata = {
  title: "Paintings — Memshaheb",
  description: "A gallery-grade experience blending soft motion, detailed metadata, and editorial storytelling."
};

// Avoid build-time failures if the API is unreachable during docker builds
export const dynamic = "force-dynamic";

export default async function PaintingsPage() {
  let items = [];
  let next_cursor: string | null = null;

  try {
    const response = await getPaintings({ limit: 24 });
    items = response.items ?? [];
    next_cursor = response.next_cursor ?? null;
  } catch (error) {
    // Fail soft during static generation/export; show empty state
    items = [];
    next_cursor = null;
  }

  return (
      <main className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-20 sm:px-12">
        <header className="mb-12 max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-muted/70">Gallery-grade</p>
          <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Paintings &amp; Provenance</h1>
          <p className="text-base text-muted sm:text-lg">
            Browse Memshaheb’s catalog with museum-level detail. Lyrical descriptions, metadata, and editorial context keep every
            canvas ready for collectors.
          </p>
        </header>

        <GalleryExplorer initialPaintings={items} initialNextCursor={next_cursor ?? null} />
      </div>
      </main>
  );
}
