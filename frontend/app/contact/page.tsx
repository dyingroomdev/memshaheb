import type { Metadata } from "next";
import SocialList from "@/components/contact/SocialList";
import ContactCard from "@/components/contact/ContactCard";
import { getSiteSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Contact — Memshaheb",
  description: "Get in touch for stories, collaborations, and editorial partnerships with Memshaheb.",
};

export default async function ContactPage() {
  const siteSettings = await getSiteSettings().catch(() => null);
  const socials = Object.entries(siteSettings?.social_links ?? {})
    .filter(([platform, url]) => {
      const normalizedPlatform = platform.toLowerCase();
      const href = typeof url === "string" ? url.trim() : "";
      if (!href) return false;
      if (normalizedPlatform === "website") return false;
      return true;
    })
    .map(([platform, url]) => ({
      platform: platform.toLowerCase(),
      label: capitalize(platform),
      url: (url as string).trim(),
      handle: parseHandle(url as string)
    }));

  return (
    <>
    <main className="min-h-[100svh] bg-[var(--bg)] text-[var(--ink)]">
      <section className="mx-auto max-w-6xl px-4 pt-24 pb-12">
        <h1 className="font-jost text-4xl md:text-5xl tracking-tight">Let’s Connect</h1>
        <p className="mt-3 text-[var(--muted)] max-w-2xl">
          Reach out for commissions, book inquiries, exhibitions, or media.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContactCard
          title="Phone"
          subtitle="Call or WhatsApp"
          href={siteSettings?.contact_phone ? `tel:${siteSettings.contact_phone}` : "#"}
          display={siteSettings?.contact_phone || "Phone not set"}
          icon="phone"
        />
        <ContactCard
          title="Email"
          subtitle="General inquiries"
          href={siteSettings?.contact_email ? `mailto:${siteSettings.contact_email}` : "#"}
          display={siteSettings?.contact_email || "Email not set"}
          icon="mail"
        />
        <div className="rounded-3xl p-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md">
          <h3 className="font-jost text-xl">Social</h3>
          <p className="text-sm text-[var(--muted)] mt-1">Follow Memshaheb’s journey</p>
          <div className="mt-4">
            <SocialList socials={socials} />
          </div>
        </div>
      </section>

      {/* Optional: drop a contact form here */}
      {/* <ContactForm /> */}
    </main>
  </>
);
}

function parseHandle(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts.at(-1) ?? undefined;
  } catch {
    return undefined;
  }
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
