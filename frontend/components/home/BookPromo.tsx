'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { MEDIA_BASE_URL } from '@/lib/config';

export default function BookPromo() {
  return (
    <section aria-labelledby="book-promo" className="py-[var(--space-4)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        <article
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center
                     rounded-3xl border border-[rgba(255,255,255,0.06)]
                     bg-[rgba(255,255,255,0.03)] backdrop-blur-md
                     shadow-[0_20px_60px_rgba(213,155,246,0.08)] p-8 md:p-12"
        >
          {/* Cover (left) */}
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)]">
              <Image
                src="/logo.png"
                alt="Book cover: The Subtle Hues in the Sky"
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
              />
            </div>
          </div>

          {/* Content (right) */}
          <div>
            <p className="uppercase text-xs tracking-[0.25em] text-[var(--muted)] font-medium">
              Featured Book
            </p>
            <h2 id="book-promo" className="mt-2 font-display fluid-h2 font-semibold text-[var(--ink)]">
              The Subtle Hues in the Sky
            </h2>

            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              Sarah is a woman lost in a haze of alcohol and cigarettes, numbing the pain of a broken heart.
              After catching her boyfriend, Sameer, cheating, she chose to silently walk away, unwilling to
              confront him with the truth she knows. Beneath her grief lies a much darker secret—years of sexual
              abuse by her sports teacher, a trauma that Sameer helped her expose. Despite the past being buried,
              Sarah continues to live in its shadow, haunted by memories she doesn't fully recall, thanks to
              hypnotherapy that erased her painful past—something she remains unaware of. When Sarah meets Abir,
              a young substitute lecturer with a troubled childhood, she feels an inexplicable connection to him.
              Though she can't place why, there's something about Abir that seems familiar. As their bond deepens
              into love, Sarah begins to feel a sense of peace she's long been denied. But fate has other plans,
              and the past is about to come crashing back into her life. <em>The Subtle Hues In The Sky</em> is a
              gripping psychological romantic thriller that explores the painful consequences of buried trauma,
              the haunting nature of memory, and the powerful, often destructive forces of love and fate.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://store.memshaheb.com/"
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-full px-6 py-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]
                           text-[var(--bg)] font-semibold transition-opacity duration-300 hover:opacity-90
                           focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
              >
                Buy Now
              </a>
              <span className="text-xs text-[var(--muted)]">
                Secure checkout • Ships Bangladesh Only
              </span>
            </div>
          </div>
        </article>
      </motion.div>
    </section>
  );
}
