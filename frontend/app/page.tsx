import { Suspense } from "react";

import {
  getBlogs,
  getHeroSlides,
  getPaintings,
  getBlogCategories,
  getSiteSettings,
  getHomeSections,
  fetchHomeData,
  type Painting,
  type SiteSettings,
  type Blog,
  type BlogCategory,
  type HomeSection
} from "@/lib/api";

import HeroCarousel from "@/components/home/HeroCarousel";
import PaintingsCarousel from "@/components/home/PaintingsCarousel";
import { StoryCard } from "@/components/home/StoryCard";
import { StoryStrip } from "@/components/home/StoryStrip";
import { HeroMasthead } from "@/components/home/HeroMasthead";
import { FeaturedBanner } from "@/components/home/FeaturedBanner";
import SectionWrapper from "@/components/layout/SectionWrapper";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function HomeContent() {
  const [slides, paintingsData, siteSettings, categories, blogResponse, homeSections, homeData] = await Promise.all([
    getHeroSlides().catch(() => []),
    getPaintings({ limit: 12 }).catch(() => ({ items: [] })),
    getSiteSettings().catch(() => null),
    getBlogCategories().catch(() => []),
    getBlogs({ limit: 12 }).catch(() => ({ items: [] })),
    getHomeSections().catch(() => []),
    fetchHomeData().catch(() => null)
  ]);

  const featuredPaintings = selectFeaturedPaintings(paintingsData.items).slice(0, 6);
  const socialLinks = extractSocialLinks(siteSettings);
  const connectLinks = buildConnectLinks(socialLinks);

  const forcedHeroId = siteSettings?.hero_featured_blog_id ?? null;
  const heroPool = homeData?.latest ?? blogResponse.items ?? [];
  const heroStory =
    (forcedHeroId ? heroPool.find((post) => post.id === forcedHeroId) : null) ||
    heroPool.find((post) => post.published_at) ||
    null;
  // Transform hero slides for component
  const heroSlides = slides.length > 0
    ? slides.map((slide, idx) => ({
        id: slide.id ?? idx,
        image_url: slide.image_url,
        title: slide.title || "Memshaheb",
        subtitle: slide.subtitle || "A night-mode magazine for women",
        cta_label: slide.cta_label,
        cta_href: slide.cta_href
      }))
    : [
        {
          id: 0,
          image_url: "/placeholder-hero.jpg",
          title: "Memshaheb",
          subtitle: "Stories · Art · Culture",
          cta_label: "Enter Her World",
          cta_href: "/museum"
        }
      ];

  const latestBlogs = (homeData?.latest ?? blogResponse.items ?? []).filter((post) => post.published_at).slice(0, 6);
  const exclusives = homeData?.exclusives ?? [];
  const culture = homeData?.culture ?? [];
  const { adSections, categorySlots } = alignHomeSections(homeSections);
  const categorySections = await resolveCategorySections(categorySlots, categories, latestBlogs);

  const carouselSlides = heroSlides.map((s) => ({
    image: s.image_url,
    title: s.title || "Memshaheb",
    subtitle: s.subtitle || "",
    cta: s.cta_href ? { label: s.cta_label || "Learn more", href: s.cta_href } : undefined,
  }));

  return (
    <main className="bg-[var(--bg)] text-[var(--ink)]">
      <HeroCarousel slides={carouselSlides} />
      <SectionWrapper>
        <HeroMasthead heroStory={heroStory} slides={heroSlides} siteSettings={siteSettings} />
      </SectionWrapper>
      <SectionWrapper>
        <LatestStories posts={latestBlogs} />
      </SectionWrapper>
      {exclusives.length > 0 && (
        <SectionWrapper>
          <StoryStrip title="Exclusives" href="/blogs?category=exclusive" posts={exclusives} badge="Exclusive" />
        </SectionWrapper>
      )}
      {adSections[0] && (
        <SectionWrapper>
          <FeaturedBanner
            title={adSections[0].title || "Featured Partner"}
            subtitle={adSections[0].subtitle || ""}
            imageUrl={adSections[0].image_url || "/placeholder-hero.jpg"}
            href={adSections[0].target_url || "#"}
            label="Featured Partner"
          />
        </SectionWrapper>
      )}
      {culture.length > 0 && (
        null
      )}
      {categorySections[0] && (
        <SectionWrapper>
          <CategoryStories section={categorySections[0]} />
        </SectionWrapper>
      )}
      {adSections[1] && (
        <SectionWrapper>
          <FeaturedBanner
            title={adSections[1].title || "Spotlight"}
            subtitle={adSections[1].subtitle || ""}
            imageUrl={adSections[1].image_url || "/placeholder-hero.jpg"}
            href={adSections[1].target_url || "#"}
            label="Spotlight"
            gradient
          />
        </SectionWrapper>
      )}
      {categorySections[1] && (
        <SectionWrapper>
          <CategoryStories section={categorySections[1]} />
        </SectionWrapper>
      )}
      <SectionWrapper>
        <PaintingsCarousel items={featuredPaintings} />
      </SectionWrapper>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

function selectFeaturedPaintings(paintings: Painting[]): Painting[] {
  const featured = paintings.filter((painting) => painting.is_featured);
  return featured.length ? featured : paintings;
}

function extractSocialLinks(siteSettings: SiteSettings | null) {
  const entries = siteSettings?.social_links ?? {};
  const pairs = Object.entries(entries)
    .filter(([, href]) => typeof href === "string" && href)
    .map(([label, href]) => ({ label: capitalize(label), href: href as string }));

  return pairs;
}

function buildConnectLinks(socialLinks: { label: string; href: string }[]) {
  const links = [...socialLinks];
  const hasEmail = links.some((link) => link.href.startsWith("mailto:"));
  if (!hasEmail) {
    links.push({ label: "Email", href: "mailto:hello@memshaheb.com" });
  }

  return links.map((link) => ({
    label: link.label,
    href: link.href,
    accent: link.label.toLowerCase() === "email"
  }));
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function alignHomeSections(sections: HomeSection[]) {
  const enabled = sections.filter((s) => s.enabled).sort((a, b) => a.sort_order - b.sort_order);
  const adSections = enabled.filter((s) => s.kind === "AD").slice(0, 2);
  const categorySlots = enabled.filter((s) => s.kind === "CATEGORY").slice(0, 2);
  return { adSections, categorySlots };
}

async function resolveCategorySections(
  slots: HomeSection[],
  categories: BlogCategory[],
  cachedPosts: Blog[],
): Promise<{ category: BlogCategory; posts: Blog[] }[]> {
  const sections = await Promise.all(
    slots.map(async (slot) => {
      if (!slot.category_id) return null;
      const cat = categories.find((c) => c.id === slot.category_id);
      if (!cat) return null;

      const inMemory = cachedPosts.filter((p) => (p.category?.id || p.category_id) === cat.id).slice(0, 4);
      if (inMemory.length) {
        return { category: cat, posts: inMemory };
      }

      const res = await getBlogs({ category: String(slot.category_id), limit: 4 });
      const posts = (res.items ?? []).filter((p) => p.published_at);
      return { category: cat, posts };
    })
  );
  return sections.filter(Boolean) as { category: BlogCategory; posts: Blog[] }[];
}

function LatestStories({ posts }: { posts: Blog[] }) {
  if (!posts.length) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted/80">Latest</p>
          <h2 className="text-3xl font-semibold text-ink">Fresh from Memshaheb</h2>
        </div>
        <a href="/blogs" className="text-sm text-accent hover:text-accent-2">View all</a>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <StoryCard key={post.id} blog={post} />
        ))}
      </div>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
        <div className="h-32 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        <div className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
    </div>
  );
}

// Deprecated banner kept for reference; using FeaturedBanner instead

function CategoryStories({ section }: { section: { category: BlogCategory; posts: Blog[] } }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted/80">Category</p>
          <h2 className="text-3xl font-semibold text-ink">{section.category.name}</h2>
          {section.category.description && <p className="mt-1 text-sm text-muted max-w-2xl">{section.category.description}</p>}
        </div>
        <a href={`/blogs?category=${section.category.slug}`} className="text-sm text-accent hover:text-accent-2">
          See more
        </a>
      </div>
      {section.posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-card/40 p-6 text-sm text-muted">
          No posts in this category yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {section.posts.slice(0, 3).map((post, idx) => (
            <StoryCard key={post.id} blog={post} badge={idx === 0 ? "Featured" : undefined} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryBlock({ title, link, posts, badge }: { title: string; link: string; posts: Blog[]; badge?: string }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted/80">{title}</p>
          <h2 className="text-3xl font-semibold text-ink">{title}</h2>
        </div>
        <a href={link} className="text-sm text-accent hover:text-accent-2">
          View all
        </a>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <StoryCard key={post.id} blog={post} badge={badge} />
        ))}
      </div>
    </section>
  );
}
