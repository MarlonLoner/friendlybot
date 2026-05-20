import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        eclipse: {
          blue: "#071A3D",
          blueSoft: "#102C5F",
          gold: "#D9A441",
          goldSoft: "#F6E4B8",
          ink: "#13213C",
          mist: "#F5F7FB"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(7, 26, 61, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
