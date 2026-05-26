"use client";

import { ArrowLeft, Sparkles, Tag, Copy, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

const notifications = [
  {
    id: "1",
    icon: Sparkles,
    title: "AI 정리 완료",
    desc: '"완벽하지 않아도..." 아이템의 태그가 생성되었어요.',
    time: "방금 전",
    read: false,
  },
  {
    id: "2",
    icon: Tag,
    title: "새 카테고리 추천",
    desc: "최근 저장 패턴을 분석해 '브랜딩' 카테고리를 추천드려요.",
    time: "1시간 전",
    read: false,
  },
  {
    id: "3",
    icon: Copy,
    title: "인기 아이템",
    desc: '"좋은 브랜드는 제품을 팔지 않고..." 가 10회 복사되었어요.',
    time: "어제",
    read: true,
  },
  {
    id: "4",
    icon: Bell,
    title: "저장 공간 안내",
    desc: "무료 플랜 저장 공간의 45%를 사용 중이에요.",
    time: "2일 전",
    read: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">알림</h1>
      </header>

      <div className="divide-y divide-border-light">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`px-5 py-4 flex gap-3.5 ${!n.read ? "bg-surface-soft" : ""}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? "bg-brand-purple/10" : "bg-surface-section"}`}>
                <Icon size={17} className={!n.read ? "text-brand-purple" : "text-text-muted"} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-text-primary">{n.title}</p>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />}
                </div>
                <p className="text-[13px] text-text-muted mt-0.5 leading-relaxed">{n.desc}</p>
                <p className="text-[11px] text-text-placeholder mt-1">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
