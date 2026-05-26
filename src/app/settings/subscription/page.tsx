"use client";

import { ArrowLeft, Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₩0",
    period: "/월",
    current: true,
    features: [
      "아이템 100개 저장",
      "기본 자연어 검색",
      "AI 자동 태그",
      "이미지 10장/월",
      "컬렉션 5개",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₩4,900",
    period: "/월",
    current: false,
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

export default function SubscriptionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-4 pt-14 pb-3 flex items-center gap-3 bg-white">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">구독 관리</h1>
      </header>

      {/* Usage */}
      <section className="bg-white mt-2 px-5 py-5">
        <p className="text-[13px] text-text-muted mb-2">현재 사용량</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-semibold text-text-primary">45 / 100개</span>
          <span className="text-[13px] text-text-muted">45%</span>
        </div>
        <div className="w-full h-2 bg-surface-section rounded-full overflow-hidden">
          <div className="h-full bg-brand-purple rounded-full" style={{ width: "45%" }} />
        </div>
      </section>

      {/* Plans */}
      <div className="px-5 mt-6 space-y-4 pb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border-2 p-5 relative ${
              plan.current ? "border-text-primary" : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-5 bg-brand-purple text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Zap size={12} /> 추천
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 right-5 bg-text-primary text-white text-[11px] font-semibold px-3 py-1 rounded-full">
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
              className={`w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all ${
                plan.current
                  ? "bg-surface-section text-text-muted"
                  : "bg-text-primary text-white active:scale-[0.98]"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "현재 사용 중" : "업그레이드"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
