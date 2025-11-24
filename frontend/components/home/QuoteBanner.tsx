'use client';

import { motion } from 'framer-motion';

type QuoteBannerProps = {
  quote?: string | null;
  attribution?: string | null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function QuoteBanner({ quote, attribution }: QuoteBannerProps) {
  const displayQuote = quote || "Art is the whisper of eternity painted on mortal canvas.";

  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#15101C] to-[#201930]" />
      
      {/* Breathing opacity background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, var(--accent-2) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.blockquote
          className="font-light text-[var(--ink)] italic leading-tight tracking-tight"
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.8rem)',
            fontFamily: '"Crimson Text", serif'
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          "{displayQuote}"
        </motion.blockquote>
        
        {attribution && (
          <motion.cite
            className="block mt-6 text-lg text-[var(--muted)] not-italic"
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
