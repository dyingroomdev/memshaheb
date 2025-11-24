"use client";

import Image from "next/image";
import { useEffect } from "react";

import type { Painting } from "@/lib/api";
import { formatPrice, statusLabel, type ProductViewModel } from "@/lib/commerce-utils";

type QuickViewModalProps = {
  product: ProductViewModel | null;
  painting?: Painting | null;
  onClose: () => void;
};

export function QuickViewModal({ product, painting, onClose }: QuickViewModalProps) {
  useEffect(() => {
    if (!product) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const price = formatPrice(product.price);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-card/90 shadow-[0_80px_160px_-80px_rgba(10,8,20,0.85)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-4 rounded-full border border-white/20 bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.32em] text-muted transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Close
        </button>

        <div className="grid gap-6 p-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            {painting?.image_url ? (
              <Image
                src={painting.image_url}
                alt={painting.title}
                fill
                className="object-cover"
                placeholder={painting.lqip_data ? "blur" : "empty"}
                blurDataURL={painting.lqip_data ?? undefined}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/15 to-accent-2/25 text-sm text-muted">
                {product.kind === "PAINTING" ? "Artwork preview" : "Book preview"}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.32em] text-muted/60">
                {product.kind === "PAINTING" ? "Painting" : "Book"} · {statusLabel(product.status)}
              </span>
              <h2 className="text-3xl font-semibold text-ink">{product.title ?? painting?.title ?? "Untitled"}</h2>
              {painting?.year && (
                <p className="text-xs uppercase tracking-[0.28em] text-muted/60">{painting.year}</p>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted">
              {painting?.description ?? product.notes ?? "Details coming soon from the studio catalogue."}
            </p>

            {painting && (
              <dl className="grid grid-cols-2 gap-4 text-xs uppercase tracking-[0.24em] text-muted/60">
                {painting.medium && (
                  <div>
                    <dt>Medium</dt>
                    <dd className="text-sm normal-case tracking-normal text-ink">{painting.medium}</dd>
                  </div>
                )}
                {painting.dimensions && (
                  <div>
                    <dt>Dimensions</dt>
                    <dd className="text-sm normal-case tracking-normal text-ink">{painting.dimensions}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xl font-semibold text-ink">{price ?? "Contact"}</span>
              {product.wooUrl && (
                <a
                  href={product.wooUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="motion-spring inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/20 px-6 py-3 text-sm font-medium text-accent transition hover:-translate-y-px hover:scale-[1.02] hover:border-accent focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  Buy on WooCommerce
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
