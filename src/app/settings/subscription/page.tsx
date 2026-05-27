"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

const FREE_LIMITS = { items: 100, images: 10, collections: 5 };

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₩0",
    period: "/월",
    features: [
      `아이템 ${FREE_LIMITS.items}개 저장`,
      "기본 자연어 검색",
      "AI 자동 태그",
      `이미지 ${FREE_LIMITS.images}장/월`,
      `컬렉션 ${FREE_LIMITS.collections}개`,
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₩4,900",
    period: "/월",
    popular: true,
    features: [
      "무제한 저장",
      "고급 자연어 검색",
      "AI 자동 태그 무제한",
      "이미지 무제한",
      "컬렉션 무제한",
      "OCR 무제한",
      "우선 지원",
    ],
  },
];

interface Usage {
  items: number;
  images: number;
  collections: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { show } = useToast();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [itemRes, imageRes, colRes] = await Promise.all([
        supabase
          .from("items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("content_type", "image"),
        supabase
          .from("collections")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setUsage({
        items: itemRes.count ?? 0,
        images: imageRes.count ?? 0,
        collections: colRes.count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleUpgrade = () => {
    show("Pro 플랜은 준비 중이에요. 곧 만나요!", "success");
  };

  const itemPercent = usage ? Math.min(Math.round((usage.items / FREE_LIMITS.items) * 100), 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-5 pt-14 pb-3 flex items-center gap-3 bg-surface">
        <button onClick={() => router.back()} className="p-2.5 -ml-1 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">구독 관리</h1>
      </header>

      <section className="bg-surface mt-2 px-5 py-5">
        <p className="text-[13px] text-text-muted mb-3">현재 사용량</p>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[14px] font-semibold text-text-primary">
              아이템 {usage?.items ?? 0} / {FREE_LIMITS.items}개
            </span>
            <span className="text-[13px] text-text-muted">{itemPercent}%</span>
          </div>
          <div className="w-full h-2 bg-surface-section rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${itemPercent >= 90 ? "bg-red-400" : "bg-brand-purple"}`}
              style={{ width: `${itemPercent}%` }}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-surface-soft rounded-xl px-4 py-3">
            <p className="text-[12px] text-text-muted">이미지</p>
            <p className="text-[16px] font-bold text-text-primary mt-0.5">
              {usage?.images ?? 0}<span className="text-[13px] font-normal text-text-muted"> / {FREE_LIMITS.images}</span>
            </p>
          </div>
          <div className="flex-1 bg-surface-soft rounded-xl px-4 py-3">
            <p className="text-[12px] text-text-muted">컬렉션</p>
            <p className="text-[16px] font-bold text-text-primary mt-0.5">
              {usage?.collections ?? 0}<span className="text-[13px] font-normal text-text-muted"> / {FREE_LIMITS.collections}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="px-5 mt-6 space-y-4 pb-8">
        {plans.map((plan) => {
          const isCurrent = plan.id === "free";
          return (
            <div
              key={plan.id}
              className={`bg-surface rounded-2xl border-2 p-5 relative ${
                isCurrent ? "border-brand-purple" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-5 bg-brand-purple text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap size={12} /> 추천
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-5 bg-brand-purple text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  현재 플랜
                </div>
              )}
              <div className="mb-4">
                <p className="text-[14px] font-semibold text-text-muted">{plan.name}</p>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-[32px] font-extrabold text-text-primary">{plan.price}</span>
                  <span className="text-[14px] text-text-muted">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check size={15} className="text-brand-purple flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-[14px] text-text-secondary">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={isCurrent ? undefined : handleUpgrade}
                className={`w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all ${
                  isCurrent
                    ? "bg-surface-section text-text-muted"
                    : "bg-brand-purple text-white active:scale-[0.98]"
                }`}
                disabled={isCurrent}
              >
                {isCurrent ? "현재 사용 중" : "업그레이드"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
