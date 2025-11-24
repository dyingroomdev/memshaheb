import type { MuseumArtifact as CoreMuseumArtifact, MuseumRoom as CoreMuseumRoom } from "@/lib/api";
import { getMuseumArtifacts, getMuseumRooms } from "@/lib/api";

export type RoomTheme = "dream" | "philosophy" | "memory" | "light" | "custom";

export type MuseumRoomSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  theme: RoomTheme;
  artifacts_count: number;
  spotlight_count: number;
  hero_image: string | null;
  hero_lqip?: string | null;
  year?: number | null;
  curator_note?: string | null;
};

export type MuseumArtifactItem = {
  id: string;
  title: string;
  year?: number | null;
  medium?: string | null;
  image: string | null;
  lqip?: string | null;
  wc_product_id?: number | null;
  excerpt?: string | null;
  slug?: string | null;
};

export type MuseumRoomDetail = {
  room: MuseumRoomSummary;
  artifacts: MuseumArtifactItem[];
};

const THEME_ORDER: RoomTheme[] = ["dream", "philosophy", "memory", "light"];

export async function fetchMuseumRoomsSummary(): Promise<MuseumRoomSummary[]> {
  const rawRooms = await getMuseumRooms();
  const summaries = await Promise.all(
    rawRooms.map(async (room, index) => {
      const artifacts = await getMuseumArtifacts(room.id);
      return buildRoomSummary(room, artifacts, index);
    })
  );

  return summaries;
}

export async function fetchMuseumRoomDetail(slug: string): Promise<MuseumRoomDetail | null> {
  const rooms = await getMuseumRooms();
  const roomIndex = rooms.findIndex((room) => room.slug === slug);
  if (roomIndex === -1) {
    return null;
  }

  const room = rooms[roomIndex];
  const artifactsRaw = await getMuseumArtifacts(room.id);
  const roomSummary = await buildRoomSummary(room, artifactsRaw, roomIndex);
  const artifacts = artifactsRaw.map(mapArtifactToContract);

  return {
    room: roomSummary,
    artifacts
  };
}

function buildRoomSummary(
  room: CoreMuseumRoom,
  artifacts: CoreMuseumArtifact[],
  index: number
): MuseumRoomSummary {
  const theme = (room as any)?.theme ?? inferTheme(room, index);
  const firstPainting = artifacts
    .map((artifact) => artifact.painting)
    .find((painting) => painting?.image_url);

  const subtitle = room.intro?.trim() || firstPainting?.title || null;
  const curatorNote = room.intro?.trim() || firstPainting?.description || null;
  const heroImage = firstPainting?.image_url ?? null;
  const heroLqip = firstPainting?.lqip_data ?? null;

  return {
    id: String(room.id),
    slug: room.slug,
    title: room.title,
    subtitle,
    theme,
    artifacts_count: artifacts.length,
    spotlight_count: Math.min(artifacts.length, firstPainting ? 1 : 0),
    hero_image: heroImage,
    hero_lqip: heroLqip,
    year: firstPainting?.year ?? null,
    curator_note: curatorNote
  };
}

function mapArtifactToContract(artifact: CoreMuseumArtifact): MuseumArtifactItem {
  const painting = artifact.painting;
  return {
    id: String(artifact.id),
    title: painting?.title ?? "Untitled work",
    year: painting?.year ?? null,
    medium: painting?.medium ?? null,
    image: painting?.image_url ?? null,
    lqip: painting?.lqip_data ?? null,
    wc_product_id: painting?.wc_product_id ?? null,
    excerpt: painting?.description ?? null,
    slug: painting?.slug ?? null
  };
}

function inferTheme(room: CoreMuseumRoom, index: number): RoomTheme {
  const slug = room.slug.toLowerCase();
  if (slug.includes("dream")) return "dream";
  if (slug.includes("light")) return "light";
  if (slug.includes("memory")) return "memory";
  if (slug.includes("philosophy") || slug.includes("thought")) return "philosophy";
  return THEME_ORDER[index % THEME_ORDER.length] ?? "custom";
}
