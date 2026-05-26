"use client";

import { useState } from "react";
import { ArrowLeft, Search, X, SlidersHorizontal, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  copy_count: number;
  created_at: string;
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
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

    let queryBuilder = supabase
      .from("items")
      .select("id, original_content, content_type, category, copy_count, created_at")
      .eq("user_id", user.id)
      .ilike("original_content", `%${q.trim()}%`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (activeFilter !== "all") {
      queryBuilder = queryBuilder.eq("content_type", activeFilter);
    }

    const { data } = await queryBuilder;
    setResults(data ?? []);
    setLoading(false);
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

  const filtered = activeFilter === "all" ? results : results.filter(i => i.content_type === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-3.5 py-2.5">
          <Search size={18} className="text-text-muted flex-shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-transparent text-[14px] text-text-primary outline-none placeholder:text-text-placeholder"
            placeholder="검색어를 입력하세요"
            autoFocus
          />
          {query && (
            <button onClick={() => { setQuery(""); setSearched(false); setResults([]); }} className="text-text-muted">
              <X size={16} />
            </button>
          )}
        </div>
        <button className="p-1.5 text-text-muted">
          <SlidersHorizontal size={20} strokeWidth={1.5} />
        </button>
      </header>

      {searched && (
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
      )}

      {!searched ? (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <div className="text-[48px] mb-4">🔍</div>
          <h3 className="text-[17px] font-bold text-text-primary mb-2">기억을 찾아보세요</h3>
          <p className="text-[14px] text-text-muted leading-relaxed">저장한 내용을 키워드로 검색해요</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center pt-20">
          <Loader2 size={24} className="animate-spin text-brand-purple" />
        </div>
      ) : (
        <>
          <div className="px-5 py-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-text-primary">검색 결과 {filtered.length}개</h3>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-8">
              <p className="text-[15px] text-text-muted">"{query}" 검색 결과가 없어요</p>
              <p className="text-[13px] text-text-placeholder mt-1">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="px-5 space-y-4 pb-6">
              {filtered.map((item) => (
                <Link key={item.id} href={`/detail/${item.id}`}>
                  <div className="bg-white border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-text-primary font-medium leading-[1.6] line-clamp-3">
                          {item.original_content}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          {item.category && (
                            <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">
                              {item.category}
                            </span>
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
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
