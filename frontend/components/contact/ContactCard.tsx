"use client";
import { motion } from "framer-motion";
import { Phone, Mail } from "lucide-react";

export default function ContactCard({
  title, subtitle, href, display, icon,
}: { title:string; subtitle:string; href:string; display:string; icon:"phone"|"mail"; }) {
  const Icon = icon === "phone" ? Phone : Mail;
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: .5, ease: [0.22,1,0.36,1] }}
      className="rounded-3xl p-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-[0_24px_72px_rgba(213,155,246,0.08)]"
    >
      <Icon className="w-6 h-6 opacity-80" />
      <h3 className="font-jost text-xl mt-3">{title}</h3>
      <p className="text-sm text-[var(--muted)]">{subtitle}</p>
      <a href={href} className="mt-4 inline-block rounded-full px-4 py-2 border border-[var(--border)] hover:border-[var(--accent)]/50 transition">
        {display}
      </a>
    </motion.article>
  );
}
