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
      { src: "/logo-192.webp", sizes: "192x192", type: "image/webp", purpose: "any" },
      { src: "/logo-512.webp", sizes: "512x512", type: "image/webp", purpose: "any" },
      { src: "/logo-512.webp", sizes: "512x512", type: "image/webp", purpose: "maskable" },
    ],
    // 공유 시트(다른 앱의 "공유")로 Loom에 바로 저장. GET이라 별도 SW 불필요.
    // 공유 데이터는 /save?title=&text=&url= 로 전달된다.
    // Next 타입이 웹 표준(params 객체형)과 어긋나 있어 표준 JSON을 내보내도록 캐스팅한다.
    share_target: {
      action: "/save",
      method: "GET",
      params: { title: "title", text: "text", url: "url" },
    } as unknown as MetadataRoute.Manifest["share_target"],
  };
}
