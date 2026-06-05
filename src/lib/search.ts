import { supabase } from "./supabase";
import type { Item } from "./types";

export type SearchMode = "ai" | "server" | "local";

export type SearchResult = { items: Item[]; mode: SearchMode };

// 서버측 전체검색(RPC). 마이그레이션(08-search-migration.sql) 적용 전이면 에러 → null 반환 → 호출부가 폴백.
async function serverSearch(query: string, limit: number): Promise<Item[] | null> {
  const { data, error } = await supabase.rpc("search_items", {
    p_query: query,
    p_limit: limit,
  });
  if (error) return null; // 함수 미존재(미마이그레이션) 등 → 클라 폴백
  return (data as Item[]) ?? [];
}

// LLM 재랭킹: 후보 ids 순서를 받아온다. 실패/빈 결과면 빈 배열.
async function aiRankIds(query: string, candidates: Item[]): Promise<string[]> {
  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        items: candidates.map(({ id, original_content, content_type, category, summary }) => ({
          id,
          original_content,
          content_type,
          category,
          summary,
        })),
      }),
    });
    const json = await res.json();
    return Array.isArray(json.ids) ? json.ids : [];
  } catch {
    return [];
  }
}

const matchesLocally = (item: Item, q: string) => {
  const needle = q.toLowerCase();
  return (
    item.original_content?.toLowerCase().includes(needle) ||
    item.category?.toLowerCase().includes(needle) ||
    item.summary?.toLowerCase().includes(needle) ||
    false
  );
};

/**
 * 아카이브 검색. 서버 RPC가 있으면 전체 항목에서 후보를 추려(200개 천장 제거) LLM 재랭킹하고,
 * 없으면 fallback(클라가 이미 로드한 항목)으로 기존 동작을 유지한다.
 */
export async function searchArchive(query: string, fallback: Item[], limit = 50): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return { items: [], mode: "local" };

  const server = await serverSearch(trimmed, limit);
  const candidates = server ?? fallback;
  const serverHit = server !== null;

  const ids = await aiRankIds(trimmed, candidates);
  const byId = new Map(candidates.map((i) => [i.id, i]));

  if (ids.length > 0) {
    const ranked = ids.map((id) => byId.get(id)).filter((x): x is Item => Boolean(x));
    return { items: ranked, mode: "ai" };
  }

  // LLM 결과 없음 → 후보 안에서 로컬 매칭. (server 후보는 이미 전체에서 추려진 것이라 천장 없음)
  const local = candidates.filter((i) => matchesLocally(i, trimmed));
  return { items: local, mode: serverHit ? "server" : "local" };
}
