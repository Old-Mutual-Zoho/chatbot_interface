import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00A651",
        primaryDark: "#008C44",
        primaryLight: "#B2EEC3",

        neutralLight: "#F9FAFB",
        neutralDark: "#111827",

        accent: "#F97316",
      },

      borderRadius: {
        widget: "20px",
        bubble: "16px",
      },
    },
  },
} satisfies Config;
