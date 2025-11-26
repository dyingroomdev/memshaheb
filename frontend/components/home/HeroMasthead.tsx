import Link from "next/link";
import type { Blog, HeroSlide, SiteSettings } from "@/lib/api";
import { StoryCard } from "./StoryCard";

type HeroMastheadProps = {
  heroStory: Blog | null;
  slides: HeroSlide[];
  siteSettings?: SiteSettings | null;
};

export function HeroMasthead({ heroStory, slides, siteSettings }: HeroMastheadProps) {
  const primarySlide = slides[0];
  const bgImage = primarySlide?.image_url || "/placeholder-hero.jpg";
  const siteTitle = siteSettings?.hero_title?.trim() || "Memshaheb";
  const siteTagline = siteSettings?.hero_tagline?.trim() || siteSettings?.site_tagline?.trim() || "A night-mode magazine for women.";
  const siteDescription =
    siteSettings?.hero_body?.trim() ||
    siteSettings?.seo_description?.trim() ||
    "Stories, exclusives, and culture in a calm, dark canvas crafted by and for women.";
  const primaryCtaLabel = siteSettings?.hero_primary_label?.trim() || (heroStory ? "Read now" : "Learn more");
  const primaryCtaHref = (siteSettings?.hero_primary_href?.trim() || (heroStory ? `/blogs/${heroStory.slug}` : "/blogs")) as string;
  const secondaryCtaLabel = siteSettings?.hero_secondary_label?.trim() || "About Memshaheb";
  const secondaryCtaHref = (siteSettings?.hero_secondary_href?.trim() || "/about") as string;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[rgba(5,4,10,0.85)] via-[rgba(15,10,20,0.7)] to-[rgba(10,8,18,0.9)] p-6 md:p-10">
      <div className="absolute inset-0 -z-10 opacity-60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgImage} alt="" className="h-full w-full object-cover object-center blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-transparent to-[var(--bg)]" />
      </div>

      <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.32em] text-muted">
            {siteTitle}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-ink leading-tight">{siteTagline}</h1>
          <p className="text-muted max-w-xl">{siteDescription}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={primaryCtaHref as any}
              className="rounded-full px-5 py-2.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[var(--bg)] font-semibold shadow-[0_15px_40px_rgba(203,59,145,0.35)]"
            >
              {primaryCtaLabel}
            </Link>
            <Link
              href={secondaryCtaHref as any}
              className="rounded-full px-5 py-2.5 border border-white/15 text-ink hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
            >
              {secondaryCtaLabel}
            </Link>
          </div>
        </div>
        {heroStory && (
          <div className="w-full">
            <StoryCard blog={heroStory} badge="Featured" />
          </div>
        )}
      </div>
    </section>
  );
}
