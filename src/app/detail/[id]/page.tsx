"use client";

import { ArrowLeft, MoreHorizontal, Copy, Pencil, Bookmark, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockItems, mockCollections } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";
import Tag from "@/components/ui/Tag";
import BottomSheet from "@/components/ui/BottomSheet";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ImageViewer from "@/components/ui/ImageViewer";
import Link from "next/link";
import { useState } from "react";

export default function DetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { show } = useToast();
  const item = mockItems.find((i) => i.id === id) || mockItems[0];

  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    show("복사 완료", "copy");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: item.content });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(item.content);
      show("링크가 복사되었어요", "copy");
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    show("삭제되었어요", "success");
    setTimeout(() => router.push("/"), 600);
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <button className="p-1.5 text-text-muted">
          <MoreHorizontal size={22} strokeWidth={1.5} />
        </button>
      </header>

      {/* Badge */}
      <div className="px-5 mb-4">
        <span className="text-[12px] font-semibold text-brand-purple bg-surface-section px-3 py-1 rounded-md">
          {item.content_type === "text" ? "텍스트" : item.content_type === "image" ? "이미지" : "혼합"}
        </span>
      </div>

      {/* Content */}
      <section className="px-5 mb-6">
        <h1 className="text-[24px] font-bold text-text-primary leading-[1.4] whitespace-pre-line">
          {item.content}
        </h1>
      </section>

      {/* Image */}
      {item.image_url && (
        <section className="px-5 mb-6">
          <button onClick={() => setShowImageViewer(true)} className="w-full rounded-2xl overflow-hidden">
            <img src={item.image_url} alt="" className="w-full h-auto" />
          </button>
        </section>
      )}

      {/* Category */}
      <section className="px-5 mb-5">
        <p className="text-[13px] text-text-muted mb-2">카테고리</p>
        <span className="text-[15px] font-semibold text-text-primary">{item.category}</span>
      </section>

      {/* Tags */}
      <section className="px-5 mb-5">
        <p className="text-[13px] text-text-muted mb-2.5">태그</p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => <Tag key={tag} label={tag} />)}
          <Link href={`/detail/${id}/edit`} className="inline-flex items-center text-[13px] text-text-muted border border-border-light rounded-md px-2.5 py-1">+</Link>
        </div>
      </section>

      {/* Memo */}
      <section className="px-5 mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[13px] text-text-muted">추가 메모</p>
          <Link href={`/detail/${id}/edit`} className="text-[13px] text-text-muted">수정</Link>
        </div>
        <p className="text-[14px] text-text-secondary leading-relaxed">
          문구가 마음에 들어서 저장함.<br />블로그 글에 넣으면 좋을 듯.
        </p>
      </section>

      {/* Copy Button */}
      <section className="px-5 mb-5">
        <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 bg-text-primary text-white rounded-xl py-4 text-[15px] font-semibold active:scale-[0.98] transition-transform">
          <Copy size={18} strokeWidth={2} />
          복사하기
        </button>
      </section>

      {/* Actions */}
      <section className="px-5">
        <div className="flex items-center justify-around py-3 border-t border-border-light">
          <Link href={`/detail/${id}/edit`} className="flex flex-col items-center gap-1.5 py-2">
            <Pencil size={20} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[11px] text-text-muted">수정</span>
          </Link>
          <button onClick={() => setShowCollectionSheet(true)} className="flex flex-col items-center gap-1.5 py-2">
            <Bookmark size={20} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[11px] text-text-muted">컬렉션에 추가</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-1.5 py-2">
            <Share2 size={20} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[11px] text-text-muted">공유</span>
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="flex flex-col items-center gap-1.5 py-2">
            <Trash2 size={20} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[11px] text-text-muted">삭제</span>
          </button>
        </div>
      </section>

      {/* Collection Bottom Sheet */}
      <BottomSheet open={showCollectionSheet} onClose={() => setShowCollectionSheet(false)} title="컬렉션에 추가">
        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
          {mockCollections.filter((c) => c.name !== "휴지통").map((col) => (
            <button key={col.id} onClick={() => { setShowCollectionSheet(false); show(`'${col.name}'에 추가되었어요`, "success"); }}
              className="w-full flex items-center gap-3.5 py-3.5 px-1 rounded-lg active:bg-surface-soft transition-colors">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: col.color + "25" }}>
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: col.color }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] text-text-primary font-medium">{col.name}</p>
                <p className="text-[12px] text-text-muted">{col.item_count}개</p>
              </div>
            </button>
          ))}
        </div>
        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-border rounded-xl text-[14px] text-text-secondary font-semibold">
          + 새 컬렉션 만들기
        </button>
      </BottomSheet>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="아이템 삭제"
        message="이 아이템을 삭제하시겠어요? 삭제된 아이템은 휴지통으로 이동합니다."
        confirmLabel="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Image Viewer */}
      {item.image_url && (
        <ImageViewer src={item.image_url} open={showImageViewer} onClose={() => setShowImageViewer(false)} />
      )}
    </div>
  );
}
