import Link from "next/link";
import type { Blog } from "@/lib/api";
import { StoryCard } from "./StoryCard";

type StoryStripProps = {
  title: string;
  href: string;
  posts: Blog[];
  badge?: string;
};

export function StoryStrip({ title, href, posts, badge }: StoryStripProps) {
  if (!posts.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted/80">{title}</p>
          <h2 className="text-3xl font-semibold text-ink">{title}</h2>
        </div>
        <Link href={href} className="text-sm text-accent hover:text-accent-2">
          View all
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <StoryCard key={post.id} blog={post} badge={badge} />
        ))}
      </div>
    </section>
  );
}
