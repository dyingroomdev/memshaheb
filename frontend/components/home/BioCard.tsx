'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Biography } from '@/lib/api';

type BioCardProps = {
  biography?: Biography | null;
  socialLinks?: { label: string; href: string }[];
};

export default function BioCard({ biography, socialLinks = [] }: BioCardProps) {
  const instagramLink = socialLinks.find(link => link.label.toLowerCase() === 'instagram');
  
  // Extract bio content from rich_text or use fallback
  const bioContent = biography?.rich_text || 
    "Memshaheb is a night-mode magazine crafted by women for women, weaving stories of resilience, art, and thought after dark.";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
      className="max-w-5xl mx-auto bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] 
                 backdrop-blur-lg shadow-[0_24px_72px_rgba(213,155,246,0.08)] rounded-3xl 
                 p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-[var(--ink)] transition-transform duration-300"
    >
      {/* Portrait */}
      <div className="md:col-span-5 relative aspect-[3/4] w-full rounded-2xl overflow-hidden group">
        {biography?.portrait_url ? (
          <>
            <Image
              src={biography.portrait_url}
              alt={biography.name || "Memshaheb"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 176px, 176px"
            />
            <div className="absolute inset-0 shadow-inner group-hover:shadow-[inset_0_0_20px_rgba(213,155,246,0.1)] transition-shadow duration-700" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--bg)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Bio Text */}
      <div className="md:col-span-7 flex flex-col justify-center space-y-4">
        <p className="uppercase text-xs tracking-[0.2em] text-[var(--muted)] font-medium">
          Biography
        </p>
        
        <h2 className="font-display fluid-h2 font-semibold text-[var(--ink)]">
          {biography?.name || "Memshaheb"}
        </h2>
        
        <div 
          className="text-[var(--muted)] leading-relaxed max-w-xl prose prose-sm prose-invert"
          dangerouslySetInnerHTML={{ __html: bioContent }}
        />

        {/* Social Links */}
        <div className="flex items-center gap-3 pt-2">
          {instagramLink && (
            <a 
              href={instagramLink.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-full border border-[rgba(255,255,255,0.08)] px-4 py-1 text-sm 
                         hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Instagram
            </a>
          )}
          
          <a 
            href="/about"
            className="rounded-full border border-[rgba(255,255,255,0.08)] px-4 py-1 text-sm 
                       hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          >
            Learn More
          </a>
        </div>

        {/* Signature + Footer */}
        <div className="pt-6 border-t border-[rgba(255,255,255,0.04)]">
          <p className="font-display text-[var(--muted)] text-xs uppercase tracking-widest font-medium">
            Story Studio
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">
            Last updated {biography?.updated_at ? new Date(biography.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2024'}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
