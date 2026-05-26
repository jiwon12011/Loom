import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = ["카피/문구", "디자인", "아이디어", "코드", "레퍼런스", "일상", "기타"];

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ category: null, tags: [] });
  }

  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ category: null, tags: [], error: "no_key" });
  }

  const prompt = `다음 텍스트를 분석해서 카테고리 1개와 태그 최대 3개를 추천해줘.

카테고리는 반드시 아래 중 하나만 선택해:
${CATEGORIES.join(", ")}

태그는 텍스트의 핵심 키워드로, 2~5글자 단어로 3개 이하.

반드시 아래 JSON 형식으로만 응답해. 다른 말은 하지 마:
{"category": "카테고리명", "tags": ["태그1", "태그2"]}

텍스트:
${content.slice(0, 1000)}`;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 100,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      const errMsg = json?.error?.message ?? JSON.stringify(json).slice(0, 100);
      return NextResponse.json({ category: null, tags: [], error: "api_error", _raw: errMsg });
    }

    const text = json.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ category: null, tags: [], _raw: text });
    }

    const parsed = JSON.parse(match[0]);
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : null;
    const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [];

    return NextResponse.json({ category, tags });
  } catch (e: any) {
    return NextResponse.json({ category: null, tags: [], error: e?.message ?? "exception" });
  }
}
