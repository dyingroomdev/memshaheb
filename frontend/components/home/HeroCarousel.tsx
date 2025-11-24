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
            <div className="relative h-full overflow-hidden rounded-b-[28px]">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0E0A14]/78 via-[#1A0F22]/45 to-transparent" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -left-20 -top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(203,59,145,0.28),transparent_60%)] blur-3xl opacity-90" />
                <div className="absolute right-6 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(126,102,255,0.22),transparent_60%)] blur-3xl opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[var(--bg)]/90 via-[var(--bg)]/10 to-transparent" />
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="absolute inset-0 flex items-center justify-center md:justify-start md:left-16 px-6"
              >
                <div className="max-w-[92%] sm:max-w-[620px] xl:max-w-[720px] text-center md:text-left bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl px-6 sm:px-8 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                  <motion.div
                    variants={fadeUp}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-[var(--muted)] mb-4"
                  >
                    Memshaheb Magazine
                  </motion.div>
                  <motion.h1 
                    variants={fadeUp}
                    className="font-display fluid-h1 font-bold text-[var(--ink)] tracking-tight drop-shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
                  >
                    {slide.title}
                  </motion.h1>
                  
                  {slide.subtitle && (
                    <motion.p 
                      variants={fadeUp}
                      className="mt-4 max-w-xl text-lg md:text-xl text-[var(--muted)] leading-relaxed"
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}
                  
                  <motion.div 
                    variants={fadeUp}
                    className="mt-8 flex flex-col sm:flex-row gap-4"
                  >
                    {slide.cta && (
                      <a
                        href={slide.cta.href}
                        className="rounded-full px-8 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[var(--bg)] font-semibold hover:opacity-90 transition-all duration-300 text-center shadow-[0_0_40px_rgba(213,155,246,0.35)]"
                      >
                        {slide.cta.label}
                      </a>
                    )}
                    <a
                      href="#about"
                      className="rounded-full px-8 py-3 border border-[rgba(255,255,255,0.2)] text-[var(--ink)] hover:border-[var(--accent)]/60 hover:bg-white/5 transition-all duration-300 text-center backdrop-blur-sm"
                    >
                      About Memshaheb
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
