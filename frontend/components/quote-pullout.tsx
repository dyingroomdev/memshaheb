type QuotePulloutProps = {
  quote: string;
  attribution?: string;
};

export function QuotePullout({ quote, attribution }: QuotePulloutProps) {
  if (!quote) {
    return null;
  }

  return (
    <aside className="relative mt-12 overflow-hidden rounded-3xl border border-accent/30 bg-card/70 p-8 shadow-glow-soft backdrop-blur sm:p-12">
      <div className="absolute -left-20 top-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-accent-2/20 blur-[100px]" />
      <blockquote className="relative">
        <p className="text-3xl italic text-ink sm:text-4xl">
          “{quote}”
          <span className="mt-4 block h-1 w-24 rounded-full bg-gradient-to-r from-accent to-accent-2" />
        </p>
        {attribution && <cite className="mt-6 block text-sm uppercase tracking-[0.28em] text-muted/70">{attribution}</cite>}
      </blockquote>
    </aside>
  );
}
