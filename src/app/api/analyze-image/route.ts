import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = ["카피/문구", "디자인", "아이디어", "코드", "레퍼런스", "일상", "기타"];

export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json();
  if (!imageUrl) return NextResponse.json({ category: null, tags: [], summary: null });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ category: null, tags: [], summary: null });

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `이 이미지를 분석해줘.

1. 이미지에 텍스트가 있으면 모두 추출해서 "extracted_text"에 담아줘. 텍스트가 없으면 빈 문자열.
2. 이미지 내용을 1~2문장으로 한국어 요약해서 "summary"에 담아줘.
3. 카테고리는 반드시 아래 중 하나 선택: ${CATEGORIES.join(", ")}
4. 핵심 키워드 태그 최대 3개.

JSON 형식으로만 응답해:
{"extracted_text": "...", "summary": "...", "category": "카테고리명", "tags": ["태그1", "태그2"]}`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    const json = await res.json();
    if (!res.ok) return NextResponse.json({ category: null, tags: [], summary: null });

    const text = json.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(text);
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : null;
    const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [];
    const extractedText = typeof parsed.extracted_text === "string" ? parsed.extracted_text.trim() : "";
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : null;

    return NextResponse.json({ category, tags, extractedText, summary });
  } catch {
    return NextResponse.json({ category: null, tags: [], summary: null });
  }
}
