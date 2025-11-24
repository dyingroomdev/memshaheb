"use client";

import { useMemo, useState } from "react";

import { AmbientController } from "@/app/museum/_components/ambient-controller";
import { MuseumTopBar } from "@/app/museum/_components/museum-top-bar";
import { RoomCard } from "@/app/museum/_components/room-card";
import { RoomsGrid } from "@/app/museum/_components/rooms-grid";
import { useMuseumRooms } from "@/lib/museum-hooks";
import type { MuseumRoomSummary } from "@/lib/museum";

type MuseumLandingProps = {
  initialRooms: MuseumRoomSummary[];
};

export function MuseumLanding({ initialRooms }: MuseumLandingProps) {
  const [viewMode, setViewMode] = useState<"immersive" | "grid">("immersive");
  const { data: rooms = initialRooms } = useMuseumRooms(initialRooms);

  const ambientTheme = rooms[0]?.theme ?? "dream";
  const pageLabel = viewMode === "immersive" ? "Immersive list" : "Grid view";

  const ambientSlot = useMemo(() => <AmbientController theme={ambientTheme} />, [ambientTheme]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <MuseumTopBar
        rooms={rooms}
        currentView={viewMode}
        onViewToggle={setViewMode}
        pageIndexLabel={pageLabel}
        showRoomSelect={false}
        ambientSlot={ambientSlot}
      />

      {viewMode === "immersive" ? (
        <div className="space-y-8">
          {rooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      ) : (
        <RoomsGrid rooms={rooms} />
      )}
    </main>
  );
}
