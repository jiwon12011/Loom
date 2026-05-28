# Loom - Edge Functions 설계

## 1. ai-process (AI 처리)

### 트리거
아이템 저장 후 호출 (DB webhook 또는 클라이언트 직접 호출)

### 입력
```json
{
  "item_id": "uuid",
  "original_content": "사용자가 저장한 원문",
  "content_type": "text"
}
```

### 처리 과정
```typescript
// supabase/functions/ai-process/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { item_id, original_content, content_type } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. AI 제목/카테고리/태그 생성
  const aiResult = await generateMetadata(original_content)
  
  // 2. items 테이블 업데이트
  await supabase.from('items').update({
    title: aiResult.title,
    summary: aiResult.summary,
    category: aiResult.category,
    tags: aiResult.tags,
    ai_processed: true
  }).eq('id', item_id)

  // 3. Chunk 분리
  const chunks = splitIntoChunks(original_content)
  
  // 4. 각 chunk에 대해 embedding 생성 및 저장
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i])
    await supabase.from('item_chunks').insert({
      item_id,
      user_id: getUserIdFromItem(item_id),
      chunk_text: chunks[i],
      chunk_index: i,
      embedding
    })
  }

  return new Response(JSON.stringify({ success: true }))
})
```

### OpenAI 프롬프트
```
시스템: 당신은 사용자의 메모를 분류하는 어시스턴트입니다.
절대로 원문을 수정하지 마세요. 메타데이터만 생성하세요.

사용자 입력을 분석하여 다음 JSON 형식으로 응답하세요:
{
  "title": "10자 이내의 짧은 제목",
  "summary": "20자 이내의 한 줄 요약",
  "category": "디자인|마케팅|프롬프트|개발|아이디어|글쓰기|레퍼런스|기타 중 1개",
  "tags": ["태그1", "태그2", "태그3"] // 최대 5개
}
```

---

## 2. generate-embedding (Embedding 생성)

### 입력
```json
{
  "text": "embedding을 생성할 텍스트",
  "item_id": "uuid",
  "chunk_index": 0
}
```

### 처리
```typescript
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  })
  
  const data = await response.json()
  return data.data[0].embedding
}
```

---

## 3. search (벡터 검색)

### 입력
```json
{
  "query": "사용자 검색어",
  "user_id": "uuid",
  "limit": 20
}
```

### 처리
```typescript
serve(async (req) => {
  const { query, user_id, limit = 20 } = await req.json()
  
  // 1. 검색어를 embedding으로 변환
  const queryEmbedding = await generateEmbedding(query)
  
  // 2. pgvector 유사도 검색
  const { data: results } = await supabase.rpc('search_chunks', {
    query_embedding: queryEmbedding,
    match_user_id: user_id,
    match_threshold: 0.7,
    match_count: limit
  })
  
  // 3. 결과에 이미지 정보 추가
  const enrichedResults = await enrichWithImages(results)
  
  return new Response(JSON.stringify({ results: enrichedResults }))
})
```

### 응답
```json
{
  "results": [
    {
      "chunk_id": "uuid",
      "item_id": "uuid",
      "chunk_text": "매칭된 텍스트 부분",
      "similarity": 0.89,
      "item_title": "감성 광고 카피 작성 팁",
      "item_category": "마케팅",
      "item_tags": ["광고카피", "브랜딩"],
      "item_created_at": "2025-01-15T10:00:00Z",
      "images": [{ "url": "...", "thumbnail": "..." }]
    }
  ]
}
```

---

## 4. Chunk 분리 로직

```typescript
function splitIntoChunks(text: string): string[] {
  const chunks: string[] = []
  
  // 1. 먼저 빈 줄로 분리 (문단 단위)
  const paragraphs = text.split(/\n\s*\n/)
  
  for (const paragraph of paragraphs) {
    // 2. 각 문단이 300자 이하면 그대로 하나의 chunk
    if (paragraph.length <= 300) {
      chunks.push(paragraph.trim())
    } else {
      // 3. 300자 초과면 문장 단위로 분리
      const sentences = paragraph.split(/(?<=[.!?。\n])\s*/)
      let currentChunk = ''
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > 300) {
          if (currentChunk) chunks.push(currentChunk.trim())
          currentChunk = sentence
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim())
    }
  }
  
  return chunks.filter(c => c.length > 0)
}
```

---

## 5. admin-stats (관리자 통계)

### 엔드포인트
```
GET /admin/stats?range=7d|30d|90d
```

### 응답
```json
{
  "overview": {
    "total_users": 1247,
    "dau": 342,
    "total_items": 45623,
    "today_items": 234,
    "today_searches": 1203
  },
  "chart_data": {
    "signups": [{ "date": "2025-01-01", "count": 23 }, ...],
    "items": [{ "date": "2025-01-01", "count": 156 }, ...],
    "searches": [{ "date": "2025-01-01", "count": 892 }, ...]
  },
  "categories": {
    "마케팅": 12340,
    "디자인": 9823,
    "개발": 8234,
    ...
  }
}
```
