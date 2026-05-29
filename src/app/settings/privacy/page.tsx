"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const sections = [
  {
    title: "1. 수집하는 정보",
    body: "Loom은 회원가입 시 이메일 주소를, 서비스 이용 과정에서 사용자가 직접 저장한 콘텐츠(텍스트, 이미지, 링크, 메모, 카테고리, 태그)를 수집합니다. 비밀번호는 암호화되어 저장되며 운영자가 열람할 수 없습니다.",
  },
  {
    title: "2. 정보의 이용 목적",
    body: "수집한 정보는 (1) 계정 인증 및 관리, (2) 저장한 콘텐츠의 보관·검색·정리 기능 제공, (3) AI 자동 분류 및 자연어 검색 기능 제공을 위해 사용됩니다.",
  },
  {
    title: "3. AI 처리",
    body: "저장한 텍스트·이미지는 자동 분류와 검색을 위해 AI 모델 제공자(예: Groq)에게 전송되어 처리될 수 있습니다. 해당 데이터는 분류·검색 결과 생성 목적에 한해 사용되며, 광고 등 다른 목적으로 사용되지 않습니다.",
  },
  {
    title: "4. 보관 및 파기",
    body: "저장한 데이터는 계정이 유지되는 동안 보관됩니다. 사용자가 아이템을 삭제하거나 계정을 삭제하면 관련 데이터는 즉시 영구 삭제되며 복구할 수 없습니다.",
  },
  {
    title: "5. 제3자 제공",
    body: "법령에 의한 경우를 제외하고 사용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 서비스 운영을 위한 인프라(데이터베이스·스토리지·AI 처리) 제공자에게만 처리 목적 범위 내에서 위탁됩니다.",
  },
  {
    title: "6. 이용자의 권리",
    body: "사용자는 언제든지 본인의 데이터를 조회·수정·삭제할 수 있으며, 계정 정보 화면에서 계정 삭제를 통해 모든 데이터를 영구 삭제할 수 있습니다.",
  },
  {
    title: "7. 문의",
    body: "개인정보 처리에 대한 문의는 앱 내 문의 채널 또는 운영자 이메일로 연락해주세요.",
  },
];

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-5 pt-14 pb-3 flex items-center gap-3 bg-surface">
        <button aria-label="뒤로 가기" onClick={() => router.back()} className="p-2.5 -ml-1 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">개인정보 처리방침</h1>
      </header>

      <div className="px-5 py-6 space-y-6">
        <p className="text-[13px] text-text-muted">최종 업데이트: 2026년 5월</p>
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-[15px] font-bold text-text-primary mb-2">{s.title}</h2>
            <p className="text-[14px] text-text-secondary leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
