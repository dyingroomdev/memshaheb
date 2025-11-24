"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

type QuoteDividerProps = {
  quote?: string | null;
  attribution?: string | null;
};

export function QuoteDivider({ quote, attribution }: QuoteDividerProps) {
  const displayQuote = quote || "Art is the whisper of eternity painted on mortal canvas.";

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#15101C] to-[#201930]" />
      
      {/* Subtle background animation */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, var(--accent-2) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.blockquote
          className="text-4xl lg:text-5xl xl:text-6xl font-light text-[var(--ink)] italic leading-tight tracking-tight"
          style={{ fontFamily: '"Crimson Text", serif' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          "{displayQuote}"
        </motion.blockquote>
        
        {attribution && (
          <motion.cite
            className="block mt-8 text-lg text-[var(--muted)] not-italic"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              ...fadeUp,
              visible: { ...fadeUp.visible, transition: { ...fadeUp.visible.transition, delay: 0.3 } }
            }}
          >
            — {attribution}
          </motion.cite>
        )}
      </div>
    </section>
  );
}