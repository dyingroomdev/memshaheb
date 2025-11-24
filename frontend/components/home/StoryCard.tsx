import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Blog } from "@/lib/api";
import { blogToCardData } from "@/lib/blog-utils";

type StoryCardProps = {
  blog: Blog;
  badge?: string;
};

export function StoryCard({ blog, badge }: StoryCardProps) {
  const { published, readTime } = blogToCardData(blog);
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/70 backdrop-blur-xl shadow-glow-soft transition hover:-translate-y-1 hover:shadow-glow-medium"
    >
      {blog.cover_url && (
        <div className="relative h-40 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.cover_url}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-3 py-1 text-[11px] font-semibold text-[var(--bg)] shadow-[0_10px_30px_rgba(203,59,145,0.35)]">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
          {blog.category?.name && <span className="text-[var(--accent)]">{blog.category.name}</span>}
          {blog.category?.name && <span className="text-muted/50">•</span>}
          {published && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {published}
            </span>
          )}
          {readTime && <span>{readTime} min</span>}
        </div>
        <h3 className="text-lg font-semibold text-ink group-hover:text-accent transition-colors">{blog.title}</h3>
        {blog.excerpt && <p className="line-clamp-3 text-sm text-muted">{blog.excerpt}</p>}
      </div>
    </Link>
  );
}
