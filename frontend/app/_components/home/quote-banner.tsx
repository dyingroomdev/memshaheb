"use client";

import { motion } from "framer-motion";

type QuoteBannerProps = {
  quote?: string | null;
  attribution?: string | null;
};

export function QuoteBanner({ quote, attribution }: QuoteBannerProps) {
  const displayQuote = quote ?? "Art is the quiet conversation between the seen and the felt.";
  const displayAttribution = attribution ?? "Memshaheb Editorial";

  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_10%,rgba(213,155,246,0.18),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(255,170,207,0.12),transparent_55%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-4xl px-6 text-center"
      >
        <p className="bg-clip-text text-3xl leading-relaxed text-transparent sm:text-4xl" style={{ backgroundImage: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}>
          “{displayQuote}”
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.42em] text-[var(--muted)]/70">— {displayAttribution}</p>
      </motion.div>
    </section>
  );
}
