import type { CommerceProduct, Painting } from "@/lib/api";

const TRACKING_PARAMS = new URLSearchParams({
  utm_source: "memshaheb",
  utm_medium: "magazine",
  utm_campaign: "mem_shop"
}).toString();

type ProductBadge = "new" | "limited" | "signed" | null;

export type ProductViewModel = CommerceProduct & {
  badge: ProductBadge;
  status: "instock" | "outofstock" | "unknown";
  isSoldOut: boolean;
  wooUrl: string | null;
};

export function decorateProduct(product: CommerceProduct, painting?: Painting | null): ProductViewModel {
  const status = (product.stock_status ?? "unknown").toLowerCase() as ProductViewModel["status"];
  const isSoldOut = status === "outofstock" || product.stock_quantity === 0;
  const badge = deriveBadge(product, painting);

  const wooUrl = product.wc_product_id
    ? `${process.env.NEXT_PUBLIC_WC_STORE_URL?.replace(/\/$/, "") ?? "https://store.memshaheb.com"}/product/${product.wc_product_id}?${TRACKING_PARAMS}`
    : null;

  return {
    ...product,
    badge,
    status,
    isSoldOut,
    wooUrl
  };
}

function deriveBadge(product: CommerceProduct, painting?: Painting | null): ProductBadge {
  if (painting?.is_featured) {
    return "limited";
  }
  const updated = product.last_synced_at ? new Date(product.last_synced_at) : null;
  if (updated && Date.now() - updated.getTime() < 1000 * 60 * 60 * 24 * 21) {
    return "new";
  }
  if (product.notes?.toLowerCase().includes("signed")) {
    return "signed";
  }
  return null;
}

export function formatPrice(value: number | null): string | null {
  if (value == null) {
    return null;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
}

export function statusLabel(status: ProductViewModel["status"]): string {
  switch (status) {
    case "instock":
      return "In stock";
    case "outofstock":
      return "Sold out";
    default:
      return "Check availability";
  }
}
