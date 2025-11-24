"use client";

import { useCallback, useMemo, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ParallaxStyle = {
  transform: string;
};

export function useParallax(maxShift = 6) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [style, setStyle] = useState<ParallaxStyle>({ transform: "translate3d(0,0,0)" });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (prefersReducedMotion) {
        return;
      }

      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      const translateX = clamp(offsetX * maxShift, -maxShift, maxShift);
      const translateY = clamp(offsetY * maxShift, -maxShift, maxShift);
      setStyle({
        transform: `translate3d(${translateX}px, ${translateY}px, 0)`
      });
    },
    [maxShift, prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    setStyle({ transform: "translate3d(0,0,0)" });
  }, []);

  return useMemo(
    () => ({
      style: prefersReducedMotion ? undefined : style,
      onPointerMove: prefersReducedMotion ? undefined : handlePointerMove,
      onPointerLeave: prefersReducedMotion ? undefined : handlePointerLeave
    }),
    [handlePointerLeave, handlePointerMove, prefersReducedMotion, style]
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
