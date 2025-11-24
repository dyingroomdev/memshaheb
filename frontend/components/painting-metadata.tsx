import type { Painting, WooCommerceBadge } from "@/lib/api";

type PaintingMetadataProps = {
  painting: Painting;
  badge: WooCommerceBadge | null;
  storeUrl?: string | null;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0
});

const DEFAULT_MEDIUM = "Medium information coming soon.";
const DEFAULT_DIMENSIONS = "Dimensions will be shared soon.";
const DEFAULT_TAGS = ["Uncategorized"];
const DEFAULT_PRICE = "Price available on request.";

export function PaintingMetadata({ painting, badge, storeUrl }: PaintingMetadataProps) {
  const stockStatus = badge?.stock_status ?? "UNKNOWN";
  const normalizedStatus = stockStatus?.toLowerCase() ?? "unknown";
  const stockLabel =
    normalizedStatus === "instock"
      ? "In Stock"
      : normalizedStatus === "outofstock"
        ? "Sold"
        : normalizedStatus ?? "Unavailable";

  const mediumValue = painting.medium?.trim();
  const dimensionsValue = painting.dimensions?.trim();
  const publishedValue = painting.published_at ? new Date(painting.published_at) : null;
  const tagsList = painting.tags?.filter((tag) => Boolean(tag?.trim())) ?? [];
  const hasTags = tagsList.length > 0;

  const price =
    badge?.price != null ? currencyFormatter.format(badge.price) : null;

  const wcHref =
    badge?.wc_product_id && storeUrl
      ? `${storeUrl.replace(/\/$/, "")}/product/${badge.wc_product_id}`
      : null;

  return (
    <section className="rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glow-soft backdrop-blur">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm uppercase tracking-[0.32em] text-muted/70">Metadata</span>
        <span className="rounded-full border border-white/10 bg-card/60 px-3 py-1 text-xs text-muted">
          {painting.year ?? "Undated"}
        </span>
      </header>

      <dl className="mt-4 grid gap-3 text-sm text-muted">
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs uppercase tracking-[0.28em] text-muted/60">Medium</dt>
          <dd className={mediumValue ? "" : "italic text-muted/70"}>
            {mediumValue || DEFAULT_MEDIUM}
          </dd>
        </div>

        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs uppercase tracking-[0.28em] text-muted/60">Dimensions</dt>
          <dd className={dimensionsValue ? "" : "italic text-muted/70"}>
            {dimensionsValue || DEFAULT_DIMENSIONS}
          </dd>
        </div>

        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs uppercase tracking-[0.28em] text-muted/60">Published</dt>
          <dd className={publishedValue ? "" : "italic text-muted/70"}>
            {publishedValue
              ? publishedValue.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })
              : "Publishing soon."}
          </dd>
        </div>

        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs uppercase tracking-[0.28em] text-muted/60">Tags</dt>
          <dd className="flex flex-wrap gap-2">
            {(hasTags ? tagsList : DEFAULT_TAGS).map((tag) => (
              <span
                key={tag}
                className={`rounded-full border px-3 py-1 text-xs ${
                  hasTags
                    ? "border-accent/25 bg-accent/10 text-accent"
                    : "border-muted/30 bg-muted/5 text-muted/70 italic"
                }`}
              >
                {tag}
              </span>
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusClass(normalizedStatus)}`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {stockLabel}
        </span>
        <span className={`text-sm font-semibold ${price ? "text-ink" : "text-muted/70 italic"}`}>
          {price || DEFAULT_PRICE}
        </span>
      </div>

      {wcHref && (
        <div className="mt-4">
          <a
            href={wcHref}
            target="_blank"
            rel="noreferrer noopener"
            className="motion-spring inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/20 px-5 py-2 text-sm font-medium text-accent transition hover:-translate-y-px hover:scale-[1.02] hover:border-accent focus-visible:-translate-y-px focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            Buy on WooCommerce
          </a>
        </div>
      )}
    </section>
  );
}

function statusClass(status: string) {
  switch (status) {
    case "instock":
      return "border-success/40 bg-success/10 text-success";
    case "outofstock":
      return "border-danger/40 bg-danger/10 text-danger";
    default:
      return "border-muted/40 bg-muted/10 text-muted";
  }
}
