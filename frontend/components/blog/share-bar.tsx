"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type ShareBarProps = {
  title: string;
};

export function ShareBar({ title }: ShareBarProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${pathname}`;
  }, [pathname]);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleCopy = useCallback(async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!canNativeShare) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({ title, url: shareUrl });
    } catch (error) {
      console.error("Share failed", error);
    }
  }, [canNativeShare, handleCopy, shareUrl, title]);

  return (
    <aside className="sticky top-32 flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.32em] text-muted/60">Share</p>
      <button
        type="button"
        onClick={handleNativeShare}
        className="motion-spring rounded-full border border-accent/40 bg-transparent px-4 py-2 text-xs font-medium text-accent transition hover:-translate-y-px hover:scale-[1.02] hover:border-accent focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        {canNativeShare ? "Share" : copied ? "Copied" : "Copy link"}
      </button>
      <div className="flex flex-col gap-2 text-xs text-muted/60">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-white/10 bg-card/60 px-4 py-2 transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Post to X
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-white/10 bg-card/60 px-4 py-2 transition hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Share on LinkedIn
        </a>
      </div>
    </aside>
  );
}
