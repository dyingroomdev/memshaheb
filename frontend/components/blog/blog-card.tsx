"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Blog } from "@/lib/api";
import { blogToCardData, highlightQuery } from "@/lib/blog-utils";

type BlogCardProps = {
  blog: Blog;
  query?: string;
  delay?: number;
};

export function BlogCard({ blog, query = "", delay = 0 }: BlogCardProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { readTime, published } = blogToCardData(blog);

  return (
    <Link
      ref={ref}
      href={`/blogs/${blog.slug}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-lg shadow-black/10 transition duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${visible ? "opacity-100" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${visible ? delay : 0}s` }}
      prefetch
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {blog.cover_url ? (
          <Image
            src={blog.cover_url}
            alt={blog.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/15 to-accent-2/20 text-sm text-muted">
            Cover coming soon
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-muted/70">
          {blog.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-card/60 px-3 py-1 text-[0.6rem]">
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-ink" dangerouslySetInnerHTML={{ __html: highlightQuery(blog.title, query) }} />
          {blog.excerpt && (
            <p
              className="text-sm leading-relaxed text-muted"
              dangerouslySetInnerHTML={{ __html: highlightQuery(blog.excerpt, query) }}
            />
          )}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.32em] text-muted/50">
          {published && <span>{published}</span>}
          <span>{readTime} min read</span>
        </div>
      </div>
    </Link>
  );
}
