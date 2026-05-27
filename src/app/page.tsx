"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Copy, ChevronRight, TrendingUp, X, FileText, Image as ImageIcon, Link2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { PROFILE_ICON_STORAGE_KEY, getProfileIcon } from "@/lib/profile-icons";

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
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [frequentItems, setFrequentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileIconId, setProfileIconId] = useState<string | null>(null);

  useEffect(() => {
    setProfileIconId(localStorage.getItem(PROFILE_ICON_STORAGE_KEY));
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: recent } = await supabase
        .from("items")
        .select("id, original_content, content_type, category, copy_count, created_at, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: frequent } = await supabase
        .from("items")
        .select("id, original_content, content_type, category, copy_count, created_at, summary")
        .eq("user_id", user.id)
        .order("copy_count", { ascending: false })
        .limit(3);

      setRecentItems(recent ?? []);
      setFrequentItems(frequent ?? []);
      setLoading(false);
    };

    fetchItems();
  }, []);

  const profileIcon = getProfileIcon(profileIconId);

  const searchResults = query.trim()
    ? recentItems.filter((item) =>
        item.original_content.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

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
    return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }).replace(". ", ".").replace(".", "");
  };

  const getTypeLabel = (type: string) => {
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
      <div className={`${variant === "soft" ? "bg-surface-soft border-border-light hover:border-brand-purple/30" : "bg-white border-border hover:border-brand-purple/35"} border rounded-2xl px-4 py-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0 active:scale-[0.98]`}>
        <div className="flex gap-3.5">
          {item.content_type === "image" && canPreviewImage(item.original_content) ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-section border border-border-light">
              <img
                src={item.original_content}
                alt=""
                className="w-full h-full object-cover"
              />
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
              {item.content_type === "image" ? (item.summary ?? "이미지") : item.original_content}
            </p>
            <div className="flex items-center gap-2.5 mt-3">
              {item.category && (
                <span className="text-[11px] font-semibold text-brand-purple bg-white px-2 py-0.5 rounded">{item.category}</span>
              )}
              <span className="text-[12px] text-text-secondary/70">{formatDate(item.created_at)}</span>
              <span className="text-[12px] text-text-secondary/45 px-0.5">·</span>
              <span className="text-[12px] text-text-secondary/70">{getTypeLabel(item.content_type)}</span>
            </div>
          </div>
          <button className="p-2 text-text-muted hover:text-text-primary flex-shrink-0 self-start transition-colors" onClick={(e) => handleCopy(e, item.original_content)}>
            <Copy size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Loom" width={32} height={32} className="object-contain" />
          <span className="text-[20px] font-semibold text-text-primary tracking-tight">Loom</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/notifications" className="p-2 text-text-muted relative">
            <Bell size={22} strokeWidth={1.5} />
          </Link>
          <Link href="/settings/account">
            <div className="relative w-8 h-8 rounded-full bg-surface-section overflow-hidden flex items-center justify-center">
              <Image src={profileIcon.image} alt="" fill sizes="32px" className="object-cover scale-[1.08] translate-y-[1px]" />
            </div>
          </Link>
        </div>
      </header>

      <section className="px-5 pt-3 pb-7">
        <h1 className="text-[35px] font-bold text-text-primary leading-[1.12]">기억을 검색해보세요</h1>
        <p className="text-[15px] text-text-secondary mt-3 leading-[1.6]">자연어로 검색하면, 관련된 기억을<br />빠르게 찾아드려요</p>
      </section>

      <section className="px-5 mb-7">
        <div className="flex min-h-[64px] items-center gap-3.5 bg-white border border-border-light rounded-2xl px-5 py-4 shadow-elevated transition-all focus-within:border-brand-purple/45 focus-within:shadow-[0_8px_24px_rgba(45,42,51,0.08)]">
          <Search size={21} className="text-text-secondary flex-shrink-0" strokeWidth={1.8} />
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
        <section className="px-5 pb-8">
          <p className="text-[13px] text-text-muted mb-4">검색 결과 {searchResults.length}개</p>
          {searchResults.length > 0 ? (
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
        <div className="flex justify-center pt-20">
          <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recentItems.length === 0 ? (
        <div className="text-center py-20 px-8">
          <p className="text-[18px] font-bold text-text-primary mb-2">아직 저장된 항목이 없어요</p>
          <p className="text-[14px] text-text-muted mb-8">아래 + 버튼을 눌러 첫 번째 기억을 저장해보세요</p>
          <Link href="/save" className="inline-flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl text-[14px] font-semibold">
            저장하러 가기
          </Link>
        </div>
      ) : (
        <>
          <section className="px-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-text-primary">최근 저장</h2>
              <Link href="/search" className="flex items-center text-[13px] text-text-muted">전체보기 <ChevronRight size={14} /></Link>
            </div>
            <div className="space-y-3">
              {recentItems.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </section>

          {frequentItems.some(i => i.copy_count > 0) && (
            <section className="px-5 mb-8">
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

