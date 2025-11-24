"use client";

import Image from "next/image";
import type { MouseEvent } from "react";

import type { Painting } from "@/lib/api";
import { formatPrice, statusLabel, type ProductViewModel } from "@/lib/commerce-utils";

type ProductCardProps = {
  product: ProductViewModel;
  painting?: Painting | null;
  onQuickView: (product: ProductViewModel) => void;
};

export function ProductCard({ product, painting, onQuickView }: ProductCardProps) {
  const price = formatPrice(product.price);
  const ribbon = product.badge ? badgeLabel(product.badge) : null;
  const paintingYear = painting?.year ?? null;
  const isPainting = product.kind === "PAINTING";

  const handleQuickView = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onQuickView(product);
  };

  const soldOutClass = product.isSoldOut ? "grayscale opacity-70" : "";

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-[var(--border-soft)] bg-[rgba(20,15,28,0.86)] shadow-[var(--shadow-ambient)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/60 hover:shadow-[0_50px_120px_-60px_rgba(10,8,20,0.9)]"
    >
      {ribbon && (
        <div className="absolute left-0 top-0 z-10 rounded-br-[2rem] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#13081d] shadow-md">
          {ribbon}
        </div>
      )}
      <div className={`relative aspect-[4/3] overflow-hidden ${product.isSoldOut ? "grayscale opacity-80" : ""}`}>
        {painting?.image_url ? (
          <Image
            src={painting.image_url}
            alt={painting.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 24vw"
            placeholder={painting.lqip_data ? "blur" : "empty"}
            blurDataURL={painting.lqip_data ?? undefined}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/15 to-accent-2/20 text-sm text-muted">
            {product.kind === "PAINTING" ? "Artwork preview" : "Book cover"}
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(10,8,20,0.78)] via-transparent to-transparent opacity-80 transition group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5 text-xs uppercase tracking-[0.32em] text-[rgba(255,255,255,0.75)]">
          <span>{isPainting ? "Painting" : "Book"}</span>
          <span>{statusLabel(product.status)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {paintingYear && <span className="pill text-[0.6rem]">{paintingYear}</span>}
            {painting?.medium && <span className="pill text-[0.6rem]">{painting.medium}</span>}
            {product.isSoldOut && <span className="pill text-[0.6rem] uppercase">Sold out</span>}
          </div>
          <h3 className="text-xl font-semibold text-[var(--ink)]">{product.title ?? painting?.title ?? "Untitled"}</h3>
          <p className="text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
            {painting?.description ?? product.notes ?? "Edition details coming soon."}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleQuickView}
            className="motion-spring rounded-full border border-[var(--accent)]/40 bg-transparent px-5 py-2 text-xs font-medium text-[var(--accent)] transition hover:-translate-y-px hover:scale-[1.02] hover:border-[var(--accent)] focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
          >
            Quick view
          </button>
          <span className="text-sm font-semibold text-[var(--ink)]">{price ?? "Contact"}</span>
        </div>
      </div>
    </article>
  );
}

function badgeLabel(badge: ProductViewModel["badge"]): string {
  switch (badge) {
    case "new":
      return "New";
    case "limited":
      return "Limited";
    case "signed":
      return "Signed";
    default:
      return "";
  }
}
