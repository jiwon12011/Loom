import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  if (!isSafePublicUrl(url)) {
    return NextResponse.json({ error: "blocked_url" }, { status: 400 });
  }

  try {
    const res = await safeFetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { title: null, description: null, image: null, error: "fetch_failed" },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ title: url, description: null, image: null });
    }

    const html = await res.text();

    const title =
      extractMeta(html, "og:title") ??
      extractTag(html, "title") ??
      null;

    const description =
      extractMeta(html, "og:description") ??
      extractMeta(html, "description") ??
      null;

    const rawImage =
      extractMetaContent(html, "og:image") ?? null;

    const image = rawImage ? resolveUrl(rawImage, url) : null;

    return NextResponse.json({ title, description, image });
  } catch {
    return NextResponse.json(
      { title: null, description: null, image: null, error: "exception" },
      { status: 502 }
    );
  }
}

// SSRF 방어: http(s)만 허용하고 사설/내부 호스트를 차단한다.
function isSafePublicUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  return !isPrivateHost(u.hostname);
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // IPv6 대괄호 제거
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }
  // IPv6 루프백/링크로컬/유니크로컬
  if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    return true;
  }
  // IPv4 사설/예약 대역
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // 클라우드 메타데이터
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true; // 멀티캐스트/예약
  }
  return false;
}

// 리다이렉트를 수동으로 따라가며 매 홉마다 호스트를 재검증한다(리다이렉트 우회 차단).
async function safeFetch(startUrl: string, maxHops = 4): Promise<Response> {
  let current = startUrl;
  for (let hop = 0; hop < maxHops; hop++) {
    const res = await fetch(current, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Loom/1.0; +https://loom.app)",
        Accept: "text/html",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res;
      const next = new URL(location, current).href;
      if (!isSafePublicUrl(next)) throw new Error("blocked_redirect");
      current = next;
      continue;
    }
    return res;
  }
  throw new Error("too_many_redirects");
}

function extractMeta(html: string, property: string): string | undefined {
  const ogRe = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(ogRe);
  if (match) return decodeHtmlEntities(match[1]);

  const reversedRe = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const match2 = html.match(reversedRe);
  if (match2) return decodeHtmlEntities(match2[1]);

  return undefined;
}

function extractMetaContent(html: string, property: string): string | undefined {
  const ogRe = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(ogRe);
  if (match) return match[1];

  const reversedRe = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const match2 = html.match(reversedRe);
  if (match2) return match2[1];

  return undefined;
}

function extractTag(html: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i");
  const match = html.match(re);
  return match ? decodeHtmlEntities(match[1].trim()) : undefined;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function resolveUrl(src: string, base: string): string {
  if (src.startsWith("http")) return src;
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}
