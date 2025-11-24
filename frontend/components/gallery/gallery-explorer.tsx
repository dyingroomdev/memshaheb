"use client";

import { useMemo, useState, useTransition } from "react";

import type { Painting, PaintingListResponse } from "@/lib/api";
import { getPaintings } from "@/lib/api";
import { collectPaintingFilters, inferColorFamily, sortPaintings, type PaintingSort } from "@/lib/painting-utils";

import { PaintingCard } from "@/components/painting-card";
import { FilterBar, type FilterState } from "@/components/gallery/filter-bar";

type GalleryExplorerProps = {
  initialPaintings: Painting[];
  initialNextCursor: string | null;
};

export function GalleryExplorer({ initialPaintings, initialNextCursor }: GalleryExplorerProps) {
  const [paintings, setPaintings] = useState<Painting[]>(initialPaintings);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  const [filterState, setFilterState] = useState<FilterState>({
    query: "",
    year: null,
    medium: null,
    color: null,
    sort: "newest"
  });

  const [availableFilters, setAvailableFilters] = useState(() => collectPaintingFilters(initialPaintings));
  const [colorMap, setColorMap] = useState(() => buildColorMap(initialPaintings));

  const displayPaintings = useMemo(() => {
    const filtered = paintings.filter((painting) => {
      if (filterState.color && colorMap.get(painting.id) !== filterState.color) {
        return false;
      }
      return true;
    });

    return sortPaintings(filtered, filterState.sort);
  }, [paintings, filterState.color, filterState.sort, colorMap]);

  const handleFiltersChange = (nextFilters: FilterState) => {
    setFilterState(nextFilters);
    startTransition(async () => {
      const response = await fetchPaintings(nextFilters);
      setPaintings(response.items);
      setNextCursor(response.next_cursor ?? null);
      setColorMap(buildColorMap(response.items));
      setAvailableFilters(collectPaintingFilters(response.items));
    });
  };

  const handleLoadMore = () => {
    if (!nextCursor) {
      return;
    }
    startTransition(async () => {
      const response = await fetchPaintings(filterState, nextCursor);
      setPaintings((current) => {
        const merged = [...current, ...response.items];
        setColorMap(buildColorMap(merged));
        setAvailableFilters((currentFilters) =>
          mergeFilters(collectPaintingFilters(merged), currentFilters)
        );
        return merged;
      });
      setNextCursor(response.next_cursor ?? null);
    });
  };

  return (
    <div className="space-y-10">
      <FilterBar
        years={availableFilters.years}
        media={availableFilters.media}
        colors={availableFilters.colors}
        value={filterState}
        onChange={handleFiltersChange}
      />

      <section aria-live="polite">
        <div className="columns-1 gap-6 sm:columns-2 xl:columns-3">
          {displayPaintings.map((painting) => (
            <PaintingCard key={painting.id} painting={painting} colorFamily={colorMap.get(painting.id) ?? "Warm"} />
          ))}
        </div>

        {displayPaintings.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-card/60 p-10 text-center text-muted shadow-glow-soft">
            Nothing here yet. Try adjusting your filters or explore another medium.
          </div>
        )}

        {nextCursor && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isPending}
              className="motion-spring inline-flex items-center gap-2 rounded-full border border-accent/40 bg-transparent px-6 py-3 text-sm font-medium text-accent transition hover:-translate-y-px hover:scale-[1.02] hover:border-accent focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Loading…" : "Load more paintings"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

async function fetchPaintings(filters: FilterState, cursor?: string | null): Promise<PaintingListResponse> {
  return getPaintings({
    query: filters.query || undefined,
    year: filters.year ?? undefined,
    medium: filters.medium ?? undefined,
    limit: 24,
    cursor: cursor ?? undefined
  });
}

function mergeFilters(next: ReturnType<typeof collectPaintingFilters>, current: ReturnType<typeof collectPaintingFilters>) {
  return {
    years: Array.from(new Set([...current.years, ...next.years])).sort((a, b) => b - a),
    media: Array.from(new Set([...current.media, ...next.media])).sort((a, b) => a.localeCompare(b)),
    colors: Array.from(new Set([...current.colors, ...next.colors])).sort((a, b) => a.localeCompare(b))
  };
}

function buildColorMap(paintings: Painting[]) {
  const map = new Map<number, string>();
  for (const painting of paintings) {
    map.set(painting.id, inferColorFamily(painting));
  }
  return map;
}
