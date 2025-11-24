import type { Blog } from "@/lib/api";

const WORDS_PER_MINUTE = 180;

export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatPublishedDate(date: string | null | undefined): string | null {
  if (!date) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
      new Date(date)
    );
  } catch {
    return null;
  }
}

export function highlightQuery(text: string, query: string): string {
  const escaped = escapeHtml(text);
  if (!query.trim()) {
    return escaped;
  }
  try {
    const pattern = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return escaped.replace(pattern, "<mark>$1</mark>");
  } catch {
    return escaped;
  }
}

export function blogToCardData(blog: Blog) {
  const readTime = blog.read_time_minutes ?? estimateReadTime(blog.content_md ?? blog.excerpt ?? "");
  const published = formatPublishedDate(blog.published_at ?? blog.created_at);
  return { readTime, published };
}

export type FootnoteMap = Record<string, string>;

export function extractFootnotes(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const footnotes: FootnoteMap = {};
  const body: string[] = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const match = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
    if (match) {
      const [, id, text] = match;
      const definition: string[] = [text];
      index += 1;
      while (index < lines.length && /^\s{2,}.+/.test(lines[index])) {
        definition.push(lines[index].trim());
        index += 1;
      }
      footnotes[id] = definition.join(" ").trim();
      continue;
    }
    body.push(line);
    index += 1;
  }

  return { markdown: body.join("\n").trim(), footnotes };
}

export function replaceFootnoteReferences(markdown: string) {
  return markdown.replace(/\[\^([^\]]+)\]/g, (_match, id) => `<Footnote id="${id}" />`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
