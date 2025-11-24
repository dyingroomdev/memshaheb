"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { Philosophy } from "@/lib/api";

type PhilosophyTeaserProps = {
  philosophy: Philosophy | null;
};

export function PhilosophyTeaser({ philosophy }: PhilosophyTeaserProps) {
  const stories = philosophy?.manifesto_blocks?.slice(0, 2) ?? [];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]/70">Philosophy</p>
        <h3 className="mt-3 max-w-2xl font-jost text-3xl text-[var(--ink)] sm:text-4xl">
          {philosophy?.subtitle ?? "Reflections for women who write, paint, and build in the quiet hours."}
        </h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(stories.length ? stories : fallbackStories).map((story, index) => (
          <motion.article
            key={`${story.title}-${index}`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
            className="flex flex-col gap-4 rounded-[2rem] border border-[var(--border-soft)] bg-[rgba(16,12,24,0.85)] p-8 shadow-[var(--shadow-ambient)]"
          >
            <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]/70">Manifesto {index + 1}</p>
            <h4 className="font-jost text-2xl text-[var(--ink)]">{story.title}</h4>
            <p className="text-sm leading-relaxed text-[var(--muted)]/90">{story.body}</p>
          </motion.article>
        ))}
      </div>

      <div>
        <Link
          href="/about"
          className="btn-primary inline-flex items-center gap-3"
        >
          Explore My Philosophy
          <span className="text-sm">→</span>
        </Link>
      </div>
    </section>
  );
}

const fallbackStories = [
  {
    title: "Listening to the hush between strokes",
    body: "Each painting begins as a question whispered at midnight. The response emerges slowly, in layers of light and shadow."
  },
  {
    title: "Color as a contemplative practice",
    body: "I chase the liminal palette—the gradients that live between memory and intuition, inviting the viewer to linger a little longer."
  }
];
