"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LinkIcon, X } from "lucide-react";
import { useCallback, useMemo } from "react";

import type { MuseumArtifactItem } from "@/lib/museum";

type ArtworkModalProps = {
  artifact: MuseumArtifactItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeUrl?: string | null;
};

export function ArtworkModal({ artifact, open, onOpenChange, storeUrl }: ArtworkModalProps) {
  const shareHref = useMemo(() => {
    if (!artifact?.slug || typeof window === "undefined") {
      return null;
    }
    return `${window.location.origin}/paintings/${artifact.slug}`;
  }, [artifact?.slug]);

  const handleShare = useCallback(async () => {
    if (!shareHref) {
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({ url: shareHref, title: artifact?.title });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareHref);
      }
    } catch {
      // no-op; silent failure is acceptable
    }
  }, [artifact?.title, shareHref]);

  const buyHref =
    artifact?.wc_product_id && storeUrl
      ? `${storeUrl.replace(/\/$/, "")}/product/${artifact.wc_product_id}`
      : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-[fade-slide-up_0.3s_ease]" />
        <Dialog.Content
          className="fixed inset-0 z-50 mx-auto flex max-w-5xl items-center justify-center px-4 py-6 focus:outline-none"
          aria-describedby={artifact ? `${artifact.id}-note` : undefined}
        >
          <div className="relative grid h-[min(90vh,720px)] w-full grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--card)] shadow-[var(--shadow-elevated)] sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            <Dialog.Close
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(14,10,20,0.65)] text-[var(--muted)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
              aria-label="Close artwork modal"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>

            <div className="parallax-wrapper relative h-full overflow-hidden">
              <div className="parallax-item h-full w-full overflow-auto bg-black/10">
                {artifact?.image ? (
                  <Image
                    src={artifact.image}
                    alt={artifact.title}
                    width={1024}
                    height={1280}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    placeholder={artifact.lqip ? "blur" : "empty"}
                    blurDataURL={artifact.lqip ?? undefined}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]/70">
                    Image is in preparation.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
              <div className="space-y-2">
                <Dialog.Title className="text-2xl font-semibold text-[var(--ink)]">
                  {artifact?.title ?? "Untitled work"}
                </Dialog.Title>
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]/80">
                  {(artifact?.year ?? "Undated") + " · " + (artifact?.medium ?? "Medium forthcoming")}
                </p>
              </div>
              <Dialog.Description
                id={artifact ? `${artifact.id}-note` : undefined}
                className={`text-sm leading-relaxed ${
                  artifact?.excerpt ? "text-[var(--muted)]" : "italic text-[var(--muted)]/70"
                }`}
              >
                {artifact?.excerpt ?? "Artist note will arrive after the next studio session."}
              </Dialog.Description>

              <div className="mt-auto flex flex-wrap gap-3">
                {buyHref && (
                  <a
                    href={buyHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Buy on WooCommerce
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {shareHref && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="pill hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
                  >
                    <LinkIcon className="mr-1 h-4 w-4" />
                    Share
                  </button>
                )}
                {artifact?.slug && (
                  <Link
                    href={`/paintings/${artifact.slug}`}
                    className="pill hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
                  >
                    Enter the piece
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
