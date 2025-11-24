import { fetchMuseumRoomsSummary } from "@/lib/museum";
import { getSiteSettings } from "@/lib/api";

import { MuseumLanding } from "./_components/museum-landing";

export const metadata = {
  title: "Virtual Museum — Memshaheb",
  description: "Stroll through curated night-mode rooms with ambient soundscapes and collector-ready artworks."
};

export default async function MuseumPage() {
  const rooms = await fetchMuseumRoomsSummary();
  const siteSettings = await getSiteSettings().catch(() => null);
  return (
    <>
      <MuseumLanding initialRooms={rooms} />
    </>
  );
}
