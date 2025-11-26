import { API_BASE_URL } from "./config";

const API_BASE = API_BASE_URL;
const CATEGORY_ENDPOINT = "/blog-categories";
const BLOG_ENDPOINT = "/blogs";

export type HeroSlide = {
  id: number;
  image_url: string;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
};

type HeroSlideListResponse = {
  items: HeroSlide[];
};

export type BiographyTimelineItem = {
  time_label: string;
  title: string;
  description: string;
};

export type Biography = {
  id: number;
  name: string | null;
  tagline: string | null;
  quote: string | null;
  quote_attribution: string | null;
  rich_text: string | null;
  portrait_url: string | null;
  timeline: BiographyTimelineItem[];
  updated_by_id?: number | null;
  updated_at: string;
};

export type SiteSettings = {
  social_links?: Record<string, string | undefined> | null;
  nav_links?: NavLinkNode[] | null;
  site_title?: string | null;
  site_tagline?: string | null;
  seo_description?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  seo_image_url?: string | null;
  hero_title?: string | null;
  hero_tagline?: string | null;
  hero_body?: string | null;
  hero_primary_label?: string | null;
  hero_primary_href?: string | null;
  hero_secondary_label?: string | null;
  hero_secondary_href?: string | null;
  hero_featured_blog_id?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  google_analytics_id?: string | null;
  google_site_verification?: string | null;
  bing_site_verification?: string | null;
  manual_total_views?: number | null;
  ga_view_sample?: number | null;
};

export type NavLinkNode = {
  label: string;
  href?: string;
  sort_order?: number;
  enabled?: boolean;
  kind?: 'custom' | 'page' | 'category' | 'dropdown';
  target_id?: number | string | null;
  children?: NavLinkNode[];
};

export type PhilosophyManifestoBlock = {
  title: string;
  body: string;
};

export type Philosophy = {
  id: number;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  manifesto_blocks: PhilosophyManifestoBlock[];
  updated_at: string;
};

export type Blog = {
  id: number;
  title: string;
  slug: string;
  content_md: string;
  cover_url: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  read_time_minutes?: number | null;
  category?: BlogCategory | null;
  category_id?: number | null;
  author_id?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
};

export type BlogListResponse = {
  items: Blog[];
  next_cursor?: string | null;
};

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export type Painting = {
  id: number;
  title: string;
  description?: string | null;
  year?: number | null;
  medium?: string | null;
  dimensions?: string | null;
  image_url?: string | null;
  lqip_data?: string | null;
  tags?: string[] | null;
  wc_product_id?: number | null;
  is_featured: boolean;
  slug: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type PaintingListResponse = {
  items: Painting[];
  next_cursor?: string | null;
};

export type HomeSection = {
  id: number;
  kind: "AD" | "CATEGORY";
  title?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
  target_url?: string | null;
  category_id?: number | null;
  sort_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type PageSection = {
  id: number;
  title: string;
  content: string;
  order: number;
  anchor?: string | null;
};

export type Page = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  sections?: PageSection[];
};

export type Submission = {
  id: number;
  name: string;
  email: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
};

export type PaintingFilters = {
  years: number[];
  media: string[];
  colors: string[];
};

export type WooCommerceBadge = {
  wc_product_id: number | null;
  stock_status: string | null;
  price: number | null;
  last_synced_at: string | null;
};

export type CommerceProduct = {
  wc_product_id: number | null;
  kind: "BOOK" | "PAINTING";
  local_id: number | null;
  title: string | null;
  price: number | null;
  stock_status: string | null;
  stock_quantity: number | null;
  sync_state: string | null;
  last_synced_at: string | null;
  notes?: string | null;
};

type CommerceProductList = {
  items: CommerceProduct[];
};

export type MuseumRoom = {
  id: number;
  title: string;
  slug: string;
  intro?: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type MuseumArtifact = {
  id: number;
  room_id: number;
  painting_id: number;
  sort: number;
  hotspot: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  painting?: Painting | null;
};

export type GetPaintingsParams = {
  query?: string;
  year?: number;
  medium?: string;
  tags?: string[];
  category?: string;
  cursor?: string;
  limit?: number;
};

// Admin Pages helpers
export type AdminPage = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  is_active?: boolean;
  sections: PageSection[];
  updated_at?: string;
};

export async function fetchAdminPage(slug: string): Promise<AdminPage> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/pages/admin/slug/${slug}`, {
    headers: {
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
  if (!res.ok) throw new Error("Failed to load page");
  return res.json();
}

export async function updateAdminPageMeta(slug: string, data: { title: string; description?: string | null; is_active?: boolean }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/pages/admin/slug/${slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to save page");
  return res.json();
}

export async function createPageSectionBySlug(slug: string, data: { page_id: number; title: string; content: string; order: number; anchor?: string | null }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/pages/admin/slug/${slug}/sections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to add section");
  return res.json();
}

export async function updatePageSection(id: number, data: Partial<PageSection>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/pages/admin/sections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update section");
  return res.json();
}

export async function updateSiteSettings(data: Partial<SiteSettings>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/site/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

export async function deletePageSection(id: number) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/pages/admin/sections/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json", Authorization: token ? `Bearer ${token}` : "" }
  });
  if (!res.ok) throw new Error("Failed to delete section");
}

// Users
export type User = {
  id: number;
  email: string;
  role: string;
  display_name?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
};

export async function getUsersAdmin(): Promise<User[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Accept: "application/json", Authorization: token ? `Bearer ${token}` : "" }
  });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function createUserAdmin(data: { email: string; password: string; role: string; display_name?: string; bio?: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function updateUserAdmin(id: number, data: Partial<{ email: string; role: string; display_name: string; bio: string; password: string }>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function deleteUserAdmin(id: number) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json", Authorization: token ? `Bearer ${token}` : "" }
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function getCurrentUser(): Promise<User | null> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (!token) return null;
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateProfile(data: { email?: string; display_name?: string; bio?: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function changePassword(data: { old_password: string; new_password: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/users/me/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to change password");
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const url = new URL("/hero-slides", API_BASE);
  url.searchParams.set("page", "1");
  url.searchParams.set("page_size", "12");

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = { accept: "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error("Failed to fetch hero slides", response.status, await response.text());
      return [];
    }

    const data = (await response.json()) as HeroSlideListResponse;
    return data.items ?? [];
  } catch (error) {
    console.error("Failed to fetch hero slides", error);
    return [];
  }
}

export async function getBiography(): Promise<Biography | null> {
  const url = new URL("/biography", API_BASE);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: Record<string, string> = { accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    console.error("Failed to fetch biography", response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as Biography;
  if (!data) {
    return null;
  }

  const normalizedName = (data.name ?? '').trim();
  const normalizedTagline = (data.tagline ?? '').trim();
  const normalizedQuote = (data.quote ?? '').trim();
  const normalizedQuoteAttribution = (data.quote_attribution ?? '').trim();
  const normalizedTimeline = Array.isArray(data.timeline)
    ? data.timeline
        .map((item) => ({
          time_label: (item?.time_label ?? '').toString().trim(),
          title: (item?.title ?? '').toString().trim(),
          description: (item?.description ?? '').toString().trim(),
        }))
        .filter((item) => item.time_label && item.title && item.description)
    : [];

  return {
    ...data,
    name: normalizedName ? normalizedName : null,
    tagline: normalizedTagline ? normalizedTagline : null,
    quote: normalizedQuote ? normalizedQuote : null,
    quote_attribution: normalizedQuoteAttribution ? normalizedQuoteAttribution : null,
    timeline: normalizedTimeline,
    portrait_url: normalizeMediaUrl(data.portrait_url),
  };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const url = new URL("/site/settings", API_BASE);

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("Failed to fetch site settings", response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as SiteSettings;
  return data ?? null;
}

function normalizeMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const apiBase = new URL(API_BASE);
    const resolved = new URL(url, apiBase);

    // If existing links still point at localhost:8000, rewrite to the API origin
    if (resolved.hostname === 'localhost' && resolved.port === '8000') {
      resolved.protocol = apiBase.protocol;
      resolved.hostname = apiBase.hostname;
      resolved.port = apiBase.port;
    }

    return resolved.toString();
  } catch {
    return url ?? null;
}
}

export async function getPhilosophy(): Promise<Philosophy | null> {
  const url = new URL("/philosophy", API_BASE);

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("Failed to fetch philosophy", response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as Philosophy;
  if (!data) {
    return null;
  }

  const blocks: PhilosophyManifestoBlock[] = Array.isArray((data as any)?.manifesto_blocks)
    ? ((data as any).manifesto_blocks as any[])
        .map((item) => ({
          title: item?.title?.trim() ?? "",
          body: item?.body?.trim() ?? ""
        }))
        .filter((item) => item.title && item.body)
    : [];

  return {
    id: data.id,
    title: (data as any).title?.trim() || null,
    subtitle: (data as any).subtitle?.trim() || null,
    content: data.content ?? "",
    manifesto_blocks: blocks,
    updated_at: data.updated_at
  };
}

export async function getPaintings(params: GetPaintingsParams = {}): Promise<PaintingListResponse> {
  const url = new URL("/paintings", API_BASE);
  if (params.query) {
    url.searchParams.set("query", params.query);
  }
  if (typeof params.year === "number") {
    url.searchParams.set("year", String(params.year));
  }
  if (params.medium) {
    url.searchParams.set("medium", params.medium);
  }
  if (params.tags?.length) {
    url.searchParams.set("tags", params.tags.join(","));
  }
  if (params.cursor) {
    url.searchParams.set("cursor", params.cursor);
  }
  if (typeof params.limit === "number") {
    url.searchParams.set("limit", String(params.limit));
  }

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    console.error("Failed to fetch paintings", response.status, await response.text());
    return { items: [], next_cursor: null };
  }

  const data = (await response.json()) as PaintingListResponse;
  return data ?? { items: [], next_cursor: null };
}

export async function getPainting(identifier: string): Promise<Painting | null> {
  const response = await fetch(new URL(`/paintings/${identifier}`, API_BASE).toString(), {
    headers: { accept: "application/json" },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    console.error("Failed to fetch painting", identifier, response.status);
    return null;
  }

  return (await response.json()) as Painting;
}

type CommerceProductParams = {
  kind?: "PAINTING" | "BOOK";
  search?: string;
};

export async function getCommerceProducts(params: CommerceProductParams = {}): Promise<CommerceProduct[]> {
  const url = new URL("/commerce/products", API_BASE);
  if (params.kind) {
    url.searchParams.set("kind", params.kind);
  }
  if (params.search) {
    url.searchParams.set("search", params.search);
  }

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    console.error("Failed to fetch commerce products", response.status, await response.text());
    return [];
  }

  const data = (await response.json()) as CommerceProductList;
  return data.items ?? [];
}

export async function getWooCommerceBadgeForPainting(
  paintingId: number,
  wcProductId?: number | null,
  preload?: CommerceProduct[]
): Promise<WooCommerceBadge | null> {
  const products =
    preload ??
    (await getCommerceProducts({
      kind: "PAINTING"
    }));

  const match = products.find((product) => {
    if (wcProductId && product.wc_product_id === wcProductId) {
      return true;
    }
    return product.local_id === paintingId;
  });

  if (!match) {
    return null;
  }

  return {
    wc_product_id: match.wc_product_id,
    stock_status: match.stock_status,
    price: match.price,
    last_synced_at: match.last_synced_at
  };
}

export type GetBlogsParams = {
  query?: string;
  tags?: string[];
  category?: string;
  cursor?: string;
  limit?: number;
};

export async function getBlogs(params: GetBlogsParams = {}): Promise<BlogListResponse> {
  const url = new URL(BLOG_ENDPOINT, API_BASE);
  if (params.query) {
    url.searchParams.set("query", params.query);
  }
  if (params.tags?.length) {
    url.searchParams.set("tags", params.tags.join(","));
  }
  if (params.category) {
    url.searchParams.set("category", params.category);
  }
  if (params.cursor) {
    url.searchParams.set("cursor", params.cursor);
  }
  if (typeof params.limit === "number") {
    url.searchParams.set("limit", String(params.limit));
  }

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("Failed to fetch blogs", response.status, await response.text());
    return { items: [], next_cursor: null };
  }

  return (await response.json()) as BlogListResponse;
}

export async function getBlog(identifier: string): Promise<Blog | null> {
  const response = await fetch(new URL(`${BLOG_ENDPOINT}/${identifier}`, API_BASE).toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("Failed to fetch blog", identifier, response.status);
    return null;
  }

  return (await response.json()) as Blog;
}

export async function getHomeSections(): Promise<HomeSection[]> {
  const response = await fetch(new URL("/home/sections", API_BASE).toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });
  if (!response.ok) {
    console.error("Failed to fetch home sections", response.status, await response.text());
    return [];
  }
  return (await response.json()) as HomeSection[];
}

// Lightweight aggregated helpers
export async function fetchCategories() {
  return getBlogCategories();
}

export async function fetchArticles(params: GetBlogsParams = {}) {
  return getBlogs(params);
}

export async function fetchHomeData() {
  const [heroSlides, latest, exclusives, culture, paintings] = await Promise.all([
    getHeroSlides(),
    getBlogs({ limit: 6 }),
    getBlogs({ category: "exclusive", limit: 3 }),
    getBlogs({ category: "culture", limit: 3 }),
    getPaintings({ limit: 8 }),
  ]);
  return {
    heroSlides,
    latest: latest.items ?? [],
    exclusives: exclusives.items ?? [],
    culture: culture.items ?? [],
    paintings: paintings.items ?? [],
  };
}

export async function fetchPages(): Promise<Page[]> {
  const res = await fetch(new URL("/pages", API_BASE).toString(), { headers: { accept: "application/json" } });
  if (!res.ok) {
    console.error("Failed to fetch pages", res.status, await res.text());
    return [];
  }
  return (await res.json()) as Page[];
}

export async function fetchPage(slug: string): Promise<Page | null> {
  const res = await fetch(new URL(`/pages/${slug}`, API_BASE).toString(), { headers: { accept: "application/json" }, cache: "no-store" });
  if (!res.ok) {
    console.error("Failed to fetch page", slug, res.status);
    return null;
  }
  return (await res.json()) as Page;
}

export async function submitWriting(payload: { name: string; email: string; title: string; content: string }) {
  const res = await fetch(new URL("/submissions", API_BASE).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Submission failed");
  }
  return (await res.json()) as Submission;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const response = await fetch(new URL(CATEGORY_ENDPOINT, API_BASE).toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });
  if (!response.ok) {
    console.error("Failed to fetch blog categories", response.status, await response.text());
    return [];
  }
  const data = (await response.json()) as BlogCategory[];
  return data ?? [];
}

export async function getMuseumRooms(): Promise<MuseumRoom[]> {
  const response = await fetch(new URL("/museum/rooms", API_BASE).toString(), {
    headers: { accept: "application/json" },
    ...(typeof window === "undefined" ? { next: { revalidate: 60 } } : { cache: "no-store" })
  });
  if (!response.ok) {
    console.error("Failed to fetch museum rooms", response.status, await response.text());
    return [];
  }
  return (await response.json()) as MuseumRoom[];
}

export async function getMuseumArtifacts(roomId?: number): Promise<MuseumArtifact[]> {
  const url = new URL("/museum/artifacts", API_BASE);
  if (typeof roomId === "number") {
    url.searchParams.set("room_id", String(roomId));
  }

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("Failed to fetch museum artifacts", response.status, await response.text());
    return [];
  }

  return (await response.json()) as MuseumArtifact[];
}
