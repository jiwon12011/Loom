"use client";

import { useState } from "react";
import { X, Crop, ImagePlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export default function SaveImagePage() {
  const router = useRouter();
  const { show } = useToast();
  const [memo, setMemo] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!hasImage) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      show("이미지 저장 완료! AI가 정리 중이에요.", "success");
      setTimeout(() => router.push("/"), 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-text-primary">이미지 저장</h1>
        <button onClick={() => router.back()} className="p-1.5 text-text-muted">
          <X size={22} strokeWidth={1.5} />
        </button>
      </header>

      <section className="px-5 mb-5">
        {hasImage ? (
          <div className="relative rounded-2xl overflow-hidden bg-surface-soft">
            <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=500&fit=crop" alt="Preview" className="w-full h-auto" />
          </div>
        ) : (
          <button onClick={() => setHasImage(true)} className="w-full h-72 bg-surface-soft border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 active:bg-surface-section transition-colors">
            <ImagePlus size={40} className="text-text-muted" strokeWidth={1} />
            <p className="text-[14px] text-text-muted">이미지를 선택해 주세요</p>
            <p className="text-[12px] text-text-placeholder">탭하여 사진 선택 또는 촬영</p>
          </button>
        )}
      </section>

      {hasImage && (
        <section className="px-5 mb-6 flex justify-center">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-soft border border-border rounded-xl text-[13px] font-semibold text-text-secondary">
            <Crop size={16} strokeWidth={1.5} />
            잘라내기
          </button>
        </section>
      )}

      <section className="px-5 mb-6">
        <p className="text-[14px] font-semibold text-text-primary mb-2">
          메모 <span className="text-text-muted font-normal">(선택)</span>
        </p>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="이미지에 대한 메모를 입력하세요..."
          className="w-full h-24 bg-surface-soft border border-border-light rounded-xl p-4 text-[14px] text-text-primary leading-relaxed resize-none outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors" />
      </section>

      <section className="px-5 pb-8">
        <button
          onClick={handleSave}
          disabled={!hasImage || saving}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
            hasImage && !saving ? "bg-text-primary text-white active:scale-[0.98]" : "bg-surface-section text-text-muted"
          }`}
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </section>
    </div>
  );
}
