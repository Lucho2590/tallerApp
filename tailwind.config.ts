import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta personalizada - Dark Mode
        negro: "#000000",
        charcoal: "#121212",
        "gris-metal": "#1E1E1E",
        "gris-acero": "#2C2C2C",
        "gris-claro": "#BDBDBD",

        // Paleta personalizada - Light Mode
        "gris-claro-light": "#F5F5F5",
        "gris-suave": "#E0E0E0",
        "gris-acero-light": "#BDBDBD",
        grafito: "#757575",

        // Acentos (compartidos)
        "naranja-primario": "#F57C00",
        "naranja-hover": "#FB8C00",
        "naranja-acento": "#FF9800",
        ambar: "#FFC107",

        // Textos Dark
        blanco: "#FFFFFF",
        "gris-texto": "#E0E0E0",
        "gris-medio": "#9E9E9E",

        // Textos Light
        "negro-texto": "#000000",
        "gris-oscuro": "#212121",

        // Tokens shadcn
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
