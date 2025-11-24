"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

import { AmbientController } from "@/app/museum/_components/ambient-controller";
import { MuseumTopBar } from "@/app/museum/_components/museum-top-bar";
import { RoomScene } from "@/app/museum/_components/room-scene";
import { useMuseumRoom, useMuseumRooms } from "@/lib/museum-hooks";
import type { MuseumRoomDetail, MuseumRoomSummary } from "@/lib/museum";

type RoomDetailViewProps = {
  slug: string;
  initialRooms: MuseumRoomSummary[];
  initialDetail: MuseumRoomDetail;
  initialView: "immersive" | "grid";
  storeUrl?: string | null;
};

export function RoomDetailView({
  slug,
  initialRooms,
  initialDetail,
  initialView,
  storeUrl
}: RoomDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"immersive" | "grid">(initialView);

  const { data: rooms = initialRooms } = useMuseumRooms(initialRooms);
  const { data: detail = initialDetail } = useMuseumRoom(slug, initialDetail);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView, slug]);

  const ambientTheme = detail?.room.theme ?? "dream";
  const ambientSlot = useMemo(() => <AmbientController theme={ambientTheme} />, [ambientTheme]);

  const handleViewToggle = (view: "immersive" | "grid") => {
    setViewMode(view);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("view", view);
    const queryString = params.toString();
    const target = (queryString ? `${pathname}?${queryString}` : pathname) as Route;
    router.replace(target, { scroll: false });
  };

  const handleRoomChange = (nextSlug: string) => {
    if (!nextSlug) {
      router.push("/museum");
      return;
    }
    router.push(`/museum/${nextSlug}` as Route);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <MuseumTopBar
        rooms={rooms}
        currentRoomSlug={detail?.room.slug}
        pageIndexLabel={detail?.room.title ?? undefined}
        currentView={viewMode}
        onViewToggle={handleViewToggle}
        onRoomChange={handleRoomChange}
        ambientSlot={ambientSlot}
      />

      {detail ? (
        <RoomScene room={detail.room} artifacts={detail.artifacts} viewMode={viewMode} onViewChange={handleViewToggle} storeUrl={storeUrl} />
      ) : (
        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--card)]/60 p-12 text-center text-sm text-[var(--muted)]/80">
          Loading curated pieces...
        </div>
      )}
    </main>
  );
}
