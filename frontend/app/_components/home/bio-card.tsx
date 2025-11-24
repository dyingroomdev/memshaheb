import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

import type { Biography } from "@/lib/api";

type SocialLink = {
  label: string;
  href: string;
};

type BioCardProps = {
  biography: Biography | null;
  socialLinks: SocialLink[];
};

export function BioCard({ biography, socialLinks }: BioCardProps) {
  const name = biography?.name ?? "Memshaheb";
  const tagline = biography?.tagline ??
    "Author, painter, and philosopher exploring the space between nightfall and memory.";
  const portraitUrl = biography?.portrait_url ?? undefined;
  const quote = biography?.quote ?? "My canvases are journals — I write with pigment instead of ink.";
  const attribution = biography?.quote_attribution ?? "Memshaheb Editorial";

  const instagramHref = socialLinks.find((link) => link.label.toLowerCase() === "instagram")?.href;

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 rounded-[2.5rem] border border-[var(--border-soft)] bg-[rgba(24,19,34,0.72)] px-8 py-10 shadow-[var(--shadow-ambient)] backdrop-blur sm:px-10 lg:flex-row lg:items-center lg:px-14">
      <div className="mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[rgba(12,8,18,0.6)] shadow-[var(--shadow-elevated)]">
        {portraitUrl ? (
          <Image
            src={portraitUrl}
            alt={name}
            width={640}
            height={860}
            priority
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--muted)]/70">
            Portrait coming soon.
          </div>
        )}
      </div>

      <div className="flex-1 space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]/70">Meet</p>
          <h2 className="font-jost text-4xl text-[var(--ink)] sm:text-5xl">{name}</h2>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted)]/90 sm:text-xl">
            {tagline}
          </p>
        </header>

        <blockquote className="space-y-3 rounded-2xl border border-[var(--border-soft)] bg-[rgba(10,8,18,0.6)] p-6">
          <p className="text-xl italic leading-relaxed text-[var(--ink)]/90">
            “{quote}”
          </p>
          <footer className="text-sm tracking-[0.32em] text-[var(--muted)]/70">— {attribution}</footer>
        </blockquote>

        <div className="flex flex-wrap items-center gap-4">
          {instagramHref && (
            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-3 rounded-full border border-[var(--border-soft)] px-5 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          )}
          <Link
            href="/about"
            className="pill hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
