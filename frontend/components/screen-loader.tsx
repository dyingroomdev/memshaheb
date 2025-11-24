'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ScreenLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-[var(--bg)] flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-[var(--bg)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5V18c0 1.1-.9 2-2 2H5.5C4.67 20 4 19.33 4 18.5V5.5Zm1.5.5v12h12.5c.28 0 .5-.22.5-.5V6H5.5Zm2.25 2h6.5v1h-6.5v-1Zm0 2.5h6.5v1h-6.5v-1Zm-1.75 2.5h10v1h-10v-1Z" />
          </svg>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-2xl font-bold text-[var(--ink)] mb-3 tracking-tight"
        >
          Memshaheb
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[var(--accent)] font-light text-lg tracking-wide"
        >
          Strong women-focused magazine flavor.
        </motion.p>
      </div>
    </motion.div>
  );
}
