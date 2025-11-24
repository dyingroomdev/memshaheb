import type { ReactNode } from "react";

type CalloutProps = {
  type?: "note" | "warning" | "tip";
  title?: string;
  children: ReactNode;
};

const toneStyles: Record<string, string> = {
  note: "border-accent/40 bg-accent/10 text-ink",
  warning: "border-warning/50 bg-warning/10 text-warning",
  tip: "border-success/40 bg-success/10 text-success"
};

export function Callout({ type = "note", title, children }: CalloutProps) {
  return (
    <aside className={`mt-8 rounded-3xl border px-6 py-5 shadow-glow-soft backdrop-blur ${toneStyles[type] ?? toneStyles.note}`}>
      {title && <p className="text-xs uppercase tracking-[0.32em] text-muted/70">{title}</p>}
      <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
    </aside>
  );
}

type PoemProps = {
  children: ReactNode;
};

export function Poem({ children }: PoemProps) {
  return <div className="mt-8 whitespace-pre-line font-display text-lg leading-relaxed text-ink">{children}</div>;
}

type ImageGalleryProps = {
  images: Array<{ src: string; alt?: string } | string>;
};

export function ImageGallery({ images }: ImageGalleryProps) {
  const parsed = images.map((item) => (typeof item === "string" ? { src: item, alt: "" } : item));
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {parsed.map((image, index) => (
        <figure key={`${image.src}-${index}`} className="overflow-hidden rounded-3xl border border-white/10 bg-card/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt={image.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
          {image.alt && <figcaption className="p-3 text-xs text-muted">{image.alt}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
