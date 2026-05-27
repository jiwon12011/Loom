"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Copy, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import BottomSheet from "@/components/ui/BottomSheet";
import Link from "next/link";

type Item = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  created_at: string;
  collection_item_id: string;
  summary: string | null;
};

type SavedItem = Omit<Item, "collection_item_id">;

type Collection = {
  id: string;
  name: string;
  item_count: number;
};

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { show } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [availableItems, setAvailableItems] = useState<SavedItem[]>([]);
  const [addLoading, setAddLoading] = useState(false);

  const fetchCollection = async () => {
    const [{ data: col }, { data: colItems }] = await Promise.all([
      supabase.from("collections").select("id, name, item_count").eq("id", id).single(),
      supabase.from("collection_items")
        .select("id, item_id, items(id, original_content, content_type, category, created_at, summary)")
        .eq("collection_id", id)
        .order("created_at", { ascending: false }),
    ]);

    const mapped = (colItems ?? []).map((ci: any) => ({
      ...ci.items,
      collection_item_id: ci.id,
    }));
    setCollection(col ? { ...col, item_count: mapped.length } : col);
    setItems(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchCollection(); }, [id]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    await supabase.from("collection_items").delete().eq("id", removeTarget);
    setItems(items.filter((i) => i.collection_item_id !== removeTarget));
    setCollection((prev) => prev ? { ...prev, item_count: Math.max(prev.item_count - 1, 0) } : prev);
    setRemoveTarget(null);
    show("컬렉션에서 제거되었어요", "success");
  };

  const openAddSheet = async () => {
    setShowAddSheet(true);
    setAddLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAddLoading(false);
      return;
    }
    const { data } = await supabase
      .from("items")
      .select("id, original_content, content_type, category, created_at, summary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const existingIds = new Set(items.map((item) => item.id));
    setAvailableItems((data ?? []).filter((item) => !existingIds.has(item.id)));
    setAddLoading(false);
  };

  const handleAddExistingItem = async (item: SavedItem) => {
    const { data, error } = await supabase
      .from("collection_items")
      .insert({ collection_id: id, item_id: item.id })
      .select("id")
      .single();

    if (error?.code === "23505") {
      show("이미 추가된 아이템이에요", "error");
      setAvailableItems((prev) => prev.filter((i) => i.id !== item.id));
      return;
    }
    if (error || !data) {
      show("추가 실패. 다시 시도해주세요.", "error");
      return;
    }

    setItems((prev) => [{ ...item, collection_item_id: data.id }, ...prev]);
    setCollection((prev) => prev ? { ...prev, item_count: prev.item_count + 1 } : prev);
    setAvailableItems((prev) => prev.filter((i) => i.id !== item.id));
    show("컬렉션에 추가되었어요", "success");
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[17px] font-bold text-text-primary">{collection?.name ?? "컬렉션"}</h1>
        <button onClick={openAddSheet} className="p-1.5 text-text-primary">
          <Plus size={22} strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-5 pb-3">
        <p className="text-[13px] text-text-muted">{items.length}개 아이템</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          emoji="📁"
          title="컬렉션이 비어있어요"
          description="저장해둔 아이템 중에서 이 컬렉션에 담아보세요."
          action={{ label: "기존 아이템 추가", onClick: openAddSheet }}
        />
      ) : (
        <div className="px-5 space-y-3 pb-6">
          {items.map((item) => (
            <div key={item.collection_item_id} className="bg-white border border-border rounded-2xl p-4">
              <div className="flex gap-3">
                <Link href={`/detail/${item.id}`} className="flex-1 min-w-0">
                  <p className="text-[14px] text-text-primary font-medium leading-[1.6] line-clamp-3">
                    {item.content_type === "image" ? (item.summary ?? "이미지") : item.original_content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {item.category && (
                      <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">{item.category}</span>
                    )}
                    <span className="text-[11px] text-text-muted">{formatDate(item.created_at)}</span>
                  </div>
                </Link>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => { navigator.clipboard.writeText(item.original_content); show("복사 완료", "copy"); }} className="p-1.5 text-text-muted">
                    <Copy size={15} strokeWidth={1.5} />
                  </button>
                  <button onClick={() => setRemoveTarget(item.collection_item_id)} className="p-1.5 text-text-muted">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={showAddSheet} onClose={() => setShowAddSheet(false)} title="기존 아이템 추가">
        {addLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-brand-purple" />
          </div>
        ) : availableItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[15px] font-semibold text-text-primary">추가할 아이템이 없어요</p>
            <p className="text-[13px] text-text-muted mt-1.5">이미 모든 저장 아이템이 이 컬렉션에 들어있어요.</p>
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-2 overflow-y-auto">
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddExistingItem(item)}
                className="w-full rounded-xl border border-border-light px-4 py-3.5 text-left transition-colors active:bg-surface-soft"
              >
                <p className="text-[14px] font-semibold leading-[1.5] text-text-primary line-clamp-2">
                  {item.content_type === "image" ? (item.summary ?? "이미지") : item.original_content}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {item.category && (
                    <span className="rounded bg-surface-section px-2 py-0.5 text-[11px] font-semibold text-brand-purple">{item.category}</span>
                  )}
                  <span className="text-[11px] text-text-muted">{formatDate(item.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={!!removeTarget}
        title="컬렉션에서 제거"
        message="이 아이템을 컬렉션에서 제거할까요? 아이템 자체는 삭제되지 않아요."
        confirmLabel="제거"
        danger
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
