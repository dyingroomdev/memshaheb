'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: number;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_href?: string;
  image_url: string;
}

interface HeroSectionProps {
  slides: HeroSlide[];
}

export function HeroSection({ slides }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-[#0E0A14] via-[#1A0F2E] to-[#0E0A14]">
        <div className="text-center">
          <div className="flex gap-4 justify-center">
            <Link
              href="/paintings"
              className="px-8 py-3 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-2xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200"
            >
              Explore Paintings
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3 bg-white/10 border border-white/20 text-ink font-medium rounded-2xl hover:bg-white/20 transition-colors"
            >
              Shop Books
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${slides[currentSlide]?.image_url})`,
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <motion.h1
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-5xl md:text-7xl font-jost font-bold text-white mb-6 leading-tight"
                >
                  {slides[currentSlide]?.title || 'Welcome'}
                </motion.h1>
                
                {slides[currentSlide]?.subtitle && (
                  <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl text-white/90 mb-8 leading-relaxed"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                )}
                
                {slides[currentSlide]?.cta_label && slides[currentSlide]?.cta_href && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    {(() => {
                      const href = slides[currentSlide].cta_href ?? "#";
                      const external = /^https?:\/\//i.test(href);
                      return (
                        <a
                          href={href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer noopener" : undefined}
                          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded-2xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow duration-200"
                        >
                      {slides[currentSlide].cta_label}
                        </a>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-accent' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
