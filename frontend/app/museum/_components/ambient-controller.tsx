"use client";

import { Volume2, VolumeX } from "lucide-react";
import { memo } from "react";

import type { RoomTheme } from "@/lib/museum";
import { useAmbient } from "@/hooks/use-ambient";

type AmbientControllerProps = {
  theme: RoomTheme;
};

export const AmbientController = memo(function AmbientController({ theme }: AmbientControllerProps) {
  const { ambientOn, toggleAmbient, intensity, setIntensity, prefersReducedMotion } = useAmbient(theme);

  const disabled = prefersReducedMotion;
  const sliderDisabled = disabled || !ambientOn;

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <button
        type="button"
        onClick={toggleAmbient}
        disabled={disabled}
        aria-pressed={ambientOn}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(255,255,255,0.04)] text-sm text-[var(--muted)] transition ${
          ambientOn ? "ring-2 ring-[var(--accent)] text-[var(--accent)]" : ""
        } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-[var(--border-strong)]"}`}
        aria-label={ambientOn ? "Turn ambient sound off" : "Turn ambient sound on"}
      >
        {ambientOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <label className="flex items-center gap-2 text-xs text-[var(--muted)]" aria-disabled={sliderDisabled}>
        <span className="hidden sm:inline">Intensity</span>
        <input
          type="range"
          className="h-1 w-28 cursor-pointer rounded-full bg-[var(--border-soft)] accent-[var(--accent)] disabled:cursor-not-allowed"
          min={10}
          max={100}
          step={5}
          value={Math.round(intensity * 100)}
          disabled={sliderDisabled}
          onChange={(event) => setIntensity(Number(event.target.value) / 100)}
          aria-label="Ambient sound intensity"
        />
      </label>
    </div>
  );
});
