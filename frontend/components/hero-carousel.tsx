"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, TouchEvent } from "react";

import type { HeroSlide } from "@/lib/api";

const AUTOPLAY_INTERVAL = 7000;
const PROGRESS_TICK = 120;
const SWIPE_THRESHOLD_PX = 56;

type HeroCarouselProps = {
  slides: HeroSlide[];
};

type SlideWithComputed = HeroSlide & {
  imageAlt: string;
};

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const hydratedSlides = useMemo<SlideWithComputed[]>(() => {
    if (slides.length === 0) {
      const fallbackImage =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><radialGradient id="g1" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#D59BF6" stop-opacity="0.42"/><stop offset="100%" stop-color="#0E0A14" stop-opacity="1"/></radialGradient><radialGradient id="g2" cx="82%" cy="78%" r="48%"><stop offset="0%" stop-color="#FFAACF" stop-opacity="0.38"/><stop offset="100%" stop-color="#0E0A14" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="#0E0A14"/><rect width="1600" height="900" fill="url(#g1)"/><rect width="1600" height="900" fill="url(#g2)"/><circle cx="320" cy="240" r="140" fill="#BCA7D9" fill-opacity=".18"/><circle cx="1320" cy="680" r="180" fill="#D59BF6" fill-opacity=".22"/></svg>`
        );

      return [
        {
          id: -1,
          image_url: fallbackImage,
          title: "A night at the museum",
          subtitle: "Experience the collection in velveteen light.",
          cta_label: "Explore Paintings",
          cta_href: "/paintings",
          imageAlt: "Abstract violet gradients resembling museum lighting."
        }
      ];
    }

    return slides.map((slide, index) => ({
      ...slide,
      imageAlt:
        slide.title ??
        slide.subtitle ??
        `Hero slide ${index + 1} showcasing featured work${slide.cta_label ? ` — ${slide.cta_label}` : ""}.`
    }));
  }, [slides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isPausedRef = useRef(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<{ x: number; time: number } | null>(null);

  const slidesCount = hydratedSlides.length;
  const autoPlayEnabled = slidesCount > 1 && !prefersReducedMotion;
  const isPaused = hoverPaused || focusPaused || !autoPlayEnabled;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty("--parallax-x", `${x}`);
      node.style.setProperty("--parallax-y", `${y}`);
    };

    const resetParallax = () => {
      node.style.setProperty("--parallax-x", "0");
      node.style.setProperty("--parallax-y", "0");
    };

    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerleave", resetParallax);

    return () => {
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerleave", resetParallax);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setPrefersReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!autoPlayEnabled) {
      return;
    }

    const step = PROGRESS_TICK / AUTOPLAY_INTERVAL;
    const intervalId = window.setInterval(() => {
      if (isPausedRef.current) {
        return;
      }

      setProgress((prev) => {
        const next = prev + step;
        if (next >= 1) {
          setActiveIndex((current) => (current + 1) % slidesCount);
          return 0;
        }
        return next;
      });
    }, PROGRESS_TICK);

    return () => window.clearInterval(intervalId);
  }, [autoPlayEnabled, slidesCount]);

  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  const goToSlide = (index: number) => {
    setActiveIndex((prev) => {
      if (index < 0) {
        return (slidesCount + prev - 1) % slidesCount;
      }
      if (index >= slidesCount) {
        return (prev + 1) % slidesCount;
      }
      return index;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(activeIndex - 1);
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, time: Date.now() };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    if (!start) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const elapsed = Date.now() - start.time;

    touchStartRef.current = null;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX && elapsed < 600) {
      if (deltaX < 0) {
        goToSlide(activeIndex + 1);
      } else {
        goToSlide(activeIndex - 1);
      }
    }
  };

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden rounded-3xl bg-card/40 ring-1 ring-white/5"
      style={
        {
          "--parallax-x": "0",
          "--parallax-y": "0"
        } as CSSProperties
      }
      aria-roledescription="carousel"
      aria-label="Featured works and books"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setFocusPaused(false);
        }
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
    >
      <div className="relative h-[520px] min-h-[24rem] w-full overflow-hidden sm:h-[560px]">
        {hydratedSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          const isVideo = /\.mp4$|\.webm$|\.mov$/i.test(slide.image_url);

          return (
            <article
              key={slide.id ?? index}
              className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
              aria-hidden={!isActive}
            >
              <div className="absolute inset-0 -z-20">
                {isVideo ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={slide.image_url}
                    muted
                    loop
                    autoPlay
                    playsInline
                    aria-hidden="true"
                  />
                ) : (
                  <Image
                    src={slide.image_url}
                    alt={slide.imageAlt}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0E0A14]/60 via-[#0E0A14]/40 to-[#0E0A14]/75" />
                <div
                  className="pointer-events-none absolute inset-0 -z-10 opacity-70"
                  style={{
                    background:
                      "radial-gradient(180% 120% at 15% 20%, rgba(213,155,246,0.22) 0%, transparent 60%), radial-gradient(160% 140% at 78% 80%, rgba(255,170,207,0.18) 0%, transparent 65%)"
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 -z-20"
                  style={{
                    transform:
                      "translate3d(calc(var(--parallax-x) * -14px), calc(var(--parallax-y) * -12px), 0)"
                  }}
                >
                  <div className="absolute -left-24 top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
                  <div className="absolute -right-12 bottom-20 h-40 w-40 rounded-full bg-accent-2/24 blur-[100px]" />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 -z-30 mix-blend-screen opacity-80"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml,%3Csvg width=\"320\" height=\"320\" viewBox=\"0 0 320 320\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3CradialGradient id=\"g\" cx=\"50%25\" cy=\"50%25\" r=\"70%25\"%3E%3Cstop offset=\"0%25\" stop-color=\"%23ffffff\" stop-opacity=\"0.3\"/%3E%3Cstop offset=\"100%25\" stop-color=\"%23ffffff\" stop-opacity=\"0\"/%3E%3C/ radialGradient%3E%3C/defs%3E%3Crect width=\"320\" height=\"320\" fill=\"url(%23g)\"/%3E%3C/svg%3E')",
                    transform:
                      "translate3d(calc(var(--parallax-x) * 18px), calc(var(--parallax-y) * 16px), 0)"
                  }}
                />
              </div>

              <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-16 pt-20 sm:px-12 lg:px-20">
                <div className="max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted/75 backdrop-blur">
                    <span>Featured</span>
                    <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
                    <span>
                      {index + 1}/{slidesCount}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-semibold text-ink sm:text-5xl">
                      {slide.title ?? "Featured work"}
                    </h2>
                    <p className="text-lg text-muted sm:text-xl">{slide.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {(() => {
                      const slideHref = slide.cta_href?.trim() || "/paintings";
                      const slideExternal = /^https?:\/\//i.test(slideHref);
                      return (
                        <a
                          href={slideHref}
                          target={slideExternal ? "_blank" : undefined}
                          rel={slideExternal ? "noreferrer noopener" : undefined}
                          className="motion-spring inline-flex items-center gap-2 rounded-3xl border border-transparent bg-accent px-6 py-3 font-medium text-[#13081d] shadow-glow transition duration-200 hover:-translate-y-px hover:scale-[1.02] hover:shadow-glow focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2/60"
                        >
                          {slide.cta_label ?? "Explore Paintings"}
                        </a>
                      );
                    })()}
                    <Link
                      href={{ pathname: "/shop", query: { tab: "books" } }}
                      className="motion-spring inline-flex items-center gap-2 rounded-3xl border border-accent/40 bg-transparent px-6 py-3 font-medium text-accent transition duration-200 hover:-translate-y-px hover:scale-[1.02] hover:border-accent focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      Shop Books
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-6 pb-6 sm:px-12 lg:px-20">
        <span className="sr-only" aria-live="polite">
          Slide {activeIndex + 1} of {slidesCount}
        </span>
        <div className="flex flex-1 gap-3">
          {hydratedSlides.map((slide, index) => {
            const indicatorProgress =
              index < activeIndex ? 1 : index === activeIndex ? progress : 0;

            return (
              <button
                key={slide.id ?? index}
                type="button"
                className="group relative h-2 flex-1 overflow-hidden rounded-full bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2/60"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}${slide.title ? `, ${slide.title}` : ""}`}
              >
                <span
                  className="absolute inset-0 origin-left bg-gradient-to-r from-accent to-accent-2 transition-transform duration-200 ease-linear group-hover:scale-y-125"
                  style={{ transform: `scaleX(${indicatorProgress})` }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToSlide(activeIndex - 1)}
            aria-label="Previous slide"
            className="motion-spring inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-card/70 text-ink transition hover:border-accent/60 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => goToSlide(activeIndex + 1)}
            aria-label="Next slide"
            className="motion-spring inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-card/70 text-ink transition hover:border-accent/60 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
