import { supabase } from "./supabase";

export const DEFAULT_CATEGORIES = [
  "카피/문구",
  "디자인",
  "아이디어",
  "코드",
  "레퍼런스",
  "일상",
  "기타",
];

export interface UserCategory {
  id: string;
  name: string;
  display_order: number;
}

export async function fetchUserCategories(userId: string): Promise<UserCategory[]> {
  const { data } = await supabase
    .from("user_categories")
    .select("id, name, display_order")
    .eq("user_id", userId)
    .order("display_order", { ascending: true });

  return (data ?? []) as UserCategory[];
}

export async function getAllCategoryNames(userId: string): Promise<string[]> {
  const custom = await fetchUserCategories(userId);
  const customNames = custom.map((c) => c.name);
  const merged = [...DEFAULT_CATEGORIES];
  for (const name of customNames) {
    if (!merged.includes(name)) merged.push(name);
  }
  return merged;
}

export async function addUserCategory(
  userId: string,
  name: string,
  displayOrder: number
): Promise<UserCategory | null> {
  const { data, error } = await supabase
    .from("user_categories")
    .insert({ user_id: userId, name, display_order: displayOrder })
    .select("id, name, display_order")
    .single();

  if (error || !data) return null;
  return data as UserCategory;
}

export async function updateUserCategory(id: string, name: string) {
  await supabase.from("user_categories").update({ name }).eq("id", id);
}

export async function deleteUserCategory(id: string) {
  await supabase.from("user_categories").delete().eq("id", id);
}

export async function getCategoryCounts(
  userId: string
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("items")
    .select("category")
    .eq("user_id", userId)
    .not("category", "is", null);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const cat = row.category as string;
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return counts;
}
