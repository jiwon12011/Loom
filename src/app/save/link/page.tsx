"use client";

import { useState } from "react";
import { X, Link2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export default function SaveLinkPage() {
  const router = useRouter();
  const { show } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<null | { title: string; desc: string; image: string }>(null);
  const [fetchError, setFetchError] = useState("");

  const handleFetch = () => {
    if (!url.trim()) return;
    setFetchError("");
    setLoading(true);
    setTimeout(() => {
      if (!url.startsWith("http")) {
        setFetchError("올바른 URL을 입력해주세요 (https://...)");
        setLoading(false);
        return;
      }
      setPreview({
        title: "좋은 UX 디자인의 7가지 원칙",
        desc: "사용자 경험을 개선하기 위한 핵심 원칙들을 정리한 아티클입니다.",
        image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=200&fit=crop",
      });
      setLoading(false);
    }, 1500);
  };

  const handleSave = () => {
    if (!preview) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      show("링크 저장 완료!", "success");
      setTimeout(() => router.push("/"), 800);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-text-primary">링크 저장</h1>
        <button onClick={() => router.back()} className="p-1.5 text-text-muted">
          <X size={22} strokeWidth={1.5} />
        </button>
      </header>

      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">URL</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-4 py-3">
            <Link2 size={18} className="text-text-muted flex-shrink-0" />
            <input type="url" value={url} onChange={(e) => { setUrl(e.target.value); setFetchError(""); }} onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="https://..." className="flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-placeholder" />
          </div>
          <button onClick={handleFetch} disabled={loading}
            className="px-4 bg-text-primary text-white rounded-xl text-[14px] font-semibold flex-shrink-0 active:scale-[0.97] transition-transform disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "불러오기"}
          </button>
        </div>
        {fetchError && <p className="text-[12px] text-red-400 mt-2">{fetchError}</p>}
      </section>

      {loading && !preview && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="text-brand-purple animate-spin" />
        </div>
      )}

      {preview && !loading && (
        <>
          <section className="px-5 mb-6">
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">미리보기</label>
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="h-40 bg-surface-soft"><img src={preview.image} alt="" className="w-full h-full object-cover" /></div>
              <div className="p-4">
                <h3 className="text-[15px] font-bold text-text-primary mb-1">{preview.title}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed">{preview.desc}</p>
                <p className="text-[12px] text-brand-purple mt-2 truncate">{url}</p>
              </div>
            </div>
          </section>
          <section className="px-5 mb-6">
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">메모 <span className="text-text-muted font-normal">(선택)</span></label>
            <textarea placeholder="이 링크에 대한 메모를 남겨보세요..."
              className="w-full h-20 bg-surface-soft border border-border-light rounded-xl p-4 text-[14px] text-text-primary leading-relaxed resize-none outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors" />
          </section>
        </>
      )}

      <section className="px-5 pb-8">
        <button onClick={handleSave} disabled={!preview || saving}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
            preview && !saving ? "bg-text-primary text-white active:scale-[0.98]" : "bg-surface-section text-text-muted"
          }`}>
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </section>
    </div>
  );
}
