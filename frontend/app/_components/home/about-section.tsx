"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Biography } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

type AboutSectionProps = {
  biography: Biography | null;
  socialLinks: { label: string; href: string }[];
};

export function AboutSection({ biography, socialLinks }: AboutSectionProps) {
  const instagramLink = socialLinks.find(link => link.label.toLowerCase() === 'instagram');

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-lg rounded-3xl p-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          {biography?.portrait_url && (
            <motion.div 
              className="relative w-32 h-32 mx-auto mb-8"
              variants={fadeUp}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] opacity-20 blur-xl" />
              <Image
                src={biography.portrait_url}
              alt="Memshaheb"
                width={128}
                height={128}
                className="relative rounded-full object-cover ring-2 ring-[rgba(255,255,255,0.1)]"
              />
            </motion.div>
          )}

          <motion.h2 
            className="font-display text-3xl font-bold text-[var(--ink)] mb-4"
            variants={fadeUp}
          >
            {biography?.name || "Memshaheb"}
          </motion.h2>

          <motion.p 
            className="text-xl text-[var(--accent)] italic mb-8 leading-relaxed"
            variants={fadeUp}
          >
            "I paint silence. I write echoes."
          </motion.p>

          <motion.div 
            className="flex justify-center gap-4"
            variants={fadeUp}
          >
            {instagramLink && (
              <a
                href={instagramLink.href}
                className="rounded-full px-6 py-2 border border-[var(--muted)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
            <Link
              href="/about"
              className="rounded-full px-6 py-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[var(--bg)] hover:opacity-90 transition-all duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
