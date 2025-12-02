'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Slide = {
  image: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
};

type HeroCarouselProps = {
  slides: Slide[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  if (!slides.length) return null;

  return (
    <section className="relative">
      <Swiper
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        effect="fade"
        autoplay={{ delay: 5200, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={slides.length > 1}
        className="h-[80vh] md:h-[85vh] max-h-[900px] w-full
                   [&_.swiper-button-next]:!bg-white/10 [&_.swiper-button-next]:!backdrop-blur-md [&_.swiper-button-next]:!rounded-full [&_.swiper-button-next]:!w-12 [&_.swiper-button-next]:!h-12 [&_.swiper-button-next]:!right-8 [&_.swiper-button-next]:!border [&_.swiper-button-next]:!border-white/15
                   [&_.swiper-button-prev]:!bg-white/10 [&_.swiper-button-prev]:!backdrop-blur-md [&_.swiper-button-prev]:!rounded-full [&_.swiper-button-prev]:!w-12 [&_.swiper-button-prev]:!h-12 [&_.swiper-button-prev]:!left-8 [&_.swiper-button-prev]:!border [&_.swiper-button-prev]:!border-white/15
                   [&_.swiper-button-next:after]:!text-sm [&_.swiper-button-prev:after]:!text-sm
                   [&_.swiper-pagination-bullet]:!bg-white/30 [&_.swiper-pagination-bullet-active]:!bg-white [&_.swiper-pagination]:!bottom-7 [&_.swiper-pagination]:!gap-2
                   sm:[&_.swiper-button-next]:!block sm:[&_.swiper-button-prev]:!block max-sm:[&_.swiper-button-next]:!hidden max-sm:[&_.swiper-button-prev]:!hidden"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full overflow-hidden rounded-b-[28px] bg-black">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
              {/* heavy vignette and left-to-right gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.12),transparent_45%)]" />

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="absolute inset-0 flex items-center justify-start px-6 md:px-12 lg:px-16"
              >
                <div className="max-w-3xl text-left space-y-5">
                  <motion.span
                    variants={fadeUp}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-white/80"
                  >
                    Memshaheb
                  </motion.span>
                  <motion.h1
                    variants={fadeUp}
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                  >
                    {slide.title}
                  </motion.h1>
                  {slide.subtitle && (
                    <motion.p
                      variants={fadeUp}
                      className="text-lg sm:text-xl text-white/80 max-w-2xl"
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}
                  {slide.cta && (
                    <motion.div variants={fadeUp} className="pt-2">
                      <a
                        href={slide.cta.href}
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-7 py-3 text-white font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:opacity-90 transition-all duration-300"
                      >
                        {slide.cta.label}
                      </a>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
