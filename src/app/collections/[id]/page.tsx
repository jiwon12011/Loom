"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

type Item = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  created_at: string;
  collection_item_id: string;
};

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

  useEffect(() => {
    const fetch = async () => {
      const [{ data: col }, { data: colItems }] = await Promise.all([
        supabase.from("collections").select("id, name, item_count").eq("id", id).single(),
        supabase.from("collection_items")
          .select("id, item_id, items(id, original_content, content_type, category, created_at)")
          .eq("collection_id", id)
          .order("created_at", { ascending: false }),
      ]);

      setCollection(col);
      const mapped = (colItems ?? []).map((ci: any) => ({
        ...ci.items,
        collection_item_id: ci.id,
      }));
      setItems(mapped);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    await supabase.from("collection_items").delete().eq("id", removeTarget);
    setItems(items.filter((i) => i.collection_item_id !== removeTarget));
    setRemoveTarget(null);
    show("컬렉션에서 제거되었어요", "success");
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
        <div className="w-8" />
      </header>

      <div className="px-5 pb-3">
        <p className="text-[13px] text-text-muted">{items.length}개 아이템</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          emoji="📁"
          title="컬렉션이 비어있어요"
          description="아이템 상세 페이지에서 이 컬렉션에 추가해보세요."
          action={{ label: "아이템 저장하기", onClick: () => router.push("/save") }}
        />
      ) : (
        <div className="px-5 space-y-3 pb-6">
          {items.map((item) => (
            <div key={item.collection_item_id} className="bg-white border border-border rounded-2xl p-4">
              <div className="flex gap-3">
                <Link href={`/detail/${item.id}`} className="flex-1 min-w-0">
                  <p className="text-[14px] text-text-primary font-medium leading-[1.6] line-clamp-3">{item.original_content}</p>
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
