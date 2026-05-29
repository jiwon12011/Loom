"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    emoji: "💾",
    title: "무엇이든 저장하세요",
    desc: "텍스트, 이미지, 링크, 프롬프트.\n붙여넣기만 하면 저장 완료.",
  },
  {
    emoji: "✨",
    title: "AI가 자동으로 정리해요",
    desc: "제목, 카테고리, 태그를\nAI가 알아서 분류합니다.",
  },
  {
    emoji: "🔍",
    title: "자연어로 검색하세요",
    desc: "기억나는 대로 검색하면\n관련 내용을 바로 찾아드려요.",
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Skip */}
      <header className="px-5 pt-14 flex justify-end">
        <Link href="/login" className="text-[14px] text-text-muted py-2 px-3">
          건너뛰기
        </Link>
      </header>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-[72px] mb-8">{slides[current].emoji}</div>
        <h1 className="text-[26px] font-bold text-text-primary leading-tight mb-4">
          {slides[current].title}
        </h1>
        <p className="text-[16px] text-text-secondary leading-relaxed whitespace-pre-line">
          {slides[current].desc}
        </p>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i === current
                ? "w-6 h-2 bg-brand-purple"
                : "w-2 h-2 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Button */}
      <div className="px-5 pb-10">
        {current < slides.length - 1 ? (
          <button
            onClick={() => setCurrent(current + 1)}
            className="w-full flex items-center justify-center gap-2 btn-accent rounded-xl py-4 text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            다음
            <ArrowRight size={18} />
          </button>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 btn-accent rounded-xl py-4 text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            시작하기
          </Link>
        )}
      </div>
    </div>
  );
}

