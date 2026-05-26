"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Calendar, Database, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function AccountPage() {
  const router = useRouter();
  const { show } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-4 pt-14 pb-3 flex items-center gap-3 bg-white">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">계정 정보</h1>
      </header>

      <section className="bg-white mt-2 px-5 py-6 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-surface-section flex items-center justify-center mb-4">
          <span className="text-[28px] font-bold text-text-muted">U</span>
        </div>
        <button className="text-[13px] text-brand-purple font-semibold">프로필 사진 변경</button>
      </section>

      <section className="bg-white mt-2">
        {[
          { icon: Mail, label: "이메일", value: "user@example.com" },
          { icon: Calendar, label: "가입일", value: "2024년 3월 15일" },
          { icon: Database, label: "저장된 아이템", value: "45개" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4 border-b border-border-light last:border-0">
            <Icon size={20} className="text-text-muted" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-[13px] text-text-muted">{label}</p>
              <p className="text-[15px] text-text-primary font-medium">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white mt-2">
        <button
          onClick={() => show("비밀번호 변경 이메일을 발송했어요", "success")}
          className="w-full px-5 py-4 text-left active:bg-surface-soft transition-colors"
        >
          <p className="text-[15px] text-text-primary">비밀번호 변경</p>
          <p className="text-[13px] text-text-muted mt-0.5">이메일로 비밀번호 재설정 링크를 보내드려요</p>
        </button>
      </section>

      <section className="bg-white mt-8">
        <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-4 px-5 py-4 active:bg-red-50 transition-colors">
          <Trash2 size={20} className="text-red-400" strokeWidth={1.5} />
          <div>
            <p className="text-[15px] text-red-400 font-medium">계정 삭제</p>
            <p className="text-[12px] text-text-muted">모든 데이터가 영구적으로 삭제됩니다.</p>
          </div>
        </button>
      </section>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="계정을 삭제하시겠어요?"
        message="모든 저장된 아이템, 컬렉션, 태그가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        danger
        onConfirm={() => { setShowDeleteConfirm(false); router.push("/login"); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
