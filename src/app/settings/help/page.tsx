"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const faqs = [
  {
    q: "무엇을 저장할 수 있나요?",
    a: "텍스트, 이미지, 링크를 저장할 수 있어요. 텍스트에는 참고 이미지를 함께 붙일 수도 있고, 링크는 제목·설명 미리보기와 메모를 함께 저장해요.",
  },
  {
    q: "AI는 무엇을 해주나요?",
    a: "저장하면 AI가 자동으로 카테고리와 태그를 추천해요. 이미지는 내용을 요약하고 안에 있는 텍스트도 추출해요. 정리가 끝나면 알림으로 알려드려요.",
  },
  {
    q: "검색은 어떻게 동작하나요?",
    a: "검색창에 기억나는 대로 자연어로 입력하면, AI가 의미·분위기·카테고리·요약·이미지 속 텍스트까지 고려해 관련 항목을 찾아줘요. AI 검색이 어려운 경우 기본 키워드 검색으로 자동 전환돼요.",
  },
  {
    q: "컬렉션은 무엇인가요?",
    a: "저장한 아이템을 주제별로 묶는 폴더예요. 컬렉션을 만들고 색상을 고른 뒤, 상세 화면이나 컬렉션 화면에서 아이템을 담을 수 있어요. 컬렉션을 지워도 안의 아이템은 삭제되지 않아요.",
  },
  {
    q: "카테고리를 직접 추가할 수 있나요?",
    a: "네. 설정 > 카테고리 관리에서 기본 카테고리 외에 원하는 카테고리를 추가하거나 이름을 바꿀 수 있어요.",
  },
  {
    q: "데이터를 삭제하면 복구할 수 있나요?",
    a: "아이템이나 계정을 삭제하면 데이터는 영구적으로 삭제되어 복구할 수 없어요. 삭제 전에 한 번 더 확인해주세요.",
  },
  {
    q: "비밀번호를 잊어버렸어요.",
    a: "로그인 화면의 '비밀번호를 잊으셨나요?'를 누르면 이메일로 재설정 링크를 보내드려요. 링크를 열어 새 비밀번호를 설정하면 돼요.",
  },
];

export default function HelpPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-5 pt-14 pb-3 flex items-center gap-3 bg-surface">
        <button aria-label="뒤로 가기" onClick={() => router.back()} className="p-2.5 -ml-1 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">도움말</h1>
      </header>

      <div className="px-5 py-6 space-y-5">
        {faqs.map((f) => (
          <section key={f.q} className="bg-surface rounded-2xl border border-border-light px-4 py-4">
            <h2 className="text-[15px] font-bold text-text-primary mb-2">{f.q}</h2>
            <p className="text-[14px] text-text-secondary leading-relaxed">{f.a}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
