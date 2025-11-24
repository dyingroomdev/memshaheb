type SocialLink = {
  label: string;
  href: string;
  accent?: boolean;
};

type ConnectPanelProps = {
  links: SocialLink[];
};

export function ConnectPanel({ links }: ConnectPanelProps) {
  if (!links.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 text-center sm:px-6 lg:px-8">
      <div className="space-y-6">
        <h3 className="font-jost text-3xl text-[var(--ink)] sm:text-4xl">Connect with Memshaheb</h3>
        <p className="text-base text-[var(--muted)]">
          Our stories live where conversations begin.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
              className={`inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 ${
                link.accent
                  ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[var(--bg)] shadow-[var(--shadow-ambient)] hover:shadow-[var(--shadow-elevated)]"
                  : "border border-[var(--border-soft)] bg-[rgba(16,12,24,0.75)] text-[var(--ink)] hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
