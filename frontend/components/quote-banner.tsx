'use client';

import { motion } from 'framer-motion';

export function QuoteBanner() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-2/10 to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(213,155,246,0.1)_0%,transparent_70%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-2/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <blockquote className="text-3xl md:text-4xl lg:text-5xl font-jost font-medium text-ink leading-relaxed mb-8">
            "Art is the whisper of eternity painted on mortal canvas."
          </blockquote>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
            <cite className="text-lg text-accent font-medium not-italic">
              Memshaheb Editorial
            </cite>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
