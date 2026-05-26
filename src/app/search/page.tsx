"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, X, Copy, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  copy_count: number;
  created_at: string;
  summary: string | null;
};

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "text", label: "텍스트" },
  { id: "image", label: "이미지" },
];

export default function SearchPage() {
  const router = useRouter();
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const { data } = await supabase
      .from("items")
      .select("id, original_content, content_type, category, copy_count, created_at, summary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    setAllItems(data ?? []);
    setLoading(false);
  };

  const filtered = allItems
    .filter(i => activeFilter === "all" || i.content_type === activeFilter)
    .filter(i => !query.trim() ||
      i.original_content.toLowerCase().includes(query.toLowerCase()) ||
      i.category?.toLowerCase().includes(query.toLowerCase()) ||
      i.summary?.toLowerCase().includes(query.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    setShowDeleteConfirm(false);
    const ids = Array.from(selected);
    await supabase.from("items").delete().in("id", ids);
    setAllItems(prev => prev.filter(i => !selected.has(i.id)));
    setSelected(new Set());
    setSelectMode(false);
    show(`${ids.length}개 삭제되었어요`, "success");
  };

  const handleCopy = (e: React.MouseEvent, content: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    show("복사 완료", "copy");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-4 pt-14 pb-3 flex items-center gap-2">
        <button onClick={() => { router.back(); }} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-3.5 py-2.5">
          <Search size={18} className="text-text-muted flex-shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-text-primary outline-none placeholder:text-text-placeholder"
            placeholder="검색어를 입력하세요"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-text-muted">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => { setSelectMode(v => !v); setSelected(new Set()); }}
          className={`text-[13px] font-semibold px-2 py-1.5 ${selectMode ? "text-brand-purple" : "text-text-muted"}`}
        >
          {selectMode ? "취소" : "선택"}
        </button>
      </header>

      <div className="px-5 border-b border-border-light">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
                activeFilter === f.id
                  ? "text-text-primary border-text-primary"
                  : "text-text-muted border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center pt-20">
          <Loader2 size={24} className="animate-spin text-brand-purple" />
        </div>
      ) : (
        <>
          <div className="px-5 py-3">
            <h3 className="text-[15px] font-bold text-text-primary">
              {query.trim() ? `검색 결과 ${filtered.length}개` : `전체 ${filtered.length}개`}
            </h3>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-8">
              <p className="text-[15px] text-text-muted">
                {query.trim() ? `"${query}" 검색 결과가 없어요` : "저장된 아이템이 없어요"}
              </p>
            </div>
          ) : (
            <div className="px-5 space-y-3 pb-6">
              {filtered.map((item) => {
                const isSelected = selected.has(item.id);
                return selectMode ? (
                  <button
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`w-full text-left border rounded-2xl p-4 transition-colors ${
                      isSelected ? "border-brand-purple bg-purple-50" : "border-border bg-white"
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected ? "border-brand-purple bg-brand-purple" : "border-border"
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-text-primary font-medium leading-[1.6] line-clamp-2">{item.original_content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {item.category && (
                            <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">{item.category}</span>
                          )}
                          <span className="text-[11px] text-text-muted">{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link key={item.id} href={`/detail/${item.id}`}>
                    <div className="bg-white border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform">
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] text-text-primary font-medium leading-[1.6] line-clamp-3">{item.original_content}</p>
                          <div className="flex items-center gap-2 mt-2.5">
                            {item.category && (
                              <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">{item.category}</span>
                            )}
                            <span className="text-[11px] text-text-muted">{item.content_type === "text" ? "텍스트" : "이미지"}</span>
                            <span className="text-[11px] text-text-muted">{formatDate(item.created_at)}</span>
                          </div>
                        </div>
                        <button className="p-1 text-text-muted self-start flex-shrink-0" onClick={(e) => handleCopy(e, item.original_content)}>
                          <Copy size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-56 bg-white border-t border-border px-5 py-4 flex items-center justify-between">
          <span className="text-[14px] font-semibold text-text-primary">{selected.size}개 선택됨</span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold"
          >
            <Trash2 size={16} />
            삭제
          </button>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="선택 항목 삭제"
        message={`선택한 ${selected.size}개 아이템을 삭제할까요?`}
        confirmLabel="삭제"
        danger
        onConfirm={handleDeleteSelected}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
