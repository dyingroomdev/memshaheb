import Link from "next/link";

import { getBlogCategories, getBlogs, getSiteSettings } from "@/lib/api";
import { blogToCardData } from "@/lib/blog-utils";
import { BlogArchiveView } from "@/components/blog/blog-archive-view";

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

  const [blogResponse, siteSettings, categories] = await Promise.all([
    getBlogs({
      query: query || undefined,
      tags: tagParam ? [tagParam] : undefined,
      category: categoryParam || undefined,
      limit: 24
    }),
    getSiteSettings().catch(() => null),
    getBlogCategories().catch(() => [])
  ]);

  const posts = blogResponse.items.filter((post) => post.published_at);
  const category = categoryParam
    ? categories.find((c) => c.slug === categoryParam || String(c.id) === categoryParam)
    : null;
  const isCategoryView = !!categoryParam;
  const title = category?.name || categoryParam || "The Journal";
  const description = category?.description || (isCategoryView ? "" : "Strong women-focused magazine flavor.");

  return (
    <>
    <main className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-20 sm:px-12">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-8">
          <div className="flex-1">
            <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
            {description && (
              <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            <form action="/blogs" className="flex items-center gap-2">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search stories..."
                className="w-48 sm:w-60 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              />
              {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
              {tagParam && <input type="hidden" name="tag" value={tagParam} />}
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-accent text-[var(--bg)] text-sm font-medium hover:opacity-90 transition"
              >
                Search
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-muted/60">
              {query && <span>Search: “{query}”</span>}
              {tagParam && <span>Tag: {tagParam}</span>}
              {posts.length > 0 && <span>{posts.length} published entries</span>}
            </div>
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
            <BlogArchiveView posts={posts} query={query} />

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
