"use client";

import { useState } from "react";
import { ArrowLeft, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockCollections, mockItems } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { Copy, Star } from "lucide-react";

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { show } = useToast();
  const collection = mockCollections.find((c) => c.id === id) || mockCollections[0];

  const [items, setItems] = useState(mockItems.slice(0, 5));
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const handleRemove = () => {
    if (!removeTarget) return;
    setItems(items.filter((i) => i.id !== removeTarget));
    setRemoveTarget(null);
    show("컬렉션에서 제거되었어요", "success");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[17px] font-bold text-text-primary">{collection.name}</h1>
        <button className="p-1.5 text-text-muted">
          <MoreHorizontal size={22} strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-5 pb-3">
        <p className="text-[13px] text-text-muted">{items.length}개 아이템</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          emoji="📁"
          title="컬렉션이 비어있어요"
          description="아이템을 저장하고 이 컬렉션에 추가해보세요."
          action={{ label: "아이템 저장하기", onClick: () => router.push("/save") }}
        />
      ) : (
        <div className="px-5 space-y-3 pb-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-border rounded-2xl p-4">
              <div className="flex gap-3">
                {item.image_url && (
                  <Link href={`/detail/${item.id}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-soft">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </Link>
                )}
                <Link href={`/detail/${item.id}`} className="flex-1 min-w-0">
                  <p className="text-[14px] text-text-primary font-medium leading-[1.6] line-clamp-3">{item.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">{item.category}</span>
                    <span className="text-[11px] text-text-muted">{item.created_at}</span>
                  </div>
                </Link>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => { navigator.clipboard.writeText(item.content); show("복사 완료", "copy"); }} className="p-1.5 text-text-muted">
                    <Copy size={15} strokeWidth={1.5} />
                  </button>
                  <button onClick={() => setRemoveTarget(item.id)} className="p-1.5 text-text-muted">
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
        message="이 아이템을 컬렉션에서 제거하시겠어요? 아이템 자체는 삭제되지 않습니다."
        confirmLabel="제거"
        danger
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
