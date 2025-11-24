"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import type { HeroSlide } from "@/lib/api";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HeroCarouselProps = {
  slides: HeroSlide[];
};

const AUTO_ADVANCE_MS = 9000;

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image_url: "",
    title: "Night-first creativity, painted in motion.",
    subtitle: "Every canvas is a question, every story a constellation.",
    cta_label: "Enter Her World",
    cta_href: "/museum"
  }
];

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const items = useMemo(() => (slides.length ? slides : FALLBACK_SLIDES), [slides]);
  const [index, setIndex] = useState(0);
  const [parallaxStyle, setParallaxStyle] = useState<{ transform: string }>({ transform: "translate3d(0,0,0)" });

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [items.length, prefersReducedMotion]);

  useEffect(() => {
    if (index >= items.length) {
      setIndex(0);
    }
  }, [index, items.length]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      setParallaxStyle({
        transform: `translate3d(${x * 14}px, ${y * 12}px, 0)`
      });
    },
    [prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    setParallaxStyle({ transform: "translate3d(0,0,0)" });
  }, []);

  const selectSlide = (nextIndex: number) => {
    setIndex(nextIndex);
  };

  const active = items[index];
  const activeHref = active?.cta_href?.trim() || "/museum";
  const activeHrefExternal = /^https?:\/\//i.test(activeHref);

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(12,8,20,0.95)] via-[rgba(20,14,28,0.9)] to-[rgba(6,4,12,0.94)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div
          className="relative overflow-hidden rounded-[2.75rem] border border-[var(--border-soft)] bg-[rgba(12,8,20,0.8)] shadow-[var(--shadow-elevated)]"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div className="absolute inset-0">
            <AnimatePresence initial={false}>
              <motion.div
                key={active?.id ?? index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {active?.image_url ? (
                  <Image
                    src={active.image_url}
                    alt={active.title ?? "Hero background"}
                    fill
                    priority
                    className="object-cover blur-[1.5px] brightness-[0.55]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#241630] to-[#110916]" />
                )}
              </motion.div>
            </AnimatePresence>
            <motion.div
              className="absolute inset-0 mix-blend-screen opacity-35"
              style={parallaxStyle}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(213,155,246,0.35),transparent_55%),radial-gradient(circle_at_75%_30%,rgba(255,170,207,0.28),transparent_55%)]" />
            </motion.div>
          </div>

          <div className="relative z-10 flex flex-col gap-12 px-8 pb-20 pt-24 sm:px-12 lg:flex-row lg:items-end lg:px-16">
            <div className="max-w-2xl space-y-6">
              <AnimatePresence initial={false} mode="wait">
                <motion.h1
                  key={`title-${active?.id ?? index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="font-jost text-4xl leading-tight text-[var(--ink)] sm:text-5xl lg:text-6xl"
                >
                  {active?.title ?? "Inside every column lies a whispered story."}
                </motion.h1>
              </AnimatePresence>

              <AnimatePresence initial={false} mode="wait">
                <motion.p
                  key={`subtitle-${active?.id ?? index}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-lg leading-relaxed text-[var(--muted)]/90 sm:text-xl"
                >
                  {active?.subtitle ??
                    "Memshaheb lives between worlds — where literature, art, and nocturnal color meet."}
                </motion.p>
              </AnimatePresence>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={activeHref}
                  target={activeHrefExternal ? "_blank" : undefined}
                  rel={activeHrefExternal ? "noreferrer noopener" : undefined}
                  className="btn-primary inline-flex items-center gap-3"
                >
                  {active?.cta_label ?? "Enter Her World"}
                  <span className="text-sm">→</span>
                </a>
                <div className="hidden text-sm uppercase tracking-[0.38em] text-[var(--muted)]/70 sm:block">
                  Scroll to wander the rooms
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pb-6 text-sm text-[var(--muted)]/80">
              <span className="uppercase tracking-[0.32em] text-[var(--muted)]/60">Stories</span>
              <div className="flex gap-2">
                {items.map((slide, slideIndex) => (
                  <button
                    key={slide.id ?? slideIndex}
                    type="button"
                    onClick={() => selectSlide(slideIndex)}
                    aria-label={`View slide ${slideIndex + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      slideIndex === index ? "w-10 bg-[var(--accent)]" : "w-6 bg-white/20 hover:bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
