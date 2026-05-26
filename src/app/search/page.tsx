"use client";

import { useState } from "react";
import { ArrowLeft, Search, X, SlidersHorizontal, Star, Copy } from "lucide-react";
import { mockItems } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const filters = [
  { id: "all", label: "전체", count: 128 },
  { id: "text", label: "텍스트", count: 96 },
  { id: "image", label: "이미지", count: 21 },
  { id: "link", label: "링크", count: 11 },
];

export default function SearchPage() {
  const router = useRouter();
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [submitted, setSubmitted] = useState(false);

  const results = submitted ? mockItems : [];

  const handleSearch = () => {
    if (query.trim()) setSubmitted(true);
  };

  const handleCopy = (e: React.MouseEvent, content: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    show("복사 완료", "copy");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
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
            <button onClick={() => { setQuery(""); setSubmitted(false); }} className="text-text-muted">
              <X size={16} />
            </button>
          )}
        </div>
        <button className="p-1.5 text-text-muted">
          <SlidersHorizontal size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* Filter Tabs */}
      {submitted && (
        <div className="px-5 border-b border-border-light">
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
                  activeFilter === f.id
                    ? "text-text-primary border-text-primary"
                    : "text-text-muted border-transparent"
                }`}
              >
                {f.label} {f.count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - Before Search */}
      {!submitted && (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <div className="text-[48px] mb-4">🔍</div>
          <h3 className="text-[17px] font-bold text-text-primary mb-2">기억을 찾아보세요</h3>
          <p className="text-[14px] text-text-muted leading-relaxed">
            자연어로 검색하면 관련된 내용을
            <br />
            AI가 빠르게 찾아줍니다.
          </p>
          <div className="mt-8 space-y-2 w-full">
            <p className="text-[12px] text-text-muted font-medium mb-3">추천 검색어</p>
            {["감성적인 카피 문구", "디자인 영감", "릴스 훅 아이디어"].map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); setSubmitted(true); }}
                className="w-full text-left px-4 py-3 bg-surface-soft rounded-xl text-[14px] text-text-secondary active:bg-surface-section transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && (
        <>
          <div className="px-5 py-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-text-primary">검색 결과</h3>
            <button className="text-[13px] text-text-muted">최신순 ▾</button>
          </div>
          <div className="px-5 space-y-3 pb-6">
            {results.map((item) => (
              <Link key={item.id} href={`/detail/${item.id}`}>
                <div className="bg-white border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform mb-3">
                  <div className="flex gap-3">
                    {item.image_url && (
                      <div className="w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0 bg-surface-soft">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-text-primary font-medium leading-[1.6] line-clamp-3">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        {item.content_type === "image" && (
                          <span className="text-[11px] text-text-muted">이미지</span>
                        )}
                        <span className="text-[11px] text-text-muted">{item.created_at}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-0.5">
                      <button className="p-1 text-text-muted">
                        <Star size={16} strokeWidth={1.5} />
                      </button>
                      <button className="p-1 text-text-muted" onClick={(e) => handleCopy(e, item.content)}>
                        <Copy size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
