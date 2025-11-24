type TimelineItem = {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
};

type TimelineBeadsProps = {
  items: TimelineItem[];
};

export function TimelineBeads({ items }: TimelineBeadsProps) {
  const timeline = items.filter((item) => item.title || item.description);

  if (timeline.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Milestones"
      className="relative mt-24 rounded-3xl border border-white/10 bg-card/60 px-6 py-12 shadow-glow-soft backdrop-blur sm:px-12"
    >
      <div className="absolute left-9 top-12 bottom-12 hidden w-px bg-gradient-to-b from-accent/50 via-white/20 to-accent-2/40 sm:block" />
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Timeline</h2>

      <ol className="mt-10 space-y-8">
        {timeline.map((item, index) => (
          <li
            key={item.id}
            className="group relative rounded-3xl border border-white/5 bg-card/70 p-6 shadow-lg shadow-black/5 transition duration-300 hover:border-accent/60 hover:shadow-glow-soft"
          >
            <div className="absolute -left-[3.35rem] top-6 hidden h-3 w-3 translate-x-1/2 rounded-full bg-accent shadow-[0_0_24px_rgba(213,155,246,0.6)] transition-transform duration-300 group-hover:scale-125 sm:block" />
            <div className="absolute -left-[3.35rem] top-6 hidden h-0.5 w-6 -translate-x-1/2 bg-gradient-to-r from-accent/40 to-transparent sm:block" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted/80">{item.timeLabel}</p>
              <span className="h-0.5 w-10 rounded-full bg-accent/40 transition-all duration-300 group-hover:w-16 group-hover:bg-accent/60" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-ink sm:text-2xl">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{item.description}</p>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
              style={{
                background:
                  index % 2 === 0
                    ? "radial-gradient(60% 80% at 20% 20%, rgba(213,155,246,0.18), transparent 60%)"
                    : "radial-gradient(60% 80% at 80% 20%, rgba(255,170,207,0.18), transparent 60%)"
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
