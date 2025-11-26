import type {
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
  ComponentPropsWithoutRef
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import { AuthorIntroCard } from "@/components/author-intro-card";
import { QuotePullout } from "@/components/quote-pullout";
import { TimelineBeads } from "@/components/timeline-beads";
import type { SiteSettings } from "@/lib/api";
import { getBiography, getSiteSettings } from "@/lib/api";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), ["className"], ["target"], ["rel"]],
    span: [["className"]],
    p: [["className"]],
    img: [["src"], ["alt"], ["title"], ["width"], ["height"], ["loading"], ["decoding"]]
  }
};

type TimelineItem = {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
};

type NarrativeExtract = {
  markdown: string;
  tagline: string;
  quote?: { text: string; attribution?: string };
  timeline: TimelineItem[];
};

export const metadata = {
  title: "About — Memshaheb Magazine",
  description:
    "Memshaheb is a night-mode magazine by and for women, blending essays, art, and culture with a calm editorial voice."
};

// Prevent build-time failures if API is unavailable during image export/prerender
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [biography, siteSettings] = await Promise.all([safeBiography(), safeSiteSettings()]);

  const extracted = extractNarrative(biography?.rich_text ?? fallbackBiography());
  const socials = resolveInstagramSocial(biography, siteSettings);

  const displayName = (biography?.name ?? '').trim() || 'Memshaheb Magazine';
  const displayTagline = (biography?.tagline ?? '').trim() || extracted.tagline;
  const quote = (biography?.quote ?? '').trim()
    ? {
        text: (biography?.quote ?? '').trim(),
        attribution: (biography?.quote_attribution ?? '').trim() || undefined
      }
    : extracted.quote;
  const timelineItems = biography?.timeline && biography.timeline.length > 0
    ? biography.timeline.map((item, index) => ({
        id: `biography-timeline-${index}`,
        timeLabel: item.time_label,
        title: item.title,
        description: item.description
      }))
    : extracted.timeline;

  return (
    <>
    <main className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-20 sm:px-12">
        <AuthorIntroCard
          name={displayName}
          tagline={displayTagline}
          portraitUrl={biography?.portrait_url}
          updatedAt={biography?.updated_at}
          socials={socials}
        />

        {quote && (
          <QuotePullout quote={quote.text} attribution={quote.attribution} />
        )}

        <article className="prose prose-invert mt-14 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
            components={markdownComponents}
          >
            {extracted.markdown}
          </ReactMarkdown>
        </article>

        <TimelineBeads items={timelineItems} />
      </div>
    </main>
    </>
  );
}

const markdownComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-16 text-3xl font-semibold text-ink sm:text-4xl"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mt-12 text-2xl font-semibold text-ink sm:text-3xl"
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4
      {...props}
      className="mt-10 text-xl font-semibold text-ink sm:text-2xl"
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="mt-6 text-base leading-relaxed text-muted sm:text-lg" />
  ),
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-accent underline-offset-4 transition hover:text-accent-2"
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="mt-6 list-disc space-y-3 pl-6 text-muted" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="mt-6 list-decimal space-y-3 pl-6 text-muted" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className="leading-relaxed" />
  ),
  blockquote: (props: BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="mt-8 border-l-4 border-accent/60 pl-6 text-lg italic text-muted"
    />
  )
};

function extractNarrative(markdown: string): NarrativeExtract {
  const trimmed = markdown.trim();
  const { quote, prunedMarkdown } = extractQuote(trimmed);
  const timeline = extractTimeline(prunedMarkdown);
  const tagline = deriveTagline(prunedMarkdown);

  return {
    markdown: prunedMarkdown.trim(),
    tagline,
    quote,
    timeline
  };
}

function extractQuote(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim().startsWith(">"));

  if (startIndex === -1) {
    return { quote: undefined, prunedMarkdown: markdown };
  }

  let endIndex = startIndex;
  while (endIndex < lines.length && lines[endIndex].trim().startsWith(">")) {
    endIndex += 1;
  }

  const quoteLines = lines.slice(startIndex, endIndex).map((line) => line.replace(/^>\s?/, ""));
  const remainingLines = [...lines.slice(0, startIndex), ...lines.slice(endIndex)];

  const [quoteText, attribution] = normalizeQuote(quoteLines.join(" ").trim());

  return {
    quote: quoteText
      ? {
          text: quoteText,
          attribution
        }
      : undefined,
    prunedMarkdown: remainingLines.join("\n")
  };
}

function normalizeQuote(content: string): [string | undefined, string | undefined] {
  if (!content) {
    return [undefined, undefined];
  }

  const parts = content.split(/—|--/);
  const quoteText = parts[0]?.trim();
  const attribution = parts[1]?.trim();
  return [quoteText || undefined, attribution || undefined];
}

async function safeBiography() {
  try {
    return await getBiography();
  } catch (_err) {
    return null;
  }
}

async function safeSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getSiteSettings();
  } catch (_err) {
    return null;
  }
}

function extractTimeline(markdown: string): TimelineItem[] {
  const lines = markdown.split(/\r?\n/);
  const items: TimelineItem[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const headingMatch = line.match(/^##\s+(.+)/);
    if (!headingMatch) {
      continue;
    }

    const headingText = headingMatch[1].trim();
    const [timeLabel, title] = splitTimelineHeading(headingText);

    const descriptionLines: string[] = [];
    let j = i + 1;
    while (j < lines.length) {
      const nextLine = lines[j];
      if (/^#{1,6}\s+/.test(nextLine)) {
        break;
      }
      if (nextLine.trim() === "") {
        j += 1;
        continue;
      }
      descriptionLines.push(nextLine.trim());
      j += 1;
    }

    items.push({
      id: `timeline-${items.length}`,
      timeLabel,
      title,
      description: stripMarkdown(descriptionLines.join(" "))
    });
  }

  return items;
}

function splitTimelineHeading(headingText: string): [string, string] {
  const separatorMatch = headingText.match(/\s[–—-]\s/);
  if (!separatorMatch) {
    return [headingText, headingText];
  }
  const [before, after] = headingText.split(separatorMatch[0]);
  return [before.trim(), after.trim() || headingText];
}

function deriveTagline(markdown: string): string {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((block) => stripMarkdown(block).trim())
    .filter(Boolean);

  return paragraphs[0] ?? "A lyrical storyteller weaving poetry, pigment, and commerce.";
}

function stripMarkdown(value: string) {
  return value
    .replace(/\!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(^|\s)\*\*([^*]+)\*\*/g, "$1$2")
    .replace(/(^|\s)__([^_]+)__/g, "$1$2")
    .replace(/(^|\s)\*([^*]+)\*/g, "$1$2")
    .replace(/(^|\s)_([^_]+)_/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveInstagramSocial(biography: any, settings: SiteSettings | null | undefined) {
  const handle = biography?.instagram_handle?.trim();
  if (handle) {
    const clean = handle.startsWith("@") ? handle.slice(1) : handle;
    return [{ label: `@${clean}`, href: `https://instagram.com/${clean}` }];
  }
  const socialLinks = settings?.social_links ?? {};
  const instagramEntry = Object.entries(socialLinks).find(
    ([key, href]) => key.toLowerCase() === "instagram" && typeof href === "string" && href
  ) as [string, string] | undefined;

  if (!instagramEntry) {
    return [];
  }

  const [, href] = instagramEntry;
  return [
    {
      label: formatInstagramLabel(href),
      href
    }
  ];
}

function formatInstagramLabel(href: string) {
  try {
    const url = new URL(href);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0]) {
      const handle = segments[0].startsWith("@") ? segments[0].slice(1) : segments[0];
      return `@${handle}`;
    }
  } catch {
    // Ignore parsing errors and fall back to regex match below
  }

  const match = href.match(/instagram\.com\/([^/?#]+)/i);
  if (match?.[1]) {
    const raw = match[1].startsWith("@") ? match[1].slice(1) : match[1];
    return `@${raw}`;
  }

  return "Instagram";
}

function fallbackBiography(): string {
  return [
    "Memshaheb is a night-mode magazine crafted by women for women who move between art, work, and inner worlds. We celebrate soft power, slow thinking, and unapologetic ambition.",
    "",
    "> We write in the dark so you can breathe between the lines. — Memshaheb Editorial",
    "",
    "## 2018 – The spark",
    "Late-night group chats between writers, painters, and researchers hint at a shared need: a calmer, more intentional magazine space.",
    "",
    "## 2021 – Digital-first launch",
    "Memshaheb goes live with a dark, gentle interface and three founding pillars: essays, visual narratives, and cultural field notes.",
    "",
    "## 2023 – Community columns",
    "Guest authors, artists, and researchers join in, bringing lived experiences from Dhaka to Dakar and beyond.",
    "",
    "## 2025 – Memshaheb today",
    "A calm editorial home that pairs essays with illustration, offers audio previews for late nights, and experiments with live rooms for collaborative curation."
  ].join("\n");
}
