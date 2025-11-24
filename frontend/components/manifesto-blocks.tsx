import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ManifestoBlock = {
  id: string;
  title: string;
  body: string;
};

type ManifestoBlocksProps = {
  blocks: ManifestoBlock[];
};

const blockMarkdownComponents = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-sm leading-relaxed text-muted sm:text-base" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-ink" />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="italic text-muted" />
  )
};

export function ManifestoBlocks({ blocks }: ManifestoBlocksProps) {
  if (!blocks.length) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-muted/70">Philosophy</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Manifesto</h2>
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {blocks.map((block, index) => (
          <article
            key={block.id}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 shadow-lg shadow-black/10 transition duration-300 hover:border-accent/60 hover:shadow-glow-soft"
          >
            <div
              className="pointer-events-none absolute inset-y-0 w-1 bg-gradient-to-b from-accent/30 via-accent-2/30 to-accent/20 opacity-0 transition duration-500 group-hover:opacity-100"
              style={{ left: index % 2 === 0 ? 0 : "auto", right: index % 2 === 0 ? "auto" : 0 }}
            />
            <h3 className="text-xl font-semibold text-ink sm:text-2xl">{block.title}</h3>
            <div className="mt-4 space-y-3">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={blockMarkdownComponents}
              >
                {block.body}
              </ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
