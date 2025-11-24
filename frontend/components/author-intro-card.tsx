import Image from "next/image";
import type { ReactNode } from "react";

type SocialLink = {
  label: string;
  href: string;
  icon?: ReactNode;
};

type AuthorIntroCardProps = {
  name: string;
  tagline: string;
  portraitUrl?: string | null;
  portraitAlt?: string;
  updatedAt?: string | null;
  socials?: SocialLink[];
};

const FALLBACK_PORTRAIT =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800"><defs><radialGradient id="halo" cx="50%" cy="35%" r="60%"><stop offset="0%" stop-color="#D59BF6" stop-opacity="0.36"/><stop offset="100%" stop-color="#0E0A14" stop-opacity="1"/></radialGradient></defs><rect width="640" height="800" fill="#0E0A14"/><rect width="640" height="800" fill="url(#halo)"/><circle cx="320" cy="320" r="200" fill="#BCA7D9" fill-opacity=".16"/><circle cx="400" cy="560" r="140" fill="#FFAACF" fill-opacity=".14"/></svg>`
  );

export function AuthorIntroCard({
  name,
  tagline,
  portraitUrl,
  portraitAlt = `${name} portrait`,
  updatedAt,
  socials = []
}: AuthorIntroCardProps) {
  const formattedDate = formatUpdatedAt(updatedAt);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-glow-soft backdrop-blur">
      <div className="absolute inset-x-0 -top-40 h-72 blur-3xl">
        <div className="mx-auto h-full w-3/4 rounded-full bg-accent/30" />
      </div>
      <div className="relative grid gap-10 p-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:p-12">
        <div className="mx-auto flex w-full max-w-[16rem] flex-col items-center sm:max-w-[18rem] sm:items-start">
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/15 bg-[#100919] shadow-lg shadow-black/40">
            <div className="absolute inset-0 animate-halo-glow bg-gradient-to-br from-accent/20 via-transparent to-accent-2/20" />
            <Image
              src={portraitUrl || FALLBACK_PORTRAIT}
              alt={portraitAlt}
              width={420}
              height={560}
              sizes="(max-width: 768px) 70vw, 240px"
              className="relative h-full w-full object-cover object-top"
              priority
            />
          </div>
        </div>

        <div className="space-y-8">
          <header className="space-y-4">
            <p className="text-sm uppercase tracking-[0.32em] text-muted/70">Founder Profile</p>
            <h1 className="text-4xl font-semibold text-ink sm:text-5xl">{name}</h1>
            <p className="text-lg text-muted sm:text-xl">{tagline}</p>
          </header>

          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-2 text-sm text-ink transition duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 via-transparent to-accent-2/25 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(213,155,246,0.7)] transition-transform duration-300 group-hover:scale-125 group-focus-visible:scale-125" />
                    <span className="relative font-medium">{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function formatUpdatedAt(updatedAt?: string | null) {
  if (!updatedAt) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric"
    }).format(new Date(updatedAt));
  } catch {
    return null;
  }
}
