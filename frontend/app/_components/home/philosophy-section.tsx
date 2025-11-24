"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Philosophy } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

type PhilosophySectionProps = {
  philosophy: Philosophy | null;
};

export function PhilosophySection({ philosophy }: PhilosophySectionProps) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid lg:grid-cols-2 gap-16 items-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Left: Philosophy Content */}
          <motion.div variants={fadeUp}>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[var(--ink)] mb-8">
              Thought as Art
            </h2>
            
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-[var(--muted)] leading-relaxed text-lg" style={{ fontFamily: '"Crimson Text", serif' }}>
                {philosophy?.content || 
                  "In the quiet spaces between thought and expression, between the seen and unseen, art emerges as a bridge. Each brushstroke carries the weight of silence, each word the echo of eternity. This is where philosophy meets canvas, where ideas take form in color and light."
                }
              </p>
            </div>

            <Link
              href="/about"
              className="inline-block mt-8 text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors duration-300 font-medium"
            >
              Meet Memshaheb →
            </Link>
          </motion.div>

          {/* Right: Visual Card */}
          <motion.div 
            className="relative"
            variants={fadeUp}
          >
            <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-2)]/10 border border-[rgba(255,255,255,0.06)] backdrop-blur-lg rounded-3xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-[var(--bg)]" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
              
              <h3 className="font-display text-2xl font-semibold text-[var(--ink)] mb-4">
                Creative Vision
              </h3>
              
              <p className="text-[var(--muted)] leading-relaxed">
                Where calm editorial meets artistry, creating works that speak to the soul and challenge the mind.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
