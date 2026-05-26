import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = ["카피/문구", "디자인", "아이디어", "코드", "레퍼런스", "일상", "기타"];

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ category: null, tags: [] });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[categorize] GEMINI_API_KEY not set");
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
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 100 },
        }),
      }
    );

    const json = await res.json();
    if (!res.ok) {
      console.error("[categorize] Gemini API error:", JSON.stringify(json));
      return NextResponse.json({ category: null, tags: [], error: "api_error" });
    }
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ category: null, tags: [] });

    const parsed = JSON.parse(match[0]);
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : null;
    const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [];

    return NextResponse.json({ category, tags });
  } catch (e) {
    console.error("[categorize] exception:", e);
    return NextResponse.json({ category: null, tags: [], error: "exception" });
  }
}
