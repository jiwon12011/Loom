import { NextRequest, NextResponse } from "next/server";

type SearchCandidate = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  summary: string | null;
};

const localScore = (query: string, item: SearchCandidate) => {
  const q = query.toLowerCase();
  const text = [
    item.original_content,
    item.summary ?? "",
    item.category ?? "",
    item.content_type,
  ].join(" ").toLowerCase();

  if (!q.trim()) return 0;
  if (text.includes(q)) return 100;
  return q.split(/\s+/).filter((word) => word && text.includes(word)).length;
};

// 클라이언트(홈/검색)는 최대 200개를 보냅니다. 로컬 폴백과 AI 랭킹의 검색 범위를 일치시키기 위해
// 동일하게 200개까지 후보로 사용하고, 토큰 예산을 위해 항목별 텍스트 길이를 제한합니다.
const MAX_CANDIDATES = 200;
const MAX_ITEM_TEXT = 400;

export async function POST(req: NextRequest) {
  const { query, items } = await req.json() as { query?: string; items?: SearchCandidate[] };
  const candidates = (items ?? []).slice(0, MAX_CANDIDATES);

  if (!query?.trim() || candidates.length === 0) {
    return NextResponse.json({ ids: [], mode: "empty" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const ids = candidates
      .map((item) => ({ id: item.id, score: localScore(query, item) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.id);
    return NextResponse.json({ ids, mode: "local" });
  }

  const compactItems = candidates.map((item, index) => ({
    index,
    id: item.id,
    type: item.content_type,
    category: item.category,
    text: (item.summary || item.original_content).slice(0, MAX_ITEM_TEXT),
  }));

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You rank personal archive items by semantic relevance. Return valid JSON only.",
          },
          {
            role: "user",
            content: `Query: ${query}

Return up to 20 relevant item ids, best first. Match meaning, mood, category, summary, OCR-like text, and related concepts. If nothing is relevant, return an empty array.

JSON format only:
{"ids":["item-id-1","item-id-2"]}

Items:
${JSON.stringify(compactItems)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? "search_api_error");

    const text = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    const allowed = new Set(candidates.map((item) => item.id));
    const ids = Array.isArray(parsed.ids)
      ? parsed.ids.filter((id: unknown): id is string => typeof id === "string" && allowed.has(id))
      : [];

    if (ids.length === 0) {
      const fallbackIds = candidates
        .map((item) => ({ id: item.id, score: localScore(query, item) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.id);
      return NextResponse.json({ ids: fallbackIds, mode: "ai_empty_fallback" });
    }

    return NextResponse.json({ ids, mode: "ai" });
  } catch (e: any) {
    const ids = candidates
      .map((item) => ({ id: item.id, score: localScore(query, item) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.id);
    return NextResponse.json({ ids, mode: "fallback", error: e?.message ?? "unknown" });
  }
}
