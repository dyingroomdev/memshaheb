import Link from "next/link";

import { getBlogs, getSiteSettings } from "@/lib/api";
import { BlogCard } from "@/components/blog/blog-card";
import { blogToCardData } from "@/lib/blog-utils";

export const metadata = {
  title: "Magazine — Memshaheb",
  description: "Stories, essays, and cultural notes from Memshaheb’s editorial desk."
};

type PageProps = {
  searchParams?: {
    q?: string;
    tag?: string;
    category?: string;
  };
};

export default async function BlogArchivePage({ searchParams }: PageProps) {
  const query = searchParams?.q?.trim() ?? "";
  const tagParam = searchParams?.tag?.trim();
  const categoryParam = searchParams?.category?.trim();

  const [blogResponse, siteSettings] = await Promise.all([
    getBlogs({
      query: query || undefined,
      tags: tagParam ? [tagParam] : undefined,
      category: categoryParam || undefined,
      limit: 24
    }),
    getSiteSettings().catch(() => null)
  ]);

  const posts = blogResponse.items.filter((post) => post.published_at);

  return (
    <>
    <main className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-20 sm:px-12">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-muted/70">Words at Dusk</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Blog</h1>
            <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
              Essays, studio notes, and quiet experiments from the night-first museum.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-muted/60">
            {query && <span>Search: “{query}”</span>}
            {tagParam && <span>Tag: {tagParam}</span>}
            {categoryParam && <span>Category: {categoryParam}</span>}
            {posts.length > 0 && <span>{posts.length} published entries</span>}
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-white/10 bg-card/40 p-12 text-center text-muted">
            <p>No published posts yet. Check back soon.</p>
            <p className="mt-3 text-sm">
              Have something in mind? Reach out via <Link href="/contact" className="text-accent hover:text-accent-2">contact</Link> or follow the studio on Instagram.
            </p>
          </div>
        ) : (
          <section className="mt-12 space-y-16">
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

            <aside className="space-y-6 rounded-3xl border border-white/10 bg-card/60 p-6 text-sm text-muted">
              <h2 className="text-lg font-semibold text-ink">Archive Notes</h2>
              <p>
                Browse the latest posts above. Looking for a specific story? Use the site search or filter by tag in the admin dashboard to manage drafts and publishing status.
              </p>
              <ul className="space-y-2 text-xs uppercase tracking-[0.32em]">
                {posts.slice(0, 4).map((post) => {
                  const { readTime, published } = blogToCardData(post);
                  return (
                    <li key={post.id} className="flex items-center justify-between gap-3 border-b border-white/10 py-2">
                      <span className="flex-1 truncate text-ink">{post.title}</span>
                      <span className="text-muted">{published ?? 'Draft'}</span>
                      <span className="text-muted/70">{readTime}m</span>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </section>
        )}
      </div>
    </main>
    </>
  );
}
