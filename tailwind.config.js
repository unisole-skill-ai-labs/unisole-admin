import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border, 217.2 32.6% 17.5%))',
        input: 'hsl(var(--input, 217.2 32.6% 17.5%))',
        ring: 'hsl(var(--ring, 238 83% 60%))',
        background: 'hsl(var(--background, 224 71% 4%))',
        foreground: 'hsl(var(--foreground, 210 40% 98%))',
        primary: {
          DEFAULT: 'hsl(var(--primary, 238 83% 60%))',
          foreground: 'hsl(var(--primary-foreground, 210 40% 98%))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary, 222.2 47.4% 11.2%))',
          foreground: 'hsl(var(--secondary-foreground, 210 40% 98%))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive, 0 62.8% 50.6%))',
          foreground: 'hsl(var(--destructive-foreground, 210 40% 98%))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted, 217.2 32.6% 75%))',
          foreground: 'hsl(var(--muted-foreground, 215 20.2% 65.1%))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent, 222.2 47.4% 11.2%))',
          foreground: 'hsl(var(--accent-foreground, 210 40% 98%))',
        },
        card: {
          DEFAULT: 'hsl(var(--card, 222 47% 11%))',
          foreground: 'hsl(var(--card-foreground, 210 40% 98%))',
        },
        brand: {
          50: 'var(--brand-50, #eff6ff)',
          100: 'var(--brand-100, #dbeafe)',
          500: 'var(--brand-500, #3b82f6)',
          600: 'var(--brand-600, #2563eb)',
          700: 'var(--brand-700, #1d4ed8)',
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: 'var(--radius-card, 1.25rem)',
        md: 'var(--radius, 0.75rem)',
        sm: 'calc(var(--radius, 0.75rem) - 4px)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};


