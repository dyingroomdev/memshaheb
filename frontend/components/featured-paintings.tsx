'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface Painting {
  id: number;
  title: string;
  year?: number;
  image_url?: string;
  slug: string;
}

interface FeaturedPaintingsProps {
  paintings: Painting[];
}

export function FeaturedPaintings({ paintings }: FeaturedPaintingsProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-jost font-bold text-ink mb-4">
            Featured Paintings
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Explore the latest works where emotion meets canvas, and philosophy takes form through color and light.
          </p>
        </motion.div>

        {paintings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted mb-8">No paintings available at the moment.</p>
            <Link
              href="/paintings"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-2xl shadow-lg shadow-accent/30"
            >
              View Gallery
            </Link>
          </div>
        ) : (
          <>
            {/* Masonry Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {paintings.map((painting, index) => (
                <motion.div
                  key={painting.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="break-inside-avoid group"
                >
                  <Link href={`/paintings/${painting.slug}`}>
                    <div className="relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-sm border border-white/10 shadow-glow-soft hover:shadow-glow-medium transition-all duration-300 group-hover:scale-[1.02]">
                      {painting.image_url ? (
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <Image
                            src={painting.image_url}
                            alt={painting.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="text-lg font-semibold mb-1">{painting.title}</h3>
                            {painting.year && (
                              <p className="text-sm text-white/80">{painting.year}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[3/4] bg-gradient-to-br from-accent/20 to-accent-2/20 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">🎨</span>
                            </div>
                            <h3 className="text-lg font-semibold text-ink mb-1">{painting.title}</h3>
                            {painting.year && (
                              <p className="text-sm text-muted">{painting.year}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Link
                href="/paintings"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-2xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200"
              >
                View All Artworks
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
