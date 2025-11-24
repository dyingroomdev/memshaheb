"use client";

import useSWR from "swr";

import {
  fetchMuseumRoomDetail,
  fetchMuseumRoomsSummary,
  type MuseumRoomDetail,
  type MuseumRoomSummary
} from "@/lib/museum";

const ROOMS_KEY = ["museum", "rooms"];

export function useMuseumRooms(initial?: MuseumRoomSummary[]) {
  return useSWR<MuseumRoomSummary[]>(ROOMS_KEY, fetchMuseumRoomsSummary, {
    fallbackData: initial,
    revalidateOnMount: initial == null,
    refreshInterval: 5 * 60 * 1000
  });
}

export function useMuseumRoom(
  slug: string,
  initial?: MuseumRoomDetail | null
) {
  return useSWR<MuseumRoomDetail | null>(
    ["museum", "room", slug],
    () => fetchMuseumRoomDetail(slug),
    {
      fallbackData: initial ?? undefined,
      revalidateOnMount: initial == null,
      refreshInterval: 5 * 60 * 1000
    }
  );
}
