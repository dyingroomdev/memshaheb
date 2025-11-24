"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type DeepZoomModalProps = {
  imageUrl: string;
  title: string;
  lqip?: string | null;
};

export function DeepZoomModal({ imageUrl, title, lqip }: DeepZoomModalProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointerMap = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastDistance = useRef<number | null>(null);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    pointerMap.current.clear();
    lastDistance.current = null;
    lastPanPoint.current = null;
  };

  const handleOpen = () => {
    reset();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = -event.deltaY / 500;
    setScale((prev) => clamp(prev + delta, 1, 4));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerMap.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    lastPanPoint.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerMap.current.has(event.pointerId)) {
      return;
    }
    pointerMap.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointerMap.current.size === 2) {
      const points = Array.from(pointerMap.current.values());
      const distance = getDistance(points[0], points[1]);
      if (lastDistance.current != null) {
        const delta = (distance - lastDistance.current) / 200;
        setScale((prev) => clamp(prev + delta, 1, 4));
      }
      lastDistance.current = distance;
    } else if (pointerMap.current.size === 1 && scale > 1) {
      const currentPoint = pointerMap.current.get(event.pointerId);
      if (currentPoint && lastPanPoint.current) {
        setOffset((prev) => ({
          x: prev.x + (currentPoint.x - lastPanPoint.current!.x),
          y: prev.y + (currentPoint.y - lastPanPoint.current!.y)
        }));
        lastPanPoint.current = { x: currentPoint.x, y: currentPoint.y };
      }
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerMap.current.delete(event.pointerId);
    if (pointerMap.current.size < 2) {
      lastDistance.current = null;
    }
    if (pointerMap.current.size === 0) {
      lastPanPoint.current = null;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="motion-spring inline-flex items-center gap-2 rounded-full border border-white/20 bg-card/70 px-4 py-2 text-sm text-ink transition hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        Deep zoom
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-6 top-6 rounded-full border border-white/30 bg-card/60 px-3 py-1 text-sm text-ink transition hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            Close
          </button>
          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-3xl border border-white/20 bg-black/50"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              className="relative"
              style={{
                transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                transformOrigin: "center"
              }}
            >
              <Image
                src={imageUrl}
                alt={title}
                width={1600}
                height={1600}
                className="max-h-[80vh] max-w-[90vw] object-contain"
                placeholder={lqip ? "blur" : "empty"}
                blurDataURL={lqip ?? undefined}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}
