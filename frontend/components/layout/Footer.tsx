'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';
import { getSiteSettings, type SiteSettings } from '@/lib/api';

type FooterProps = {
  socialLinks?: Record<string, string | undefined> | null;
};

type NormalizedLink = [string, string];

const isValidLink = (entry: [string, string | undefined]): entry is NormalizedLink => {
  const [, href] = entry;
  return typeof href === 'string' && href.trim().length > 0;
};

const iconFor = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes('insta')) return <Instagram className="h-4 w-4" />;
  if (key.includes('face')) return <Facebook className="h-4 w-4" />;
  if (key === 'x' || key.includes('twit')) return <Twitter className="h-4 w-4" />;
  if (key.includes('link')) return <Linkedin className="h-4 w-4" />;
  if (key.includes('you')) return <Youtube className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

export default function Footer({ socialLinks }: FooterProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (socialLinks) return;
    getSiteSettings().then((data) => setSettings(data || null)).catch(() => setSettings(null));
  }, [socialLinks]);

  const links = useMemo(() => {
    const source = socialLinks ?? settings?.social_links ?? null;
    return source ? Object.entries(source).filter(isValidLink) : [];
  }, [socialLinks, settings]);

  const year = new Date().getFullYear();
  const brandTagline = settings?.site_tagline?.trim() || "Punchline goes here";
  const logo = settings?.logo_url;

  return (
    <footer className="w-full bg-gradient-to-t from-[rgba(255,255,255,0.02)] to-transparent border-t border-[rgba(255,255,255,0.06)] py-10">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div className="text-center md:text-left">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt="Brand logo"
                className="mx-auto md:mx-0 h-32 w-auto object-contain drop-shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
              />
            ) : (
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm text-[var(--muted)]">
                Logo placeholder
              </div>
            )}
            <p className="mt-2 text-sm text-[var(--muted)]">{brandTagline}</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/about" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              About
            </Link>
            <Link href="/museum" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              Museum
            </Link>
            <Link href="/paintings" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              Paintings
            </Link>
            <Link href="/blogs" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              Magazine
            </Link>
            <Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              Contact
            </Link>
            <Link href="/privacy-policy" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              Terms &amp; Conditions
            </Link>
            <Link href="/copyright" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300">
              Copyright
            </Link>
          </nav>

          {/* Social Links */}
          <div className="flex justify-center md:justify-end gap-4">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300 flex items-center gap-2"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-ink">
                  {iconFor(label)}
                </span>
                <span className="hidden sm:inline capitalize">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.06)] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--muted)]">
            © {year}. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Developed by{' '}
            <a
              href="https://dyingroomdev.xyz/"
              className="hover:text-[var(--accent)] transition-colors duration-300 hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              DyinGroom
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
