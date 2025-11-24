"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Painting } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

type FeaturedPaintingsProps = {
  paintings: Painting[];
};

export function FeaturedPaintings({ paintings }: FeaturedPaintingsProps) {
  const displayPaintings = paintings.slice(0, 5);

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-[var(--ink)] mb-4">
            Art in Motion
          </h2>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            Selected works from the collection
          </p>
        </motion.div>

        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {displayPaintings.map((painting, index) => (
            <motion.div
              key={painting.id}
              className="break-inside-avoid group cursor-pointer"
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative overflow-hidden rounded-3xl">
                {painting.image_url && (
                  <>
                    <Image
                      src={painting.image_url}
                      alt={painting.title}
                      width={400}
                      height={600}
                      className="w-full h-auto object-cover"
                      placeholder={painting.lqip_data ? "blur" : "empty"}
                      blurDataURL={painting.lqip_data || undefined}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,10,20,0.8)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-md" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-display text-xl font-semibold text-[var(--ink)] mb-1">
                        {painting.title}
                      </h3>
                      {painting.year && (
                        <p className="text-[var(--muted)]">{painting.year}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <Link
            href="/museum"
            className="inline-block rounded-full px-8 py-3 border border-[var(--accent)] text-[var(--ink)] hover:bg-gradient-to-r hover:from-[var(--accent)] hover:to-[var(--accent-2)] hover:text-[var(--bg)] transition-all duration-300 ease-[0.22,1,0.36,1]"
          >
            Visit the Virtual Museum
          </Link>
        </motion.div>
      </div>
    </section>
  );
}