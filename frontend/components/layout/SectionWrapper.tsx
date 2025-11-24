'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type SectionWrapperProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function SectionWrapper({ children, className = '', id }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}