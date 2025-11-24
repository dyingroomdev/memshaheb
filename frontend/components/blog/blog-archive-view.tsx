'use client';

import { useState } from "react";
import type { Blog } from "@/lib/api";
import { BlogCard } from "@/components/blog/blog-card";
import { blogToCardData } from "@/lib/blog-utils";

type BlogArchiveViewProps = {
  posts: Blog[];
  query?: string;
};

export function BlogArchiveView({ posts, query }: BlogArchiveViewProps) {
  const [view, setView] = useState<"grid" | "list">("list");

  if (!posts.length) return null;

  return (
    <section className="mt-12 space-y-6">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setView("grid")}
          className={`px-3 py-1 text-xs rounded-full border ${
            view === "grid"
              ? "border-accent/60 bg-accent/10 text-ink"
              : "border-white/10 text-muted hover:text-ink hover:border-white/30"
          }`}
        >
          Grid
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          className={`px-3 py-1 text-xs rounded-full border ${
            view === "list"
              ? "border-accent/60 bg-accent/10 text-ink"
              : "border-white/10 text-muted hover:text-ink hover:border-white/30"
          }`}
        >
          List
        </button>
      </div>

      {view === "grid" ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, index) => (
            <BlogCard
              key={post.id}
              blog={post}
              query={query}
              delay={index * 0.05}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group flex gap-4 rounded-2xl border border-white/10 bg-card/60 p-4 hover:border-accent/40 transition"
            >
              {post.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_url}
                  alt={post.title}
                  className="h-24 w-32 rounded-xl object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-[0.28em] text-muted flex flex-wrap gap-2">
                  {post.category?.name && <span className="text-accent">{post.category.name}</span>}
                  {blogToCardData(post).published && <span>{blogToCardData(post).published}</span>}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-ink group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1 text-sm text-muted line-clamp-2">{post.excerpt}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
