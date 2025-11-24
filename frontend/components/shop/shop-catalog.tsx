"use client";

import { useMemo, useState } from "react";

import type { CommerceProduct, Painting } from "@/lib/api";
import { decorateProduct, type ProductViewModel } from "@/lib/commerce-utils";

import { ProductCard } from "@/components/shop/product-card";
import { QuickViewModal } from "@/components/shop/quick-view-modal";

type ShopCatalogProps = {
  products: ProductViewModel[];
  paintings: Record<number, Painting>;
};

type TabKey = "PAINTING" | "BOOK";
type SortOption = "FEATURED" | "PRICE_ASC" | "PRICE_DESC" | "TITLE";

export function ShopCatalog({ products, paintings }: ShopCatalogProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("PAINTING");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductViewModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("FEATURED");

  const filtered = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (product.kind !== activeTab) return false;
      if (inStockOnly && product.isSoldOut) return false;
      if (!normalized) return true;
      const painting = product.kind === "PAINTING" && product.local_id ? paintings[product.local_id] : undefined;
      const haystack = [
        product.title ?? "",
        product.notes ?? "",
        painting?.title ?? "",
        painting?.description ?? ""
      ].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [products, activeTab, inStockOnly, searchQuery, paintings]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortOption) {
      case "PRICE_ASC":
        copy.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
        break;
      case "PRICE_DESC":
        copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "TITLE":
        copy.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
        break;
      default:
        copy.sort((a, b) => {
          const weight = (value: ProductViewModel) => {
            if (value.badge === "new") return 0;
            if (value.badge === "limited") return 1;
            if (!value.isSoldOut) return 2;
            return 3;
          };
          return weight(a) - weight(b);
        });
    }
    return copy;
  }, [filtered, sortOption]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 rounded-[2rem] border border-[var(--border-soft)] bg-[rgba(24,19,34,0.65)] p-6 shadow-[var(--shadow-ambient)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex rounded-full border border-white/10 bg-card/70 p-1">
            {(["PAINTING", "BOOK"] as TabKey[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] transition ${
                  activeTab === tab ? "bg-[var(--accent)] text-[#13081d]" : "text-[var(--muted)] hover:text-[var(--accent)]"
                }`}
              >
                {tab === "PAINTING" ? "Paintings" : "Books"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[var(--muted)]/70">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
              className="h-4 w-4 rounded border border-white/20 bg-card/70 text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
            />
            In stock only
          </label>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="search"
              placeholder="Search by title, notes, medium…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-card/70 px-5 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            />
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[var(--muted)]/70">
            Sort
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className="rounded-full border border-white/10 bg-card/70 px-4 py-2 text-xs uppercase tracking-[0.32em] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            >
              <option value="FEATURED">Featured</option>
              <option value="PRICE_ASC">Price ↑</option>
              <option value="PRICE_DESC">Price ↓</option>
              <option value="TITLE">Title A–Z</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((product) => (
          <ProductCard
            key={`${product.kind}-${product.wc_product_id ?? product.local_id ?? product.title ?? ""}`}
            product={product}
            painting={product.kind === "PAINTING" && product.local_id ? paintings[product.local_id] : undefined}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-card/70 p-12 text-center text-[var(--muted)] shadow-[var(--shadow-ambient)]">
          Nothing to show just yet. Refine your filters or check back for new releases.
        </div>
      )}

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          painting={
            quickViewProduct.kind === "PAINTING" && quickViewProduct.local_id
              ? paintings[quickViewProduct.local_id]
              : undefined
          }
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export function decorateProducts(products: CommerceProduct[], paintings: Record<number, Painting>): ProductViewModel[] {
  return products.map((product) =>
    decorateProduct(product, product.kind === "PAINTING" && product.local_id ? paintings[product.local_id] : undefined)
  );
}
