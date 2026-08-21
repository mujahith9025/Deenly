/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      // Responsive breakpoints: mobile (< 640px), tablet (640–1024px), desktop (> 1024px)
      sm: '640px',   // tablet lower bound
      md: '768px',
      lg: '1024px',  // desktop lower bound
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        "secondary-container": "#4a3d7c",
        "tertiary-fixed-dim": "#4edea3",
        "error": "#ffb4ab",
        "primary": "#d2bbff",
        "tertiary-container": "#007650",
        "secondary": "#ccbeff",
        "surface-container-lowest": "#060e20",
        "tertiary": "#4edea3",
        "on-tertiary-fixed": "#002113",
        "on-secondary-fixed-variant": "#4a3d7c",
        "on-primary": "#3f008e",
        "on-surface-variant": "#ccc3d8",
        "outline": "#958da1",
        "on-primary-container": "#ede0ff",
        "surface-container": "#171f33",
        "on-primary-fixed": "#25005a",
        "outline-variant": "#4a4455",
        "on-tertiary": "#003824",
        "primary-fixed": "#eaddff",
        "secondary-fixed-dim": "#ccbeff",
        "surface-variant": "#2d3449",
        "inverse-primary": "#732ee4",
        "primary-fixed-dim": "#d2bbff",
        "on-tertiary-container": "#76ffc2",
        "inverse-on-surface": "#283044",
        "on-primary-fixed-variant": "#5a00c6",
        "inverse-surface": "#dae2fd",
        "surface-tint": "#d2bbff",
        "on-secondary-fixed": "#1e0e4e",
        "surface-dim": "#0b1326",
        "secondary-fixed": "#e7deff",
        "tertiary-fixed": "#6ffbbe",
        "on-background": "#dae2fd",
        "on-tertiary-fixed-variant": "#005236",
        "error-container": "#93000a",
        "background": "#0b1326",
        "surface-container-low": "#131b2e",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",
        "primary-container": "#7c3aed",
        "on-secondary": "#332664",
        "on-error-container": "#ffdad6",
        "surface": "#0b1326",
        "on-error": "#690005",
        "surface-bright": "#31394d",
        "on-surface": "#dae2fd",
        "on-secondary-container": "#baabf3"
      },
      borderRadius: {
        "sm": "0.5rem",
        "DEFAULT": "1rem",
        "md": "1.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "section-gap": "32px",
        "container-margin": "24px",
        "gutter": "16px",
        "card-padding": "20px"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        "plus-jakarta": ["'Plus Jakarta Sans'", "sans-serif"],
        "noto-serif": ["'Noto Serif'", "serif"],
        "label-caps": ["'Plus Jakarta Sans'", "sans-serif"],
        "display-quran-mobile": ["'Noto Serif'", "serif"],
        "body-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "display-quran": ["'Noto Serif'", "serif"],
        "h2": ["'Plus Jakarta Sans'", "sans-serif"],
        "h1": ["'Plus Jakarta Sans'", "sans-serif"],
        "body-md": ["'Plus Jakarta Sans'", "sans-serif"]
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "display-quran-mobile": ["32px", { lineHeight: "170%", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "display-quran": ["40px", { lineHeight: "180%", fontWeight: "400" }],
        "h2": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "h1": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    }
  },
  plugins: [],
}
