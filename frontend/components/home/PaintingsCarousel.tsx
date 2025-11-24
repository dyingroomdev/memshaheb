'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import type { Painting as PaintingType } from '@/lib/api';

type Painting = Pick<PaintingType, 'id' | 'title' | 'year' | 'image_url' | 'slug'>;

type PaintingsCarouselProps = {
  items: Painting[];
};

export default function PaintingsCarousel({ items }: PaintingsCarouselProps) {
  if (!items.length) return null;

  return (
    <div className="text-center">
      <div className="mb-8 text-center">
        <h2 className="font-display fluid-h2 font-bold text-[var(--ink)] mb-4">
          Featured Paintings
        </h2>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          Explore the latest works where emotion meets canvas.
        </p>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1.1}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
          1440: { slidesPerView: 4, spaceBetween: 28 }
        }}
        navigation
        pagination={{ clickable: true }}
        className="[&_.swiper-button-next]:!bg-white/10 [&_.swiper-button-next]:!backdrop-blur-md [&_.swiper-button-next]:!rounded-full [&_.swiper-button-next]:!w-12 [&_.swiper-button-next]:!h-12
                   [&_.swiper-button-prev]:!bg-white/10 [&_.swiper-button-prev]:!backdrop-blur-md [&_.swiper-button-prev]:!rounded-full [&_.swiper-button-prev]:!w-12 [&_.swiper-button-prev]:!h-12
                   [&_.swiper-button-next:after]:!text-sm [&_.swiper-button-prev:after]:!text-sm
                   [&_.swiper-pagination-bullet]:!bg-white/40 [&_.swiper-pagination-bullet-active]:!bg-white [&_.swiper-pagination]:!bottom-0"
      >
        {items.map((painting) => (
          <SwiperSlide key={painting.id}>
            <article className="group relative overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(213,155,246,0.15)] transition-shadow duration-500">
              {painting.image_url && (
                <div className="relative">
                  <Image
                    src={painting.image_url}
                    alt={painting.title}
                    width={400}
                    height={500}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
                  />
                  
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full px-3 py-1 text-xs text-white/90 bg-black/30 backdrop-blur-md border border-white/10">
                      {painting.title}
                      {painting.year && ` · ${painting.year}`}
                    </span>
                    <a
                      href={painting.slug ? `/paintings/${painting.slug}` : "/museum"}
                      className="rounded-full px-3 py-1 text-xs bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <div className="text-center mt-12">
        <a
          href="/museum"
          className="rounded-full px-6 py-2 border border-[rgba(255,255,255,0.2)] text-[var(--ink)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          View All Artworks
        </a>
      </div>
    </div>
  );
}
