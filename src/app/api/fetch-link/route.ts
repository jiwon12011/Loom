import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Loom/1.0; +https://loom.app)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

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
