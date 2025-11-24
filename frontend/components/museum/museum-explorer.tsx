"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { MuseumArtifact, MuseumRoom, Painting } from "@/lib/api";
import { inferColorFamily } from "@/lib/painting-utils";

import { MuseumControls } from "@/components/museum/museum-controls";
import { MuseumRoomScene } from "@/components/museum/museum-room-scene";
import { AmbientSoundToggle } from "@/components/museum/ambient-sound-toggle";

type ArtifactEntry = MuseumArtifact & { painting?: Painting | null };

type RoomWithArtifacts = MuseumRoom & {
  artifacts: ArtifactEntry[];
};

type MuseumExplorerProps = {
  rooms: RoomWithArtifacts[];
  initialRoomSlug?: string;
  initialViewMode?: "scene" | "grid";
};

const DEFAULT_INTRO =
  "Move through this moonlit gallery to explore paintings arranged by tone, texture, and mood.";

export function MuseumExplorer({ rooms, initialRoomSlug, initialViewMode = "scene" }: MuseumExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialIndex = useMemo(() => {
    if (!rooms.length) {
      return 0;
    }
    const found = rooms.findIndex((room) => room.slug === initialRoomSlug);
    return found >= 0 ? found : 0;
  }, [rooms, initialRoomSlug]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<"scene" | "grid">(() => (initialViewMode === "grid" ? "grid" : "scene"));
  const [focusedPainting, setFocusedPainting] = useState<Painting | null>(null);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setFocusedPainting(null);
  }, [activeIndex, viewMode]);

  useEffect(() => {
    if (!rooms.length) {
      setFocusedPainting(null);
    }
  }, [rooms.length]);

  const safeIndex = rooms.length ? Math.max(0, Math.min(activeIndex, rooms.length - 1)) : 0;
  const activeRoom = rooms.length ? rooms[safeIndex] : null;
  const activeSlug = activeRoom?.slug ?? "";
  const artifacts = activeRoom?.artifacts ?? [];

  const defaultPainting = useMemo(() => {
    for (const artifact of artifacts) {
      if (artifact.painting) {
        return artifact.painting;
      }
    }
    return null;
  }, [artifacts]);

  const featurePainting = focusedPainting ?? defaultPainting;

  const galleryEntries = useMemo(() => artifacts.slice(), [artifacts]);

  useEffect(() => {
    if (!rooms.length) {
      return;
    }
    const currentParams = new URLSearchParams(searchParams?.toString());
    const nextParams = new URLSearchParams(currentParams.toString());

    if (activeSlug) {
      nextParams.set("room", activeSlug);
    } else {
      nextParams.delete("room");
    }
    nextParams.set("view", viewMode);

    const nextString = nextParams.toString();
    if (nextString !== currentParams.toString()) {
      const nextUrl = nextString ? `${pathname}?${nextString}` : pathname;
      router.replace(nextUrl as Route, { scroll: false });
    }
  }, [activeSlug, viewMode, rooms.length, pathname, router, searchParams]);

  return (
    <div className="space-y-10">
      <MuseumControls
        rooms={rooms}
        activeIndex={safeIndex}
        onRoomChange={(index) => setActiveIndex(index)}
        viewMode={viewMode}
        onToggleView={() => setViewMode((mode) => (mode === "scene" ? "grid" : "scene"))}
        focusedPainting={featurePainting}
        ambientControl={<AmbientSoundToggle />}
      />

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-glow-soft">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-6 p-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{activeRoom?.title ?? "Museum"}</h1>
              {activeRoom?.intro ? (
                <div
                  className="prose prose-invert max-w-2xl text-sm text-muted sm:text-base [&_p]:mb-3 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: activeRoom.intro }}
                />
              ) : (
                <p className="max-w-2xl text-sm text-muted sm:text-base">{DEFAULT_INTRO}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-muted/70">
                {artifacts.length} {artifacts.length === 1 ? "artifact" : "artifacts"}
              </span>
              {featurePainting && (
                <Link
                  href={`/paintings/${featurePainting.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-4 py-2 text-xs font-medium text-accent transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  View painting
                </Link>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 p-6 text-sm text-muted">
              {featurePainting ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-muted/70">Currently spotlighting</p>
                  <p className="text-lg font-semibold text-ink">{featurePainting.title}</p>
                  <p className="text-xs uppercase tracking-[0.32em] text-muted/60">
                    {featurePainting.year ?? "Undated"} · {featurePainting.medium ?? "Mixed media"}
                    {featurePainting.dimensions ? ` · ${featurePainting.dimensions}` : ""}
                  </p>
                </div>
              ) : (
                <p>No published paintings have been assigned to this room yet.</p>
              )}
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden bg-black/10">
            {featurePainting?.image_url ? (
              <Image
                src={featurePainting.image_url}
                alt={featurePainting.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10 text-sm text-muted">
                Feature image coming soon
              </div>
            )}
          </div>
        </div>
      </section>

      {viewMode === "scene" ? (
        <section className="rounded-3xl border border-white/10 bg-card/60 p-6 shadow-glow-soft">
          {artifacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-card/40 p-10 text-center text-sm text-muted">
              No artifacts have been assigned to this room yet. Add paintings from the admin dashboard to bring this
              gallery to life.
            </div>
          ) : (
            <MuseumRoomScene
              room={activeRoom!}
              artifacts={artifacts.map((artifact) => ({
                ...artifact,
                painting: artifact.painting ?? null
              }))}
              active
              onFocusPainting={(painting) => setFocusedPainting(painting)}
            />
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Gallery Collection</h2>
            <p className="text-sm text-muted">Select a painting to open its detail page.</p>
          </div>

          {galleryEntries.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-card/70 p-12 text-center text-muted">
              No artifacts have been assigned to this room yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {galleryEntries.map((artifact) => (
                <RoomPaintingCard key={artifact.id} artifact={artifact} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function RoomPaintingCard({ artifact }: { artifact: ArtifactEntry }) {
  const painting = artifact.painting ?? null;
  const colorFamily = painting ? inferColorFamily(painting) : "Warm";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow-soft">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {painting?.image_url ? (
          <Image
            src={painting.image_url}
            alt={painting.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/15 to-accent-2/20 text-sm text-muted">
            Image coming soon
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              colorFamily === "Cool"
                ? "linear-gradient(180deg, rgba(120,180,255,0.16) 0%, transparent 40%, rgba(18,10,31,0.85) 100%)"
                : "linear-gradient(180deg, rgba(213,155,246,0.18) 0%, transparent 40%, rgba(18,10,31,0.85) 100%)"
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-muted/60">{painting?.year ?? "Undated"}</p>
          <h3 className="text-xl font-semibold text-ink">{painting?.title ?? "Untitled"}</h3>
          <p className="text-sm text-muted">
            {painting?.medium ?? "Mixed media"}
            {painting?.dimensions ? ` · ${painting.dimensions}` : ""}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.32em] text-muted/60">
          <span>Sort {artifact.sort + 1}</span>
          {painting ? (
            <Link
              href={`/paintings/${painting.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-accent transition hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              View
            </Link>
          ) : (
            <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-muted">Unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
