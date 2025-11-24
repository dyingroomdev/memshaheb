"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

type BlogSectionProps = {
  posts: Blog[];
};

export function BlogSection({ posts }: BlogSectionProps) {
  const displayPosts = posts.slice(0, 3);

  if (displayPosts.length === 0) return null;

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
            Studio Reflections
          </h2>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            Thoughts from the creative process
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {displayPosts.map((post) => (
            <motion.article
              key={post.id}
              className="group cursor-pointer"
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/blogs/${post.slug}`}>
                <div className="relative overflow-hidden rounded-3xl mb-6">
                  {post.cover_url ? (
                    <>
                      <Image
                        src={post.cover_url}
                        alt={post.title}
                        width={400}
                        height={250}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,10,20,0.6)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Light sweep effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    </>
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 rounded-3xl flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--bg)]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-xl font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-[var(--muted)] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                    )}
                    {post.read_time_minutes && (
                      <span>{post.read_time_minutes} min read</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.article>
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
            href="/blogs"
            className="inline-block rounded-full px-8 py-3 border border-[var(--muted)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300"
          >
            Read Reflections
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
