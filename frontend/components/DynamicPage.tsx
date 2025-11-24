'use client';

import { useEffect, useState } from "react";
import type { Page } from "@/lib/api";
import { fetchPage } from "@/lib/api";

type DynamicPageProps = {
  slug: string;
};

export function DynamicPage({ slug }: DynamicPageProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPage(slug)
      .then((data) => {
        if (mounted) {
          setPage(data);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) setError("Failed to load page.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!page || error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-[var(--muted)]">
        {error || "Content unavailable."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-ink tracking-tight">{page.title}</h1>
        {page.description && <p className="text-muted">{page.description}</p>}
      </header>

      {page.sections?.length ? (
        <article className="space-y-10">
          {page.sections
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <section key={section.id} id={section.anchor || undefined} className="space-y-3 border-b border-white/5 pb-6 last:border-none">
                <h2 className="text-2xl font-semibold text-ink">{section.title}</h2>
                <div
                  className="prose prose-invert max-w-none text-muted leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </section>
            ))}
        </article>
      ) : (
        <p className="text-muted text-center">No content yet.</p>
      )}
    </div>
  );
}
