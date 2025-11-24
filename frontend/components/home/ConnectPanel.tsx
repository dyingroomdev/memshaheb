'use client';

import { motion } from 'framer-motion';

type ConnectPanelProps = {
  socialLinks?: { label: string; href: string; accent?: boolean }[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
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

export default function ConnectPanel({ socialLinks = [] }: ConnectPanelProps) {
  // Default links if none provided
  const defaultLinks = [
    { label: 'Instagram', href: '#', accent: false },
    { label: 'Email', href: 'mailto:hello@memshaheb.com', accent: true }
  ];

  const links = socialLinks.length > 0 ? socialLinks : defaultLinks;

  return (
    <section className="py-[var(--space-4)]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            className="font-display fluid-h2 font-light text-[var(--ink)] mb-4 leading-tight"
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
            className="flex flex-col sm:flex-row justify-center gap-3"
            variants={fadeUp}
          >
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`
                  rounded-full px-8 py-3 min-h-[44px] transition-all duration-300 ease-[0.22,1,0.36,1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg)]
                  ${link.accent 
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[var(--bg)] font-semibold hover:opacity-90 shadow-[0_0_30px_rgba(213,155,246,0.2)] focus:ring-[var(--accent)]' 
                    : 'border border-[rgba(255,255,255,0.2)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] focus:ring-[var(--accent)]'
                  }
                `}
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
