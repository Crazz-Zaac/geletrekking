/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Existing oasis palette used in some components.  Feel free to
        // update these values or remove them if unused.
        oasis: {
          bg: "#f7f9f8",
          card: "#ffffff",
          primary: "#2f6f62",
          secondary: "#8fb8ad",
          accent: "#e6f2ef",
          text: "#1f2933",
          muted: "#6b7280",
        },
        // New brand palette inspired by the provided TrekWays design.
        brand: {
          primary: "#ff7b29",     // vibrant orange used for CTA buttons
          secondary: "#063770",   // deep navy used for headings and nav
          highlight: "#2b8a6d",    // teal accent for cards
          gradientStart: "#1e3c72", // dark blue for gradient backgrounds
          gradientEnd: "#2ca58d",   // green/teal for gradient backgrounds
          light: "#f5f5f5",        // light background for sections
          dark: "#0a0e23",         // dark footer background
          gold: "#fed700",         // gold accent for pricing and stars
        },
      },
      fontFamily: {
        // Use Poppins for our sans font stack; fall back to system fonts
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        oasis: "0 10px 30px rgba(0,0,0,0.06)",
        soft: "0 4px 14px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};