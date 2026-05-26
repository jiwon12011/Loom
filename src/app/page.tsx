"use client";

import { Bell, Search, Copy, ChevronRight, TrendingUp } from "lucide-react";
import { mockItems, categories } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function HomePage() {
  const { show } = useToast();

  const recentItems = mockItems.slice(0, 3);
  const frequentItems = [...mockItems].sort((a, b) => b.copy_count - a.copy_count).slice(0, 3);

  const handleCopy = (e: React.MouseEvent, content: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    show("복사 완료", "copy");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="p-2 text-text-muted relative">
            <Bell size={22} strokeWidth={1.5} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-purple rounded-full" />
          </Link>
          <Link href="/settings/account">
            <div className="w-8 h-8 rounded-full bg-surface-section flex items-center justify-center">
              <span className="text-[12px] font-bold text-text-muted">U</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Title */}
      <section className="px-5 pt-2 pb-6">
        <h1 className="text-[26px] font-bold text-text-primary leading-tight">기억을 검색해보세요</h1>
        <p className="text-[14px] text-text-muted mt-1.5">자연어로 검색하면, 관련된 기억을<br />빠르게 찾아드려요</p>
      </section>

      {/* Search Bar */}
      <section className="px-5 mb-8">
        <Link href="/search">
          <div className="flex items-center gap-3 bg-surface-soft border border-border rounded-xl px-4 py-3.5">
            <span className="text-[14px] text-text-placeholder flex-1">예) 감성적인 카피 문구</span>
            <Search size={20} className="text-text-muted" strokeWidth={1.5} />
          </div>
        </Link>
      </section>

      {/* Recent */}
      {(
        <>
          <section className="px-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-text-primary">최근 복사</h2>
              <Link href="/search" className="flex items-center text-[13px] text-text-muted">전체보기 <ChevronRight size={14} /></Link>
            </div>
            <div className="space-y-4">
              {recentItems.map((item) => (
                <Link key={item.id} href={`/detail/${item.id}`}>
                  <div className="bg-white border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform">
                    <div className="flex gap-3">
                      {item.image_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-soft">
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-text-primary font-medium leading-relaxed line-clamp-2">{item.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-text-muted">{item.created_at}</span>
                          <span className="text-[11px] text-text-muted">·</span>
                          <span className="text-[11px] text-text-muted">{item.content_type === "text" ? "텍스트" : "이미지"}</span>
                        </div>
                      </div>
                      <button className="p-2 text-text-muted hover:text-text-primary flex-shrink-0 self-start" onClick={(e) => handleCopy(e, item.content)}>
                        <Copy size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Frequent */}
          <section className="px-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-text-primary">자주 복사</h2>
                <TrendingUp size={16} className="text-brand-purple" />
              </div>
              <Link href="/search" className="flex items-center text-[13px] text-text-muted">전체보기 <ChevronRight size={14} /></Link>
            </div>
            <div className="space-y-4">
              {frequentItems.map((item) => (
                <Link key={item.id} href={`/detail/${item.id}`}>
                  <div className="bg-surface-soft border border-border-light rounded-2xl p-4 active:scale-[0.98] transition-transform">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-text-primary font-medium leading-relaxed line-clamp-2">{item.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-semibold text-brand-purple bg-white px-1.5 py-0.5 rounded">{item.category}</span>
                          <span className="text-[11px] text-text-muted">복사 {item.copy_count}회</span>
                        </div>
                      </div>
                      <button className="p-2 text-text-muted hover:text-text-primary flex-shrink-0 self-start" onClick={(e) => handleCopy(e, item.content)}>
                        <Copy size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="px-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-text-primary">카테고리</h2>
              <Link href="/settings/categories" className="flex items-center text-[13px] text-text-muted">전체보기 <ChevronRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {categories.map((cat) => (
                <Link key={cat.name} href={`/search?category=${cat.name}`}>
                  <div className="bg-surface-soft border border-border-light rounded-xl p-3.5 text-center active:scale-[0.97] transition-transform">
                    <p className="text-[14px] font-semibold text-text-primary">{cat.name}</p>
                    <p className="text-[12px] text-text-muted mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
