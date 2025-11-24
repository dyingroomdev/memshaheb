'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { Navbar } from '@/components/navbar';
import { getSiteSettings, type SiteSettings } from '@/lib/api';

const NAVBAR_EXCLUDED_PREFIXES = ['/admin'];

function shouldHideNavbar(pathname: string) {
  return NAVBAR_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = shouldHideNavbar(pathname);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSiteSettings();
        setSiteSettings(data || null);
        // Apply dynamic favicon/title if available
        if (data?.favicon_url) {
          const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
          links.forEach((l) => (l.href = data.favicon_url!));
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = data.favicon_url;
          document.head.appendChild(newLink);
        }
        if (data?.site_title) {
          document.title = data.site_title;
        }
        // Meta verifications
        if (data?.google_site_verification) {
          let meta = document.querySelector("meta[name='google-site-verification']") as HTMLMetaElement | null;
          if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'google-site-verification';
            document.head.appendChild(meta);
          }
          meta.content = data.google_site_verification;
        }
        if (data?.bing_site_verification) {
          let meta = document.querySelector("meta[name='msvalidate.01']") as HTMLMetaElement | null;
          if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'msvalidate.01';
            document.head.appendChild(meta);
          }
          meta.content = data.bing_site_verification;
        }
        // Google Analytics
        if (data?.google_analytics_id) {
          const gaId = data.google_analytics_id;
          if (!document.querySelector(`script[data-ga-id='${gaId}']`)) {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            script.async = true;
            script.dataset.gaId = gaId;
            document.head.appendChild(script);

            const inline = document.createElement('script');
            inline.dataset.gaId = gaId;
            inline.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `;
            document.head.appendChild(inline);
          }
        }
      } catch (err) {
        console.error('Failed to load site settings', err);
      }
    };
    load();
  }, []);

  return (
    <>
      {!hideNavbar && <Navbar siteSettings={siteSettings} />}
      <div className={hideNavbar ? '' : 'pt-20'}>{children}</div>
    </>
  );
}
