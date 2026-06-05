"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, Search, ChevronRight, TrendingUp, X, FileText, Image as ImageIcon, Link2, Loader2, Clock } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { PROFILE_ICON_STORAGE_KEY, getProfileIcon } from "@/lib/profile-icons";
import { getUnreadCount } from "@/lib/notifications";
import type { Item } from "@/lib/types";
import { searchArchive, type SearchMode } from "@/lib/search";
import { getMemory, type Memory } from "@/lib/memories";
import { useItems } from "@/lib/hooks";

export default function HomePage() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  // items는 SWR로 통일 (네비게이션 간 캐시 + 삭제 후 자동 갱신).
  const { items: allItems, isLoading: loading } = useItems();
  const [profileIconId, setProfileIconId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [memory, setMemory] = useState<Memory | null>(null);

  useEffect(() => {
    setProfileIconId(localStorage.getItem(PROFILE_ICON_STORAGE_KEY));
  }, []);

  // memory/unreadCount는 items SWR와 분리해 유저 확보 후 한 번 가져온다.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;
      getUnreadCount(user.id).then((c) => { if (!cancelled) setUnreadCount(c); });
      getMemory(user.id).then((m) => { if (!cancelled) setMemory(m); });
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchMode(null);
      setSearching(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      const { items, mode } = await searchArchive(trimmed, allItems);
      if (cancelled) return;
      setSearchResults(items);
      setSearchMode(mode);
      setSearching(false);
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, allItems]);

  const profileIcon = getProfileIcon(profileIconId);

  const recentItems = useMemo(() => allItems.slice(0, 3), [allItems]);
  const frequentItems = useMemo(
    () => [...allItems].sort((a, b) => b.copy_count - a.copy_count).slice(0, 3),
    [allItems]
  );

  const handleCopy = async (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    e.stopPropagation();
    const text = item.content_type === "link" ? item.original_content.split("\n")[0] : item.original_content;
    try {
      await navigator.clipboard.writeText(text);
      show("복사 완료", "copy");
    } catch {
      show("복사에 실패했어요", "error");
    }
  };

  const getDisplayText = (item: Item) => {
    if (item.content_type === "image") return item.summary ?? "이미지";
    if (item.content_type === "link") {
      const lines = item.original_content.split("\n");
      return lines[1] || lines[0];
    }
    // AI 요약이 있으면 긴 원문 대신 한 줄 요약을 카드 제목으로 (가독성)
    return item.summary ?? item.original_content;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }).replace(". ", ".").replace(".", "");
  };

  const getTypeLabel = (type: string) => {
    if (type === "mixed") return "텍스트+이미지";
    if (type === "image") return "이미지";
    if (type === "link") return "링크";
    return "텍스트";
  };

  const getTypeIcon = (type: string) => {
    if (type === "image") return ImageIcon;
    if (type === "link") return Link2;
    return FileText;
  };

  const canPreviewImage = (content: string) =>
    /^data:image\//.test(content) || /^https?:\/\/.+\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(content);

  const ItemCard = ({ item, variant = "default" }: { item: Item; variant?: "default" | "soft" }) => (
    <Link href={`/detail/${item.id}`} className="block">
      {/* card-hover: 터치 기기에서 ghost hover 잔상 차단 (globals.css @media hover:none) */}
      {/* transition 한정: transform/box-shadow/border-color만 합성 레이어에서 처리, layout 유발 속성 제외 */}
      <div className={`card-hover ${variant === "soft" ? "bg-surface-soft border-border-light hover:border-brand-purple/30" : "bg-surface border-border hover:border-brand-purple/35"} border rounded-2xl px-4 py-5 shadow-card transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0 active:scale-[0.98]`}>
        <div className="flex gap-3.5">
          {item.content_type === "image" && canPreviewImage(item.original_content) ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-section border border-border-light">
              <img src={item.original_content} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-surface-section border border-border-light text-brand-purple">
              {(() => {
                const TypeIcon = getTypeIcon(item.content_type);
                return <TypeIcon size={20} strokeWidth={1.8} />;
              })()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-text-primary font-semibold leading-[1.55] line-clamp-2">
              {getDisplayText(item)}
            </p>
            <div className="flex items-center gap-2.5 mt-2.5">
              {item.category && (
                <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">{item.category}</span>
              )}
              <span className="text-[12px] text-text-secondary/70">{formatDate(item.created_at)}</span>
              <span className="text-[12px] text-text-secondary/45 px-0.5">·</span>
              <span className="text-[12px] text-text-secondary/70">{getTypeLabel(item.content_type)}</span>
            </div>
          </div>
          <CopyButton onCopy={(e) => handleCopy(e, item)} />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-44 -top-52 h-[560px] w-[560px] rounded-full transition-colors"
          style={{ background: "radial-gradient(closest-side, var(--profile-accent) 0%, transparent 72%)", opacity: 0.16 }}
        />
        <div
          className="absolute -left-24 -top-28 h-[320px] w-[320px] rounded-full transition-colors"
          style={{ background: "radial-gradient(closest-side, var(--profile-accent) 0%, transparent 70%)", opacity: 0.14 }}
        />
        <div
          className="absolute -left-16 top-24 h-[260px] w-[260px] rounded-full blur-2xl transition-colors"
          style={{ background: "radial-gradient(closest-side, var(--profile-accent) 0%, transparent 75%)", opacity: 0.08 }}
        />
      </div>
      <header className="relative z-10 px-5 pt-14 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo-192.webp" alt="Loom" width={32} height={32} className="object-contain" />
          <span className="text-[20px] font-semibold text-text-primary tracking-tight">Loom</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/notifications" className="p-2 text-text-muted relative focus-ring rounded-lg">
            <Bell size={22} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-brand-purple text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/settings/account" className="focus-ring rounded-full">
            <div className="relative w-8 h-8 rounded-full bg-surface-section overflow-hidden flex items-center justify-center">
              <Image src={profileIcon.image} alt="" fill sizes="32px" className="object-cover scale-[1.08] translate-y-[1px]" />
            </div>
          </Link>
        </div>
      </header>

      <section className="relative z-10 px-5 pt-3 pb-7">
        <h1 className="text-[35px] font-bold text-text-primary leading-[1.12]">기억을 검색해보세요</h1>
        <p className="text-[15px] text-text-secondary mt-3 leading-[1.6]">자연어로 검색하면, 관련된 기억을<br />빠르게 찾아드려요</p>
      </section>

      <section className="relative z-10 px-5 mb-7">
        <div
          className="flex min-h-[64px] items-center gap-3.5 bg-surface/60 backdrop-blur-md rounded-2xl px-5 py-4 shadow-elevated transition-all focus-within:shadow-[0_8px_24px_var(--profile-glow)]"
          style={{ border: "1.5px solid var(--profile-accent)" }}
        >
          <Search size={21} className="flex-shrink-0 transition-colors" strokeWidth={1.8} style={{ color: "var(--profile-accent)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="그때 저장했던 릴스 뭐였지?"
            className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-muted outline-none"
          />
          {query && (
            <button aria-label="검색어 지우기" onClick={() => setQuery("")} className="text-text-muted flex-shrink-0 focus-ring rounded">
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {query.trim() ? (
        <section className="relative z-10 px-5 pb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-text-muted">검색 결과 {searching ? "..." : `${searchResults.length}개`}</p>
            {query.trim() && (
              <span className="text-[12px] font-semibold text-brand-purple">
                {searching ? "AI 검색 중..." : searchMode === "ai" ? "AI 검색" : searchMode === "server" ? "전체 검색" : "기본 검색"}
              </span>
            )}
          </div>
          {searching ? (
            <div className="flex justify-center pt-8">
              <Loader2 size={24} className="animate-spin text-brand-purple" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              {/* key에 query 포함 → 쿼리 변경 시 stagger 재트리거 */}
              {searchResults.map((item, i) => (
                <div key={`${query}-${item.id}`} className="stagger-item" style={{ animationDelay: `${i * 25}ms` }}>
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[15px] text-text-muted">검색 결과가 없어요</p>
              <p className="text-[13px] text-text-placeholder mt-1">다른 키워드로 검색해보세요</p>
            </div>
          )}
        </section>
      ) : loading ? (
        <div className="relative z-10 flex justify-center pt-20">
          <Loader2 size={24} className="animate-spin text-brand-purple" />
        </div>
      ) : allItems.length === 0 ? (
        <div className="relative z-10 text-center py-20 px-8">
          <p className="text-[18px] font-bold text-text-primary mb-2">아직 저장된 항목이 없어요</p>
          <p className="text-[14px] text-text-muted mb-8">아래 + 버튼을 눌러 첫 번째 기억을 저장해보세요</p>
          <Link href="/save" className="inline-flex items-center gap-2 btn-accent px-6 py-3 rounded-xl text-[14px] font-semibold">
            저장하러 가기
          </Link>
        </div>
      ) : (
        <>
          {memory && (
            <section className="relative z-10 px-5 mb-8">
              <div
                className="rounded-2xl border backdrop-blur-md p-4 shadow-elevated"
                style={{
                  background: "color-mix(in srgb, var(--profile-accent) 11%, transparent)",
                  borderColor: "color-mix(in srgb, var(--profile-accent) 26%, transparent)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--profile-accent)", color: "var(--profile-on-accent)" }}>
                    <Clock size={15} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-text-primary leading-tight">{memory.label}</p>
                    <p className="text-[12px] text-text-secondary/80 leading-tight">그때 저장한 기억이에요</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {memory.items.map((item) => <ItemCard key={item.id} item={item} variant="soft" />)}
                </div>
              </div>
            </section>
          )}

          <section className="relative z-10 px-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-text-primary">최근 저장</h2>
              <Link href="/search" className="flex items-center text-[13px] text-text-muted">전체보기 <ChevronRight size={14} /></Link>
            </div>
            <div className="space-y-3">
              {recentItems.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </section>

          {frequentItems.some(i => i.copy_count > 0) && (
            <section className="relative z-10 px-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[17px] font-bold text-text-primary">자주 복사</h2>
                  <TrendingUp size={16} className="text-brand-purple" />
                </div>
                <Link href="/search" className="flex items-center text-[13px] text-text-muted">전체보기 <ChevronRight size={14} /></Link>
              </div>
              <div className="space-y-3">
                {frequentItems.filter(i => i.copy_count > 0).map((item) => <ItemCard key={item.id} item={item} variant="soft" />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
