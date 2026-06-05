// SWR 데이터 레이어. 페이지마다 흩어진 useEffect+supabase.select 패턴을 훅으로 통일한다.
// - 네비게이션 간 캐시(dedupe), 저장/삭제 후 자동 갱신(mutate), 낙관적 삭제 지원.

import useSWR, { mutate as globalMutate, type KeyedMutator } from "swr";
import { supabase } from "./supabase";
import type { Item, Collection } from "./types";

// home/search가 공통으로 쓰는 select 컬럼 (단일 소스).
const ITEMS_SELECT =
  "id, original_content, content_type, category, copy_count, created_at, summary, tags";

// 모든 훅이 공유하는 SWR 옵션. (SWRConfig Provider 없이 동일 효과)
const SWR_OPTIONS = {
  // 저장/삭제는 mutate로 즉시 갱신하므로, 모바일 포커스 전환마다 재쿼리하지 않는다(데이터·배터리 절약).
  revalidateOnFocus: false,
  dedupingInterval: 5000,
} as const;

// items 캐시 키. user별로 분리해 다른 계정 데이터가 섞이지 않게 한다.
export const itemsKey = (userId: string) => ["items", userId] as const;

// ──────────────────────────────────────────────────────────────────────────
// useItems: 현재 로그인 유저의 items를 created_at desc로 가져온다.
// user 없으면 빈 배열 + isLoading false (무한로딩 금지).
// ──────────────────────────────────────────────────────────────────────────
export function useItems() {
  // key가 fetcher 실행 시점에 userId를 담도록, key를 함수로 비동기 해석한다.
  // SWR key는 동기여야 하므로 "auth-then-items" 패턴: 먼저 user를 한 번 가져와 key를 만든다.
  const { data: userId, isLoading: userLoading } = useSWR(
    "auth-user-id",
    async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    SWR_OPTIONS
  );

  const swr = useSWR<Item[]>(
    // user 미확정/미로그인이면 key=null → fetcher 미실행.
    userId ? itemsKey(userId) : null,
    async () => {
      const { data, error } = await supabase
        .from("items")
        .select(ITEMS_SELECT)
        .eq("user_id", userId as string)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Item[];
    },
    SWR_OPTIONS
  );

  // user 해석 끝났고 비로그인이면 로딩은 false(빈 배열 고정).
  const isLoading = userLoading || (Boolean(userId) && swr.isLoading);

  return {
    items: swr.data ?? [],
    isLoading,
    error: swr.error,
    mutate: swr.mutate,
    userId: userId ?? null,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// useCollections: collections 목록. item_count는 트리거로 비정규화 유지되므로 신뢰.
// ──────────────────────────────────────────────────────────────────────────
export function useCollections() {
  const { data: userId, isLoading: userLoading } = useSWR(
    "auth-user-id",
    async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    SWR_OPTIONS
  );

  const swr = useSWR<Collection[]>(
    userId ? ["collections", userId] : null,
    async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, description, item_count")
        .eq("user_id", userId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((c) => ({ ...c, item_count: c.item_count ?? 0 })) as Collection[];
    },
    SWR_OPTIONS
  );

  const isLoading = userLoading || (Boolean(userId) && swr.isLoading);

  return {
    collections: swr.data ?? [],
    isLoading,
    error: swr.error,
    mutate: swr.mutate,
    userId: userId ?? null,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// 낙관적 삭제 헬퍼.
// items 캐시에서 먼저 제거(낙관적) → DB delete → 실패 시 revalidate로 롤백.
// 호출 측이 가진 훅 mutate를 넘긴다.
// ──────────────────────────────────────────────────────────────────────────
export async function deleteItems(ids: string[], mutate: KeyedMutator<Item[]>) {
  const idSet = new Set(ids);
  await mutate(
    async (current) => {
      const { error } = await supabase.from("items").delete().in("id", ids);
      if (error) throw error; // throw → SWR이 이전 데이터 유지 후 revalidate(롤백)
      return (current ?? []).filter((i) => !idSet.has(i.id));
    },
    {
      optimisticData: (current) => (current ?? []).filter((i) => !idSet.has(i.id)),
      rollbackOnError: true,
      revalidate: false,
      populateCache: true,
    }
  );
}

// 단건 삭제 단축.
export async function deleteItem(id: string, mutate: KeyedMutator<Item[]>) {
  return deleteItems([id], mutate);
}

// ──────────────────────────────────────────────────────────────────────────
// 글로벌 무효화: detail 등 useItems 훅 인스턴스가 없는 곳에서 items 캐시를 비운다.
// 삭제 직후 home/search로 돌아갔을 때 유령 카드가 남지 않게 한다.
// ──────────────────────────────────────────────────────────────────────────
export async function invalidateItems(userId: string) {
  await globalMutate(itemsKey(userId));
}
