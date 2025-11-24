"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type HeroParallaxProps = {
  background?: ReactNode;
  children: ReactNode;
};

export function HeroParallax({ background, children }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) {
      return;
    }

    const handleScroll = () => {
      const node = containerRef.current;
      if (!node) {
        return;
      }
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = 1 - Math.min(Math.max(rect.top / viewportHeight, -1), 1);
      const offset = progress * -24;
      node.style.setProperty("--parallax-offset", `${offset}px`);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative isolate overflow-hidden"
      style={{ "--parallax-offset": "0px" } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transform-gpu motion-spring transition-transform duration-200"
        style={{ transform: "translateY(var(--parallax-offset))" }}
      >
        {background}
      </div>
      {children}
    </div>
  );
}
