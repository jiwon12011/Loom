"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Pencil, Bookmark, Share2, Trash2, Loader2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import Tag from "@/components/ui/Tag";
import BottomSheet from "@/components/ui/BottomSheet";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Link from "next/link";
import Image from "next/image";
import { getFolderByDescription } from "@/lib/folders";

type Item = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  tags: string[];
  copy_count: number;
  created_at: string;
  summary: string | null;
};

type ItemImage = {
  id: string;
  image_url: string;
  display_order: number;
};

export default function DetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { show } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [collections, setCollections] = useState<{id: string; name: string; item_count: number; description: string | null}[]>([]);
  const [referenceImages, setReferenceImages] = useState<ItemImage[]>([]);

  useEffect(() => {
    const fetchItem = async () => {
      const [{ data, error }, { data: images }] = await Promise.all([
        supabase
          .from("items")
          .select("id, original_content, content_type, category, tags, copy_count, created_at, summary")
          .eq("id", id)
          .single(),
        supabase
          .from("item_images")
          .select("id, image_url, display_order")
          .eq("item_id", id)
          .order("display_order", { ascending: true }),
      ]);

      if (error || !data) {
        router.replace("/");
      } else {
        setItem(data);
        setReferenceImages(images ?? []);
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  const getCopyText = () => {
    if (!item) return "";
    if (item.content_type === "link") return item.original_content.split("\n")[0];
    return item.original_content;
  };

  const handleCopy = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(getCopyText());
      show("복사 완료", "copy");
    } catch {
      show("복사에 실패했어요", "error");
      return;
    }
    await supabase.from("items").update({
      copy_count: item.copy_count + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", id);
    setItem(prev => prev ? { ...prev, copy_count: prev.copy_count + 1 } : prev);
  };

  const handleShare = async () => {
    if (!item) return;
    const text = getCopyText();
    if (navigator.share) {
      try { await navigator.share({ text }); }
      catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        show("복사되었어요", "copy");
      } catch {
        show("공유에 실패했어요", "error");
      }
    }
  };

  const openCollectionSheet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("collections").select("id, name, item_count, description").eq("user_id", user.id).order("created_at", { ascending: false });

    const collectionsWithCounts = await Promise.all((data ?? []).map(async (collection) => {
      const { count } = await supabase
        .from("collection_items")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", collection.id);

      return {
        ...collection,
        item_count: count ?? collection.item_count ?? 0,
      };
    }));

    setCollections(collectionsWithCounts);
    setShowCollectionSheet(true);
  };

  const handleAddToCollection = async (collectionId: string, collectionName: string) => {
    const { error } = await supabase.from("collection_items").insert({ collection_id: collectionId, item_id: id });
    setShowCollectionSheet(false);
    if (error?.code === "23505") {
      show("이미 추가된 컬렉션이에요", "error");
    } else if (error) {
      show("추가 실패. 다시 시도해주세요.", "error");
    } else {
      show(`'${collectionName}'에 추가되었어요`, "success");
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await supabase.from("items").delete().eq("id", id);
    show("삭제되었어요", "success");
    setTimeout(() => router.push("/"), 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!item) return null;

  const isLink = item.content_type === "link";
  const linkUrl = isLink ? item.original_content.split("\n")[0] : null;
  const linkTitle = isLink ? item.original_content.split("\n")[1] || null : null;
  const linkDesc = isLink
    ? item.original_content.split("\n").slice(2).filter(l => !l.startsWith("[메모]")).join("\n") || null
    : null;
  const linkMemo = isLink
    ? item.original_content.split("\n").find(l => l.startsWith("[메모]"))?.replace("[메모] ", "") || null
    : null;
  const getTypeLabel = (type: string) => {
    if (type === "mixed") return "텍스트+이미지";
    if (type === "image") return "이미지";
    if (type === "link") return "링크";
    return "텍스트";
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2.5 -ml-1 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <span className="text-[12px] font-semibold text-brand-purple bg-surface-section px-3 py-1 rounded-md">
          {getTypeLabel(item.content_type)}
        </span>
      </header>

      <section className="px-5 mb-6">
        {item.content_type === "image" ? (
          <img src={item.original_content} alt="저장된 이미지" className="w-full rounded-2xl object-contain max-h-96" />
        ) : isLink && linkUrl ? (
          <div>
            <h1 className="text-[22px] font-bold text-text-primary leading-[1.5]">
              {linkTitle || linkUrl}
            </h1>
            {linkDesc && (
              <p className="text-[15px] text-text-secondary mt-2 leading-relaxed">{linkDesc}</p>
            )}
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[14px] text-brand-purple font-semibold"
            >
              <ExternalLink size={15} strokeWidth={1.5} />
              링크 열기
            </a>
            {linkMemo && (
              <div className="mt-4 bg-surface-soft rounded-xl px-4 py-3">
                <p className="text-[12px] text-text-muted mb-1">메모</p>
                <p className="text-[14px] text-text-primary leading-relaxed">{linkMemo}</p>
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-[22px] font-bold text-text-primary leading-[1.5] whitespace-pre-line">
            {item.original_content}
          </h1>
        )}
      </section>

      {referenceImages.length > 0 && item.content_type !== "image" && (
        <section className="px-5 mb-6">
          <p className="text-[13px] text-text-muted mb-2.5">참고 이미지</p>
          <div className="space-y-3">
            {referenceImages.map((image) => (
              <img
                key={image.id}
                src={image.image_url}
                alt="참고 이미지"
                className="w-full rounded-2xl border border-border-light object-contain max-h-96 bg-surface-soft"
              />
            ))}
          </div>
        </section>
      )}

      {item.category && (
        <section className="px-5 mb-5">
          <p className="text-[13px] text-text-muted mb-2">카테고리</p>
          <span className="text-[15px] font-semibold text-text-primary">{item.category}</span>
        </section>
      )}

      {item.tags?.length > 0 && (
        <section className="px-5 mb-5">
          <p className="text-[13px] text-text-muted mb-2.5">태그</p>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
        </section>
      )}

      {item.summary && (
        <section className="px-5 mb-6">
          <p className="text-[13px] text-text-muted mb-2">AI 요약</p>
          <p className="text-[14px] text-text-secondary leading-relaxed">{item.summary}</p>
        </section>
      )}

      <section className="px-5 mb-4">
        <p className="text-[12px] text-text-muted">
          저장일 {new Date(item.created_at).toLocaleDateString("ko-KR")} · 복사 {item.copy_count}회
        </p>
      </section>

      <section className="px-5 mb-5">
        <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 text-white rounded-xl py-4 text-[15px] font-semibold active:scale-[0.98] transition-transform" style={{ backgroundColor: "var(--profile-accent)" }}>
          <Copy size={18} strokeWidth={2} />
          복사하기
        </button>
      </section>

      <section className="px-5">
        <div className="flex items-center justify-around py-3 border-t border-border-light">
          <Link href={`/detail/${id}/edit`} className="flex flex-col items-center gap-1.5 py-2">
            <Pencil size={20} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[11px] text-text-muted">수정</span>
          </Link>
          <button onClick={openCollectionSheet} className="flex flex-col items-center gap-1.5 py-2">
            <Bookmark size={20} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[11px] text-text-muted">컬렉션</span>
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

      <BottomSheet open={showCollectionSheet} onClose={() => setShowCollectionSheet(false)} title="컬렉션에 추가">
        {collections.length === 0 ? (
          <p className="text-[14px] text-text-muted text-center py-4">컬렉션이 없어요. 먼저 컬렉션을 만들어주세요.</p>
        ) : (
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {collections.map((col, index) => {
              const folder = getFolderByDescription(col.description, index);
              return (
                <button key={col.id} onClick={() => handleAddToCollection(col.id, col.name)}
                  className="w-full flex items-center gap-3.5 py-3.5 px-1 rounded-lg active:bg-surface-soft transition-colors">
                  <span className="relative h-10 w-12 flex-shrink-0">
                    <Image src={folder.image} alt="" fill sizes="48px" className="object-contain" />
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-[15px] text-text-primary font-medium">{col.name}</p>
                    <p className="text-[12px] text-text-muted">{col.item_count}개</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="아이템 삭제"
        message="이 아이템을 삭제할까요?"
        confirmLabel="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

