"use client";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Globe } from "lucide-react";

type Social = { platform:string; label:string; url:string; handle?:string };
export default function SocialList({ socials }:{ socials:Social[] }) {
  const iconFor = (p:string) => {
    switch (p) {
      case "instagram":
        return Instagram;
      case "twitter":
      case "x":
        return Twitter;
      case "facebook":
        return Facebook;
      case "linkedin":
        return Linkedin;
      case "youtube":
        return Youtube;
      default:
        return Globe;
    }
  };
  return (
    <ul className="space-y-3">
      {socials?.map((s, i) => {
        const Icon = iconFor(s.platform);
        return (
          <motion.li key={s.url}
            initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            <a href={s.url} target="_blank" rel="noreferrer noopener" className="group flex items-center gap-3 rounded-xl px-3 py-2 border border-[rgba(255,255,255,0.08)] hover:border-[var(--accent)]/50 transition">
              <Icon className="w-4 h-4 opacity-80" />
              <span>{s.label}</span>
              {s.handle && <span className="ml-auto text-[var(--muted)]">{s.handle}</span>}
            </a>
          </motion.li>
        );
      })}
    </ul>
  );
}
