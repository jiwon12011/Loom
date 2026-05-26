import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = ["카피/문구", "디자인", "아이디어", "코드", "레퍼런스", "일상", "기타"];

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ category: null, tags: [] });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ category: null, tags: [], error: "no_key" });
  }

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
            content: `You are a text classifier. Always respond with valid JSON only: {"category": "...", "tags": [...]}`,
          },
          {
            role: "user",
            content: `Classify this text. Choose category from: ${CATEGORIES.join(", ")}. Add up to 3 short tags (Korean words). Respond only with JSON.

Text: ${content.slice(0, 1000)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ category: null, tags: [], error: "api_error", _raw: json?.error?.message });
    }

    const text = json.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(text);
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : null;
    const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [];

    return NextResponse.json({ category, tags, _raw: text.slice(0, 80) });
  } catch (e: any) {
    return NextResponse.json({ category: null, tags: [], error: e?.message ?? "exception" });
  }
}
