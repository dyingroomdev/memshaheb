type AuthorTeaserProps = {
  name: string;
  bio: string;
  avatarUrl?: string | null;
};

export function AuthorTeaser({ name, bio, avatarUrl }: AuthorTeaserProps) {
  return (
    <section className="mt-16 flex items-center gap-6 rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-20 w-20 rounded-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-2/20 text-lg font-semibold text-ink">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-muted/60">About the author</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{name}</h3>
        <p className="mt-2 text-sm text-muted">{bio}</p>
      </div>
    </section>
  );
}
