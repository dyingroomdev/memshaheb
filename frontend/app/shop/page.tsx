import type { Metadata } from "next";
import { getBlogCategories, getBlogs, type Blog, type BlogCategory } from "@/lib/api";
import { BlogCard } from "@/components/blog/blog-card";
import { blogToCardData } from "@/lib/blog-utils";

export const metadata: Metadata = {
  title: "Editor's Picks — Memshaheb Magazine",
  description: "Curated columns, series, and ad spots from Memshaheb’s editors."
};

export default async function EditorsPicksPage() {
  const [blogResponse, categories] = await Promise.all([
    getBlogs({ limit: 18 }),
    getBlogCategories().catch(() => [])
  ]);
  const posts = (blogResponse.items ?? []).filter((p) => p.published_at);
  const feature = posts[0];
  const secondary = posts.slice(1, 4);
  const categorySections = buildCategorySections(categories, posts);

  return (
    <main className="bg-[var(--bg)] text-[var(--ink)]">
      <section className="relative overflow-hidden px-6 pb-16 pt-28 sm:px-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(154,37,126,0.15)] via-[rgba(15,10,18,0.9)] to-[rgba(203,59,145,0.18)] blur-[2px]" />
        {feature && (
          <div className="mx-auto grid max-w-6xl gap-8 rounded-[2.4rem] border border-white/10 bg-card/80 p-8 shadow-glow-medium backdrop-blur-xl lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              {feature.cover_url ? (
                <img src={feature.cover_url} alt={feature.title} className="h-full w-full object-cover min-h-[280px]" />
              ) : (
                <div className="h-64 w-full bg-[var(--surface)]" />
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-muted/80">Editor's Pick</p>
              <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{feature.title}</h1>
              {feature.excerpt && <p className="text-base text-muted sm:text-lg">{feature.excerpt}</p>}
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
                {feature.category?.name && <span className="text-accent">{feature.category.name}</span>}
                {feature.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-2 py-1">
                    {tag}
                  </span>
                ))}
                <span>{blogToCardData(feature).readTime} min read</span>
              </div>
              <a
                href={`/blogs/${feature.slug}`}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/30"
              >
                Read the feature
              </a>
            </div>
          </div>
        )}
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 space-y-16">
        {secondary.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-ink">Secondary picks</h2>
              <a href="/blogs" className="text-sm text-accent hover:text-accent-2">View all stories</a>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {secondary.map((post) => (
                <BlogCard key={post.id} blog={post} />
              ))}
            </div>
          </section>
        )}

        {categorySections.map((section) => (
          <section key={section.category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-muted/80">Series</p>
                <h3 className="text-xl font-semibold text-ink">{section.category.name}</h3>
                {section.category.description && (
                  <p className="text-sm text-muted">{section.category.description}</p>
                )}
              </div>
              <a
                href={`/blogs?category=${section.category.slug}`}
                className="text-sm text-accent hover:text-accent-2"
              >
                Explore
              </a>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.posts.map((post) => (
                <BlogCard key={post.id} blog={post} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function buildCategorySections(categories: BlogCategory[], posts: Blog[]) {
  const map = new Map<number, Blog[]>();
  posts.forEach((p) => {
    const id = p.category?.id || p.category_id;
    if (!id) return;
    map.set(id, [...(map.get(id) || []), p]);
  });
  return categories
    .filter((cat) => map.has(cat.id))
    .map((cat) => ({ category: cat, posts: (map.get(cat.id) || []).slice(0, 6) }))
    .slice(0, 3);
}
