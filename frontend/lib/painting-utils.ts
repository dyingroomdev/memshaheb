import type { Painting } from "@/lib/api";

const COLOR_KEYWORDS: Record<string, string[]> = {
  Warm: ["gold", "amber", "orange", "scarlet", "vermilion", "crimson", "marigold", "sunset", "flame", "ochre"],
  Cool: ["blue", "indigo", "azure", "teal", "cyan", "cerulean", "viridian", "ice", "ocean"],
  Earth: ["brown", "umber", "terra", "clay", "olive", "forest", "moss", "earth", "soil"],
  Monochrome: ["mono", "monochrome", "black", "white", "charcoal", "ink", "graphite", "noir"],
  Pastel: ["pastel", "lavender", "lilac", "rose", "peach", "mint", "powder", "blush"],
  Neon: ["neon", "electric", "vivid", "fluorescent"]
};

const DEFAULT_COLOR_FAMILY = "Warm";

export function inferColorFamily(painting: Painting): string {
  const haystack = buildTextHaystack(painting);

  for (const [family, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return family;
    }
  }

  if (painting.is_featured) {
    return "Monochrome";
  }

  return DEFAULT_COLOR_FAMILY;
}

function buildTextHaystack(painting: Painting): string {
  const items = [
    painting.title,
    painting.description,
    painting.medium,
    ...(painting.tags ?? [])
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return items.join(" ");
}

export function collectPaintingFilters(paintings: Painting[]) {
  const years = new Set<number>();
  const media = new Set<string>();
  const colors = new Set<string>();

  for (const painting of paintings) {
    if (typeof painting.year === "number") {
      years.add(painting.year);
    }
    if (painting.medium) {
      media.add(painting.medium);
    }
    colors.add(inferColorFamily(painting));
  }

  if (colors.size === 0) {
    colors.add(DEFAULT_COLOR_FAMILY);
  }

  return {
    years: Array.from(years).sort((a, b) => b - a),
    media: Array.from(media).sort((a, b) => a.localeCompare(b)),
    colors: Array.from(colors)
  };
}

export function getAmbientBackgroundStyle(lqip?: string | null, fallbackFamily?: string) {
  if (!lqip) {
    return {
      background:
        fallbackFamily === "Cool"
          ? "radial-gradient(circle at 20% 20%, rgba(90, 120, 255, 0.18), transparent), radial-gradient(circle at 70% 80%, rgba(120, 180, 255, 0.14), transparent)"
          : "radial-gradient(circle at 20% 20%, rgba(213, 155, 246, 0.18), transparent), radial-gradient(circle at 70% 80%, rgba(255, 170, 207, 0.14), transparent)"
    };
  }

  return {
    backgroundImage: `url(${lqip})`,
    backgroundSize: "cover",
    filter: "blur(80px)",
    transform: "scale(1.2)"
  };
}

export type PaintingSort = "newest" | "featured" | "viewed";

export function sortPaintings(paintings: Painting[], sort: PaintingSort): Painting[] {
  switch (sort) {
    case "featured":
      return [...paintings].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    case "viewed":
      return [...paintings].sort(
        (a, b) =>
          new Date(b.updated_at ?? b.published_at ?? b.created_at ?? 0).getTime() -
          new Date(a.updated_at ?? a.published_at ?? a.created_at ?? 0).getTime()
      );
    case "newest":
    default:
      return [...paintings].sort(
        (a, b) =>
          new Date(b.published_at ?? b.created_at ?? 0).getTime() -
          new Date(a.published_at ?? a.created_at ?? 0).getTime()
      );
  }
}

export function selectRelatedPaintings(current: Painting, candidates: Painting[], limit = 6): Painting[] {
  const currentTags = new Set((current.tags ?? []).map((tag) => tag.toLowerCase()));

  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      const overlap =
        candidate.tags?.filter((tag) => currentTags.has(tag.toLowerCase())).length ?? 0;
      const mediumScore = candidate.medium === current.medium ? 1 : 0;
      const yearScore =
        typeof candidate.year === "number" && typeof current.year === "number"
          ? 1 / (1 + Math.abs(candidate.year - current.year))
          : 0;
      return {
        candidate,
        score: overlap * 2 + mediumScore + yearScore
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
