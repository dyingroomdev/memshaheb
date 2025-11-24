import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { AuthorTeaserDynamic } from "@/components/blog/author-dynamic";
import { BlogCard } from "@/components/blog/blog-card";
import { Callout, ImageGallery, Poem } from "@/components/blog/mdx-callout";
import { ShareBar } from "@/components/blog/share-bar";
import { FootnoteReference } from "@/components/footnote-reference";
import { getBlog, getBlogs, getSiteSettings } from "@/lib/api";
import { blogToCardData, estimateReadTime, extractFootnotes, formatPublishedDate, replaceFootnoteReferences } from "@/lib/blog-utils";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps) {
  const blog = await getBlog(params.slug);
  if (!blog) {
    return {};
  }
  const { readTime } = blogToCardData(blog);
  const title = blog.meta_title || `${blog.title} — Memshaheb`;
  const description = blog.meta_description ?? blog.excerpt ?? "A story from Memshaheb Magazine.";
  const cover = blog.og_image_url ?? blog.cover_url ?? undefined;
  const canonical = blog.canonical_url || `/blogs/${blog.slug}`;
  const url = canonical;

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: cover ? [{ url: cover, width: 1200, height: 675, alt: blog.title }] : undefined,
      article: {
        publishedTime: blog.published_at ?? blog.created_at,
        modifiedTime: blog.updated_at,
        authors: ["Memshaheb"],
        tags: blog.tags ?? undefined
      }
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined
    },
    other: {
      "reading-time": `${readTime} minutes`
    }
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const blog = await getBlog(params.slug);
  if (!blog) {
    notFound();
  }

  const { markdown, footnotes } = extractFootnotes(blog.content_md ?? "");
  const mdxSource = replaceFootnoteReferences(markdown);
  const compiled = await compileMDX<{ Footnote: { id: string } }>({
    source: mdxSource,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm]
      }
    },
    components: {
      Callout,
      Poem,
      ImageGallery,
      Footnote: ({ id }: { id: string }) => (
        <FootnoteReference label={id} content={footnotes[id] ?? ""} />
      )
    }
  });

  const readTime = blog.read_time_minutes ?? estimateReadTime(blog.content_md ?? "");
  const published = formatPublishedDate(blog.published_at ?? blog.created_at);

  const [{ items: related }, siteSettings] = await Promise.all([
    getBlogs({ limit: 3 }),
    getSiteSettings().catch(() => null)
  ]);
  const relatedFiltered = related.filter((item) => item.slug !== blog.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    name: blog.meta_title || blog.title,
    datePublished: blog.published_at ?? blog.created_at,
    dateModified: blog.updated_at,
    image: blog.og_image_url ? [blog.og_image_url] : blog.cover_url ? [blog.cover_url] : undefined,
    author: {
      "@type": "Person",
      name: "Memshaheb Editorial"
    },
    publisher: {
      "@type": "Organization",
      name: "Memshaheb Magazine"
    },
    description: blog.meta_description ?? blog.excerpt ?? "",
    keywords: blog.tags?.join(", ") ?? undefined
  };

  return (
    <>
    <main className="bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-16 sm:px-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_200px]">
          <article className="prose prose-invert max-w-none">
            <header className="mb-10 space-y-6">
              <p className="text-xs uppercase tracking-[0.32em] text-muted/60">{published ?? "Undated"}</p>
              <h1 className="text-4xl font-semibold text-ink sm:text-5xl">{blog.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-muted/60">
                {blog.category?.name && (
                  <a
                    href={`/blogs?category=${blog.category.slug ?? blog.category.id}`}
                    className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 text-[0.6rem] text-[var(--accent)] hover:border-[var(--accent-2)]/60 hover:text-[var(--accent-2)] transition"
                  >
                    {blog.category.name}
                  </a>
                )}
                {blog.tags?.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-card/60 px-3 py-1 text-[0.6rem]">
                    {tag}
                  </span>
                ))}
                <span>{readTime} min read</span>
              </div>
              {blog.cover_url && (
                <figure className="overflow-hidden rounded-3xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={blog.cover_url} alt={blog.title} className="w-full object-cover" />
                </figure>
              )}
            </header>

            <div className="prose prose-invert max-w-none">
              {compiled.content}
            </div>

            {Object.keys(footnotes).length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-semibold text-ink">Footnotes</h2>
                <ol className="mt-6 space-y-3 text-sm text-muted">
                  {Object.entries(footnotes).map(([id, text]) => (
                    <li key={id} id={`fn-${id}`}>
                      <span className="font-semibold text-accent">{id}.</span> {text}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <AuthorTeaserDynamic
              fallbackName="Memshaheb Editorial"
              fallbackBio="Night-mode magazine crafted by women for women—essays, art, and cultural signals after dark."
            />

            {relatedFiltered.length > 0 && (
              <section className="mt-16 space-y-6">
                <h2 className="text-2xl font-semibold text-ink">You might also enjoy</h2>
                <div className="space-y-4">
                  {relatedFiltered.map((item) => (
                    <a
                      key={item.id}
                      href={`/blogs/${item.slug}`}
                      className="group flex gap-4 rounded-2xl border border-white/10 bg-card/60 p-4 hover:border-accent/40 transition"
                    >
                      {item.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="h-24 w-32 rounded-xl object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs uppercase tracking-[0.28em] text-muted flex flex-wrap gap-2">
                          {item.category?.name && <span className="text-accent">{item.category.name}</span>}
                          {item.published_at && <span>{new Date(item.published_at).toLocaleDateString()}</span>}
                        </div>
                        <h3 className="mt-1 text-lg font-semibold text-ink group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        {item.excerpt && (
                          <p className="mt-1 text-sm text-muted line-clamp-2">{item.excerpt}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>

          <ShareBar title={blog.title} />
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </main>
  </>
);
}
