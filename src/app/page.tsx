"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Copy, ChevronRight, TrendingUp, X, FileText, Image as ImageIcon, Link2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { PROFILE_ICON_STORAGE_KEY, getProfileIcon } from "@/lib/profile-icons";
import { getUnreadCount } from "@/lib/notifications";

type Item = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  copy_count: number;
  created_at: string;
  summary: string | null;
};

export default function HomePage() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileIconId, setProfileIconId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [aiResultIds, setAiResultIds] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<"ai" | "local" | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setProfileIconId(localStorage.getItem(PROFILE_ICON_STORAGE_KEY));
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("items")
        .select("id, original_content, content_type, category, copy_count, created_at, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      setAllItems(data ?? []);
      setLoading(false);

      getUnreadCount(user.id).then(setUnreadCount);
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setAiResultIds([]);
      setSearchMode(null);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            items: allItems.map(({ id, original_content, content_type, category, summary }) => ({
              id, original_content, content_type, category, summary,
            })),
          }),
        });
        const json = await res.json();
        setAiResultIds(Array.isArray(json.ids) ? json.ids : []);
        setSearchMode(json.mode === "ai" ? "ai" : "local");
      } catch {
        setAiResultIds([]);
        setSearchMode("local");
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, allItems]);

  const profileIcon = getProfileIcon(profileIconId);

  const recentItems = allItems.slice(0, 3);
  const frequentItems = [...allItems].sort((a, b) => b.copy_count - a.copy_count).slice(0, 3);

  const locallyFiltered = allItems.filter(i =>
    i.original_content.toLowerCase().includes(query.toLowerCase()) ||
    i.category?.toLowerCase().includes(query.toLowerCase()) ||
    i.summary?.toLowerCase().includes(query.toLowerCase())
  );

  const aiRanked = aiResultIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is Item => Boolean(item));

  const searchResults = query.trim()
    ? (aiResultIds.length > 0 ? aiRanked : locallyFiltered)
    : [];

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
    return item.original_content;
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
      <div className={`${variant === "soft" ? "bg-surface-soft border-border-light hover:border-brand-purple/30" : "bg-surface border-border hover:border-brand-purple/35"} border rounded-2xl px-4 py-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0 active:scale-[0.98]`}>
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
            <div className="flex items-center gap-2.5 mt-3">
              {item.category && (
                <span className="text-[11px] font-semibold text-brand-purple bg-surface px-2 py-0.5 rounded">{item.category}</span>
              )}
              <span className="text-[12px] text-text-secondary/70">{formatDate(item.created_at)}</span>
              <span className="text-[12px] text-text-secondary/45 px-0.5">·</span>
              <span className="text-[12px] text-text-secondary/70">{getTypeLabel(item.content_type)}</span>
            </div>
          </div>
          <button className="p-2.5 flex-shrink-0 self-start transition-opacity hover:opacity-60" onClick={(e) => handleCopy(e, item)} style={{ color: "var(--profile-accent)" }}>
            <Copy size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full transition-colors"
          style={{ background: "radial-gradient(closest-side, var(--profile-accent) 74%, transparent 90%)", opacity: 0.14 }}
        />
        <div
          className="absolute -left-24 -top-32 h-[340px] w-[340px] rounded-full transition-colors"
          style={{ background: "radial-gradient(closest-side, var(--profile-accent) 76%, transparent 92%)", opacity: 0.16 }}
        />
      </div>
      <header className="relative z-10 px-5 pt-14 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Loom" width={32} height={32} className="object-contain" />
          <span className="text-[20px] font-semibold text-text-primary tracking-tight">Loom</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/notifications" className="p-2 text-text-muted relative">
            <Bell size={22} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-brand-purple text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/settings/account">
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
          className="flex min-h-[64px] items-center gap-3.5 bg-surface-section rounded-2xl px-5 py-4 shadow-elevated transition-all focus-within:shadow-[0_8px_24px_var(--profile-glow)]"
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
            <button onClick={() => setQuery("")} className="text-text-muted flex-shrink-0">
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
                {searching ? "AI 검색 중..." : searchMode === "ai" ? "AI 검색" : "기본 검색"}
              </span>
            )}
          </div>
          {searching ? (
            <div className="flex justify-center pt-8">
              <Loader2 size={24} className="animate-spin text-brand-purple" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((item) => <ItemCard key={item.id} item={item} />)}
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
          <Link href="/save" className="inline-flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl text-[14px] font-semibold">
            저장하러 가기
          </Link>
        </div>
      ) : (
        <>
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
