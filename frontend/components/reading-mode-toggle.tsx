"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "memshaheb-reading-mode";

function applyReadingMode(enabled: boolean) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  if (enabled) {
    root.dataset.readingMode = "true";
  } else {
    delete root.dataset.readingMode;
  }
}

export function ReadingModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "true") {
      setEnabled(true);
      applyReadingMode(true);
    }
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      applyReadingMode(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="motion-spring inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/70 px-4 py-2 text-sm text-ink transition duration-200 hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      aria-pressed={enabled}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full transition duration-300 ${
          enabled ? "bg-accent shadow-[0_0_10px_rgba(213,155,246,0.6)]" : "bg-muted"
        }`}
      />
      <span>{enabled ? "Reading mode on" : "Reading mode off"}</span>
    </button>
  );
}
