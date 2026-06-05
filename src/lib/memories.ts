import { supabase } from "./supabase";
import type { Item } from "./types";

export type Memory = { items: Item[]; label: string };

const SELECT = "id, original_content, content_type, category, copy_count, created_at, summary, tags";

type Window = { label: string; start: Date; end: Date };

// "그날의 기억" 후보 시간창. 위에서부터 우선 시도하고, 항목이 있으면 그걸 쓴다.
function buildWindows(now: Date): Window[] {
  const dayMs = 86_400_000;
  const around = (center: Date, padDays: number): Pick<Window, "start" | "end"> => ({
    start: new Date(center.getTime() - padDays * dayMs),
    end: new Date(center.getTime() + padDays * dayMs),
  });

  const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);
  const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
  const weekAgo = new Date(now.getTime() - 7 * dayMs);

  return [
    { label: "1년 전 오늘", ...around(yearAgo, 4) },
    { label: "한 달 전", ...around(monthAgo, 4) },
    { label: "일주일 전", ...around(weekAgo, 2) },
  ];
}

/**
 * 홈 상단 "오늘의 회상". 과거 같은 시기에 저장한 항목을 찾아, 잊고 있던 것(복사 적은 것)을 우선 노출.
 * 시간창에 아무것도 없으면, 2주 이상 안 꺼낸 항목 하나를 폴백으로 띄운다. 그래도 없으면 null.
 */
export async function getMemory(userId: string, now = new Date()): Promise<Memory | null> {
  for (const w of buildWindows(now)) {
    const { data } = await supabase
      .from("items")
      .select(SELECT)
      .eq("user_id", userId)
      .gte("created_at", w.start.toISOString())
      .lte("created_at", w.end.toISOString())
      .order("copy_count", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(3);
    if (data && data.length > 0) return { items: data as Item[], label: w.label };
  }

  // 폴백: 2주 이상 전에 저장하고 아직 한 번도 복사 안 한 항목 (잊힌 기억 구조)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("items")
    .select(SELECT)
    .eq("user_id", userId)
    .eq("copy_count", 0)
    .lte("created_at", twoWeeksAgo)
    .order("created_at", { ascending: true })
    .limit(1);
  if (data && data.length > 0) return { items: data as Item[], label: "다시 보면 좋을 기억" };

  return null;
}
