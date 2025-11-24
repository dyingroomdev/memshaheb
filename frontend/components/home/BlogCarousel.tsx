'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type BlogPost = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_url?: string | null;
  published_at?: string | null;
  read_time_minutes?: number | null;
};

type BlogCarouselProps = {
  posts: BlogPost[];
};

export default function BlogCarousel({ posts }: BlogCarouselProps) {
  if (!posts.length) return null;

  return (
    <section className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="font-display fluid-h2 font-bold text-[var(--ink)] mb-4">
          Studio Reflections
        </h2>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          Thoughts from the creative process
        </p>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1.05}
        spaceBetween={12}
        breakpoints={{
          1024: { slidesPerView: 2, spaceBetween: 22 }
        }}
        navigation
        pagination={{ clickable: true }}
        className="[&_.swiper-button-next]:!bg-white/10 [&_.swiper-button-next]:!backdrop-blur-md [&_.swiper-button-next]:!rounded-full [&_.swiper-button-next]:!w-12 [&_.swiper-button-next]:!h-12
                   [&_.swiper-button-prev]:!bg-white/10 [&_.swiper-button-prev]:!backdrop-blur-md [&_.swiper-button-prev]:!rounded-full [&_.swiper-button-prev]:!w-12 [&_.swiper-button-prev]:!h-12
                   [&_.swiper-button-next:after]:!text-sm [&_.swiper-button-prev:after]:!text-sm
                   [&_.swiper-pagination-bullet]:!bg-white/40 [&_.swiper-pagination-bullet-active]:!bg-white [&_.swiper-pagination]:!bottom-0"
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id}>
            <article className="group">
              <Link href={`/blogs/${post.slug}`}>
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
                  {post.cover_url ? (
                    <div className="relative overflow-hidden">
                      <Image
                        src={post.cover_url}
                        alt={post.title}
                        width={400}
                        height={250}
                        className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,10,20,0.6)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--bg)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <h3 className="font-display text-xl font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-[var(--muted)] leading-relaxed line-clamp-3 text-sm">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                      {post.published_at && (
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      )}
                      {post.read_time_minutes && (
                        <span>{post.read_time_minutes} min read</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <div className="text-center mt-8">
        <a
          href="/blogs"
          className="rounded-full px-6 py-2 border border-[rgba(255,255,255,0.2)] text-[var(--ink)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          Read Reflections
        </a>
      </div>
    </section>
  );
}
