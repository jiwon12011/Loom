"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Tag, Copy, Bell, CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Notification,
  NotificationType,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "@/lib/notifications";
import Link from "next/link";

const typeConfig: Record<NotificationType, { icon: typeof Sparkles; label: string }> = {
  ai_complete: { icon: Sparkles, label: "AI 정리" },
  category_suggest: { icon: Tag, label: "카테고리" },
  popular_item: { icon: Copy, label: "인기" },
  storage_info: { icon: Bell, label: "안내" },
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 172800) return "어제";
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await fetchNotifications(user.id);
      setNotifications(data);
      setLoading(false);
    };
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTap = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
    }
    if (n.item_id) {
      router.push(`/detail/${n.item_id}`);
    }
  };

  const handleMarkAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await markAllAsRead(user.id);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2.5 -ml-1 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">알림</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="ml-auto flex items-center gap-1 text-[13px] text-brand-purple font-semibold"
          >
            <CheckCheck size={15} strokeWidth={1.5} />
            모두 읽음
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex justify-center pt-20">
          <Loader2 size={24} className="text-brand-purple animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 px-8">
          <div className="w-14 h-14 rounded-full bg-surface-soft flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-text-muted" strokeWidth={1.5} />
          </div>
          <p className="text-[16px] font-bold text-text-primary mb-1">알림이 없어요</p>
          <p className="text-[14px] text-text-muted">아이템을 저장하면 AI가 정리한 결과를 알려드려요.</p>
        </div>
      ) : (
        <div className="divide-y divide-border-light">
          {notifications.map((n) => {
            const config = typeConfig[n.type] ?? typeConfig.storage_info;
            const Icon = config.icon;
            return (
              <button
                key={n.id}
                onClick={() => handleTap(n)}
                className={`w-full text-left px-5 py-4 flex gap-3.5 transition-colors ${
                  !n.read ? "bg-surface-soft" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !n.read ? "bg-brand-purple/10" : "bg-surface-section"
                  }`}
                >
                  <Icon
                    size={17}
                    className={!n.read ? "text-brand-purple" : "text-text-muted"}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-text-primary">{n.title}</p>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                    )}
                  </div>
                  <p className="text-[13px] text-text-muted mt-0.5 leading-relaxed">
                    {n.description}
                  </p>
                  <p className="text-[11px] text-text-placeholder mt-1">
                    {formatTime(n.created_at)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
