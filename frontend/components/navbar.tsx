'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X, BellRing, ChevronDown } from 'lucide-react';
import { getSiteSettings, type SiteSettings, type NavLinkNode } from '@/lib/api';

type NavbarProps = { siteSettings?: SiteSettings | null };

export function Navbar({ siteSettings }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [customLinks, setCustomLinks] = useState<NavLinkNode[]>([]);
  const [branding, setBranding] = useState<{ logo?: string | null; title?: string | null }>({});
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadNavLinks = async () => {
      try {
        const settings = siteSettings || await getSiteSettings();
        if (settings?.nav_links && Array.isArray(settings.nav_links)) {
          const links = settings.nav_links
            .filter((l) => l.enabled !== false)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          setCustomLinks(links);
        }
        if (settings) {
          setBranding({ logo: settings.logo_url, title: settings.site_title });
        }
      } catch (err) {
        console.error('Failed to load nav links', err);
      }
    };
    loadNavLinks();
  }, [siteSettings]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[rgba(5,4,10,0.92)] backdrop-blur-xl border-b border-white/10 py-3' 
          : 'bg-[rgba(5,4,10,0.6)] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={branding.logo || "/logo.png"}
                alt={branding.title || "Memshaheb"}
                className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03] drop-shadow-[0_6px_18px_rgba(203,59,145,0.45)]"
              />
            </div>
            <div className="md:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={branding.logo || "/logo.png"}
                alt={branding.title || "Memshaheb"}
                className="h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03] drop-shadow-[0_5px_14px_rgba(203,59,145,0.45)]"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className={`relative text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-300 ${
                pathname === '/' ? 'text-[var(--ink)] after:scale-x-100' : 'text-[var(--muted)] hover:text-[var(--ink)] hover:after:scale-x-100'
              }`}
            >
              Home
            </Link>
            {customLinks.map((link) =>
              link.children && link.children.length > 0 ? (
                <div key={link.label} className="relative group">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-medium tracking-wide text-[var(--muted)] hover:text-[var(--ink)] transition-colors duration-200"
                  >
                    {link.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <div className="absolute left-0 mt-3 w-48 rounded-2xl border border-white/10 bg-card/90 backdrop-blur-xl shadow-glow-soft p-3 space-y-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                    {link.children
                      .filter((c) => c.enabled !== false)
                      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                      .map((child) => (
                        <Link
                          key={`${link.label}-${child.label}-${child.href}`}
                          href={child.href || '#'}
                          className="block rounded-xl px-3 py-2 text-sm text-muted hover:text-ink hover:bg-white/5 transition"
                        >
                          {child.label}
                        </Link>
                      ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href + link.label}
                  href={link.href || '#'}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-300 ${
                    pathname === link.href
                      ? 'text-[var(--ink)] after:scale-x-100'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:after:scale-x-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-muted" /> : <Moon className="h-4 w-4 text-muted" />}
            </button>

            <Link
              href="/blogs"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-medium rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200"
            >
              <BellRing className="h-4 w-4" />
              Latest stories
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 text-ink" /> : <Menu className="h-5 w-5 text-ink" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mt-4 pb-4 border-t border-white/10"
          >
            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === '/' ? 'text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                Home
              </Link>
              {customLinks.map((link) =>
                link.children && link.children.length > 0 ? (
                  <div key={link.label} className="space-y-2">
                    <span className="text-sm font-medium text-muted inline-flex items-center gap-1">
                      {link.label}
                      <ChevronDown className="h-3 w-3" />
                    </span>
                    {link.children
                      .filter((c) => c.enabled !== false)
                      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                      .map((child) => (
                        <Link
                          key={`${link.label}-${child.label}-${child.href}`}
                          href={child.href || '#'}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`pl-3 text-sm transition-colors duration-200 ${
                            pathname === child.href ? 'text-accent' : 'text-muted hover:text-ink'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                  </div>
                ) : (
                  <Link
                    key={link.href + link.label}
                    href={link.href || '#'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      pathname === link.href ? 'text-accent' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
