import { notFound } from "next/navigation";

import { fetchMuseumRoomDetail, fetchMuseumRoomsSummary } from "@/lib/museum";
import { getSiteSettings } from "@/lib/api";

import { RoomDetailView } from "../_components/room-detail-view";

type RoomPageProps = {
  params: { room: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: RoomPageProps) {
  const detail = await fetchMuseumRoomDetail(params.room);
  if (!detail) {
    return {
      title: "Museum Room",
      description: "This curated room could not be found."
    };
  }

  return {
    title: `${detail.room.title} — Virtual Museum`,
    description: detail.room.curator_note ?? "Explore a curated virtual room of paintings."
  };
}

export default async function MuseumRoomPage({ params, searchParams }: RoomPageProps) {
  const [rooms, detail, siteSettings] = await Promise.all([
    fetchMuseumRoomsSummary(),
    fetchMuseumRoomDetail(params.room),
    getSiteSettings().catch(() => null)
  ]);

  if (!detail) {
    notFound();
  }

  const viewParam = normalizeView(searchParams?.view);
  const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL ?? null;

  return (
    <>
    <RoomDetailView
      slug={detail.room.slug}
      initialRooms={rooms}
      initialDetail={detail}
      initialView={viewParam}
      storeUrl={storeUrl}
    />
    </>
  );
}

function normalizeView(viewParam?: string | string[]): "immersive" | "grid" {
  const value = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  return value === "grid" ? "grid" : "immersive";
}
