type FeaturedBannerProps = {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  href: string;
  label?: string;
  gradient?: boolean;
};

export function FeaturedBanner({ title, subtitle, imageUrl, href, label = "Featured", gradient }: FeaturedBannerProps) {
  return (
    <a
      href={href}
      className="group relative block overflow-hidden rounded-3xl border border-white/10 shadow-glow-medium"
    >
      <div
        className={`absolute inset-0 ${gradient ? 'bg-gradient-to-r from-[var(--accent)]/40 via-transparent to-[var(--accent-2)]/30' : 'bg-gradient-to-r from-[var(--surface)]/60 to-transparent'}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/30 to-transparent p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-accent-soft">{label}</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-2 max-w-3xl text-sm text-muted line-clamp-2">{subtitle}</p>}
      </div>
    </a>
  );
}
