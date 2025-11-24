import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1440px" }
    },
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1920px"
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["Parkinsans", "Roboto", "sans-serif"],
        jost: ["Jost", "sans-serif"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        md: ["1.125rem", { lineHeight: "1.6" }],
        lg: ["1.25rem", { lineHeight: "1.5" }],
        xl: ["1.5rem", { lineHeight: "1.4" }],
        "2xl": ["2rem", { lineHeight: "1.3" }],
        "3xl": ["2.5rem", { lineHeight: "1.2" }],
        "4xl": ["3.5rem", { lineHeight: "1.1" }]
      },
      colors: {
        background: "rgb(var(--color-bg) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-2": "rgb(var(--color-accent-2) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)"
      },
      borderRadius: {
        none: "0",
        sm: "0.375rem",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "9999px"
      },
      boxShadow: {
        glow: "0 16px 48px -24px rgba(213, 155, 246, 0.55)",
        "glow-soft": "0 12px 36px -18px rgba(188, 167, 217, 0.45)",
        "glow-medium": "0 20px 60px -20px rgba(213, 155, 246, 0.6)"
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        250: "250ms"
      },
      transitionTimingFunction: {
        springy: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      keyframes: {
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "cta-pop": {
          "0%": { transform: "scale(1)" },
          "60%": { transform: "scale(1.015)" },
          "100%": { transform: "scale(1)" }
        },
        "halo-glow": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" }
        }
      },
      animation: {
        "fade-slide-up": "fade-slide-up 250ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "cta-pop": "cta-pop 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        "halo-glow": "halo-glow 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
