"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

type ConnectSectionProps = {
  socialLinks: { label: string; href: string; accent?: boolean }[];
};

export function ConnectSection({ socialLinks }: ConnectSectionProps) {
  return (
    <section className="py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            className="font-display text-3xl lg:text-4xl font-light text-[var(--ink)] mb-4"
            variants={fadeUp}
          >
            Her art lives where conversations begin.
          </motion.h2>
          
          <motion.p 
            className="text-lg text-[var(--muted)] mb-12 leading-relaxed"
            variants={fadeUp}
          >
            Join the circle of thoughtful discourse
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            variants={fadeUp}
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`
                  rounded-full px-8 py-3 transition-all duration-300 ease-[0.22,1,0.36,1]
                  ${link.accent 
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[var(--bg)] hover:opacity-90 shadow-[0_0_30px_rgba(213,155,246,0.2)]' 
                    : 'border border-[var(--muted)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }
                `}
                target="_blank"
                rel="noreferrer noopener"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
