"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { MuseumArtifact, MuseumRoom, Painting } from "@/lib/api";
import { inferColorFamily } from "@/lib/painting-utils";

type RoomSceneProps = {
  room: MuseumRoom;
  artifacts: Array<MuseumArtifact & { painting: Painting | null }>;
  active: boolean;
  onFocusPainting: (painting: Painting | null) => void;
};

const DEFAULT_HOTSPOT = {
  x: 50,
  y: 50,
  depth: 0.3,
  scale: 1
};

export function MuseumRoomScene({ room, artifacts, active, onFocusPainting }: RoomSceneProps) {
  const [motionDisabled, setMotionDisabled] = useState(false);
  const roomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionDisabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const colorFamily = useMemo(() => {
    const firstPainting = artifacts.find((artifact) => artifact.painting)?.painting;
    return firstPainting ? inferColorFamily(firstPainting) : "Warm";
  }, [artifacts]);

  return (
    <section
      aria-label={room.title}
      ref={roomRef}
      className={`relative h-full w-[60vw] min-w-[320px] flex-shrink-0 snap-center rounded-[3rem] border border-white/10 bg-card/60 shadow-[0_120px_180px_-80px_rgba(10,8,20,0.6)] transition duration-700 ${active ? "opacity-100" : "opacity-40"}`}
    >
      <div
        className="absolute inset-0 -z-10 opacity-70 blur-[120px]"
        style={{
          background:
            colorFamily === "Cool"
              ? "radial-gradient(circle at 20% 20%, rgba(90, 120, 255, 0.16), transparent), radial-gradient(circle at 70% 80%, rgba(120, 180, 255, 0.12), transparent)"
              : "radial-gradient(circle at 20% 20%, rgba(213,155,246,0.18), transparent), radial-gradient(circle at 70% 80%, rgba(255,170,207,0.14), transparent)"
        }}
      />

      <div className="absolute inset-x-0 top-0 flex flex-col gap-4 p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-muted/60">Room</p>
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{room.title}</h2>
        {room.intro && <p className="max-w-lg text-sm text-muted sm:text-base">{room.intro}</p>}
      </div>

      <div className="relative flex h-full flex-col justify-end overflow-hidden">
        <div className={`relative h-[420px] w-full ${motionDisabled ? "" : "motion-spring"}`}>
          {artifacts.map((artifact) => {
            if (!artifact.painting) {
              return null;
            }
            const hotspot = { ...DEFAULT_HOTSPOT, ...(artifact.hotspot ?? {}) };
            const translateX = hotspot.x - 50;
            const translateY = hotspot.y - 50;
            const depth = clamp(0, 1, Number(hotspot.depth));
            const scale = Number(hotspot.scale ?? 1);

            return (
              <div
                key={artifact.id}
                className={`absolute cursor-pointer overflow-hidden rounded-[2rem] border border-white/20 bg-card/60 shadow-lg shadow-black/20 transition duration-500 focus-visible:border-accent/60 focus-visible:shadow-[0_0_32px_rgba(213,155,246,0.55)] hover:border-accent/60 hover:shadow-[0_0_32px_rgba(213,155,246,0.55)] ${motionDisabled ? "" : "transform-gpu"}`}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  width: `${280 * scale}px`,
                  height: `${360 * scale}px`,
                  transform: `translate(-50%, -50%) translateZ(${(1 - depth) * 120}px)`,
                  willChange: motionDisabled ? undefined : "transform"
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${artifact.painting.title}`}
                onMouseEnter={() => onFocusPainting(artifact.painting)}
                onMouseLeave={() => onFocusPainting(null)}
                onFocus={() => onFocusPainting(artifact.painting)}
                onBlur={() => onFocusPainting(null)}
              >
                {artifact.painting.image_url ? (
                  <Image
                    src={artifact.painting.image_url}
                    alt={artifact.painting.title}
                    fill
                    className="object-cover transition duration-500 hover:scale-105"
                    placeholder={artifact.painting.lqip_data ? "blur" : "empty"}
                    blurDataURL={artifact.painting.lqip_data ?? undefined}
                    sizes="280px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10 text-xs text-muted">
                    Image coming soon
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-[#130a1f]/90 via-[#130a1f]/40 to-transparent p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-muted/70">{artifact.painting.year ?? "Undated"}</p>
                    <p className="text-sm font-semibold text-ink">{artifact.painting.title}</p>
                  </div>
                  <Link
                    href={`/paintings/${artifact.painting.slug}`}
                    className="rounded-full border border-white/20 bg-card/60 px-3 py-1 text-xs text-accent transition hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    prefetch
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}
