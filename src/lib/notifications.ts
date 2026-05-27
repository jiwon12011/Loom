import { supabase } from "./supabase";

export type NotificationType =
  | "ai_complete"
  | "category_suggest"
  | "popular_item"
  | "storage_info";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  item_id: string | null;
  created_at: string;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  description: string,
  itemId?: string
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    description,
    item_id: itemId ?? null,
    read: false,
  });
}

export async function notifyAiComplete(
  userId: string,
  itemId: string,
  category: string | null,
  tags: string[]
) {
  const parts: string[] = [];
  if (category) parts.push(`카테고리: ${category}`);
  if (tags.length > 0) parts.push(`태그: ${tags.join(", ")}`);
  const desc = parts.length > 0
    ? `AI가 자동으로 정리했어요. ${parts.join(" · ")}`
    : "AI가 아이템을 분석했어요.";

  await createNotification(userId, "ai_complete", "AI 정리 완료", desc, itemId);
}

export async function fetchNotifications(userId: string) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as Notification[];
}

export async function markAsRead(notificationId: string) {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
}

export async function markAllAsRead(userId: string) {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return count ?? 0;
}
