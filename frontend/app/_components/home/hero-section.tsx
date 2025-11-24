"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Biography } from "@/lib/api";

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
      delayChildren: 0.3
    }
  }
};

type HeroSectionProps = {
  biography: Biography | null;
};

export function HeroSection({ biography }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Portrait Side */}
      <motion.div 
        className="absolute inset-0 w-1/2 left-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {biography?.portrait_url && (
          <div className="relative h-full">
            <Image
              src={biography.portrait_url}
              alt="Memshaheb"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(14,10,20,0.3)] to-[var(--bg)]" />
          </div>
        )}
      </motion.div>

      {/* Text Side */}
      <div className="relative z-10 w-full flex justify-end">
        <motion.div 
          className="w-1/2 px-8 lg:px-16"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="font-display text-6xl lg:text-7xl font-bold text-[var(--ink)] tracking-tight leading-none mb-4"
            variants={fadeUp}
          >
            Memshaheb
          </motion.h1>
          
          <motion.p 
            className="text-xl lg:text-2xl text-[var(--muted)] font-light tracking-wide mb-8"
            variants={fadeUp}
          >
            Night-mode magazine for women
          </motion.p>
          
          <motion.p 
            className="text-lg text-[var(--muted)] mb-12 leading-relaxed"
            variants={fadeUp}
          >
            Scroll to wander the rooms
          </motion.p>
          
          <motion.div variants={fadeUp}>
            <Link
              href="/museum"
              className="inline-block rounded-full px-8 py-3 border border-[var(--accent)] text-[var(--ink)] hover:bg-gradient-to-r hover:from-[var(--accent)] hover:to-[var(--accent-2)] hover:text-[var(--bg)] transition-all duration-300 ease-[0.22,1,0.36,1] shadow-[0_0_30px_rgba(213,155,246,0.1)]"
            >
              Enter Her World
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
