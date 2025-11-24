"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { Blog } from "@/lib/api";

type BlogTeaserProps = {
  posts: Blog[];
};

export function BlogTeaser({ posts }: BlogTeaserProps) {
  const items = posts.slice(0, 2);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]/70">Reflections</p>
          <h3 className="mt-3 font-jost text-3xl text-[var(--ink)] sm:text-4xl">Latest writings from the studio table</h3>
        </div>
        <Link
          href="/blogs"
          className="pill hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Read all reflections
        </Link>
      </div>

      {items.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
              className="overflow-hidden rounded-[2.25rem] border border-[var(--border-soft)] bg-[rgba(20,15,28,0.85)] shadow-[var(--shadow-ambient)]"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                {post.cover_url ? (
                  <Image
                    src={post.cover_url}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-700 hover:scale-[1.06]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]/70">
                    Visual coming soon
                  </div>
                )}
              </div>
              <div className="space-y-4 p-8">
                <h4 className="font-jost text-2xl text-[var(--ink)]">{post.title}</h4>
                <p className="text-sm leading-relaxed text-[var(--muted)]/90">
                  {post.excerpt ?? "A new reflection will be published shortly."}
                </p>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="pill hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Read reflection
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-[2.5rem] border border-[var(--border-soft)] bg-[rgba(18,12,24,0.78)] p-12 text-center text-sm text-[var(--muted)]">
          Reflections coming soon… Subscribe to stay tuned.
        </div>
      )}
    </section>
  );
}
