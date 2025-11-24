"use client";

import { useState, useTransition } from "react";

import type { Blog, BlogListResponse } from "@/lib/api";
import { getBlogs } from "@/lib/api";

import { BlogCard } from "@/components/blog/blog-card";

type BlogListProps = {
  initialItems: Blog[];
  initialNextCursor: string | null;
  query: string;
};

export function BlogList({ initialItems, initialNextCursor, query }: BlogListProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    if (!nextCursor) {
      return;
    }
    startTransition(async () => {
      const response = await fetchMore({ cursor: nextCursor, query });
      setItems((current) => [...current, ...response.items]);
      setNextCursor(response.next_cursor ?? null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-card/70 p-10 text-center text-muted shadow-glow-soft">
        No stories found. Try a different search or explore later.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((blog, index) => (
          <BlogCard key={blog.id} blog={blog} query={query} delay={index * 0.08} />
        ))}
      </div>
      {nextCursor && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="motion-spring inline-flex items-center gap-2 rounded-full border border-accent/40 bg-transparent px-6 py-3 text-sm font-medium text-accent transition hover:-translate-y-px hover:scale-[1.02] hover:border-accent focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Loading…" : "More stories"}
          </button>
        </div>
      )}
    </div>
  );
}

async function fetchMore(params: { cursor: string; query: string }): Promise<BlogListResponse> {
  return getBlogs({ cursor: params.cursor, query: params.query, limit: 10 });
}
