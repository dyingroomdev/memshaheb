"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Howl } from "howler";

import type { RoomTheme } from "@/lib/museum";
import { MEDIA_BASE_URL } from "@/lib/config";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const DEFAULT_INTENSITY = 0.4;

export type AmbientControls = {
  ambientOn: boolean;
  intensity: number;
  setAmbient: (enabled: boolean) => void;
  toggleAmbient: () => void;
  setIntensity: (value: number) => void;
  prefersReducedMotion: boolean;
};

export function useAmbient(theme: RoomTheme): AmbientControls {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [intensity, setIntensityState] = useState(DEFAULT_INTENSITY);
  const howlRef = useRef<Howl | null>(null);
  const sourceRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem("museum_ambient");
    const storedIntensity = window.localStorage.getItem("museum_ambient_intensity");
    if (storedIntensity) {
      const parsed = Number.parseFloat(storedIntensity);
      if (!Number.isNaN(parsed)) {
        setIntensityState(clampIntensity(parsed));
      }
    }
    if (!prefersReducedMotion) {
      setEnabled(stored !== "off");
    }
    setReady(true);
  }, [prefersReducedMotion]);

  const fadeOutAndStop = useCallback(
    (duration = 300) => {
      const howl = howlRef.current;
      if (!howl) {
        return;
      }

      if (!howl.playing()) {
        howl.stop();
        howl.unload();
        howlRef.current = null;
        sourceRef.current = null;
        return;
      }

      const startVolume = howl.volume();
      howl.fade(startVolume, 0, duration);
      howl.once("fade", () => {
        howl.stop();
        howl.unload();
        howlRef.current = null;
        sourceRef.current = null;
      });
    },
    []
  );

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (prefersReducedMotion || !enabled) {
      fadeOutAndStop();
      if (typeof window !== "undefined") {
        window.localStorage.setItem("museum_ambient", "off");
      }
      return;
    }

    const src = resolveAmbientSource(theme);
    const existing = howlRef.current;

    if (existing && sourceRef.current === src) {
      existing.volume(clampIntensity(intensity));
      if (!existing.playing()) {
        existing.play();
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("museum_ambient", "on");
      }
      return;
    }

    fadeOutAndStop();

    const howl = new Howl({
      src: [src],
      loop: true,
      volume: clampIntensity(intensity)
    });
    howlRef.current = howl;
    sourceRef.current = src;
    howl.play();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("museum_ambient", "on");
    }

    return () => {
      fadeOutAndStop(200);
    };
  }, [enabled, intensity, prefersReducedMotion, ready, theme]);

  useEffect(() => {
    return () => {
      fadeOutAndStop(200);
    };
  }, [fadeOutAndStop]);

  const setAmbient = useCallback(
    (value: boolean) => {
      setEnabled(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("museum_ambient", value ? "on" : "off");
      }
    },
    []
  );

  const toggleAmbient = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("museum_ambient", next ? "on" : "off");
      }
      return next;
    });
  }, []);

  const setIntensity = useCallback((value: number) => {
    const clamped = clampIntensity(value);
    setIntensityState(clamped);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("museum_ambient_intensity", clamped.toString());
    }
    const howl = howlRef.current;
    if (howl) {
      howl.volume(clamped);
    }
  }, []);

  return useMemo(
    () => ({
      ambientOn: enabled && !prefersReducedMotion,
      intensity,
      setAmbient,
      toggleAmbient,
      setIntensity,
      prefersReducedMotion
    }),
    [enabled, intensity, prefersReducedMotion, setAmbient, setIntensity, toggleAmbient]
  );
}

function clampIntensity(value: number): number {
  if (Number.isNaN(value)) {
    return DEFAULT_INTENSITY;
  }
  return Math.min(1, Math.max(0, value));
}

function resolveAmbientSource(theme: RoomTheme): string {
  const normalizedBase = MEDIA_BASE_URL.endsWith("/media")
    ? MEDIA_BASE_URL
    : `${MEDIA_BASE_URL.replace(/\/$/, "")}/media`;

  return `${normalizedBase}/Ambient.mp3`;
}
