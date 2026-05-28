import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loom - AI 개인 아카이브",
    short_name: "Loom",
    description: "저장하고, AI가 정리하고, 자연어로 찾는다",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8b7ea8",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
