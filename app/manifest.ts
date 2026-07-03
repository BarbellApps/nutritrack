import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NutriTrack — Calorie & Nutrition Tracker",
    short_name: "NutriTrack",
    description:
      "Log meals, scan barcodes, and track calories, macros, water, and weight.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f2e1e",
    theme_color: "#1a5c3a",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
