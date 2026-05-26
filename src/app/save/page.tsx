"use client";

import { useState } from "react";
import { X, FileText, Image, Link2, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

const saveTypes = [
  { id: "text", icon: FileText, label: "텍스트", href: "/save" },
  { id: "image", icon: Image, label: "이미지", href: "/save/image" },
  { id: "link", icon: Link2, label: "링크", href: "/save/link" },
];

export default function SavePage() {
  const router = useRouter();
  const { show } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

    const { data: inserted, error } = await supabase.from("items").insert({
      user_id: user.id,
      original_content: content.trim(),
      content_type: "text",
    }).select("id").single();

    if (error || !inserted) {
      setLoading(false);
      show("저장 실패. 다시 시도해주세요.", "error");
      return;
    }

    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const { category, tags } = await res.json();
      if (category || tags?.length > 0) {
        await supabase.from("items").update({ category, tags }).eq("id", inserted.id);
      }
    } catch { /* AI 실패해도 저장은 유지 */ }

    setLoading(false);
    show("저장 완료!", "success");
    setTimeout(() => router.push("/"), 800);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-text-primary">저장하기</h1>
        <button onClick={() => router.back()} className="p-1.5 text-text-muted">
          <X size={22} strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-5 mb-6">
        <div className="flex gap-2">
          {saveTypes.map(({ id, icon: Icon, label, href }) => (
            <button
              key={id}
              onClick={() => { if (id !== "text") router.push(href); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
                id === "text"
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-white text-text-secondary border-border"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="px-5 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"내용을 붙여넣어 주세요...\n(텍스트, 코드, 프롬프트 등)"}
          className="w-full h-64 bg-surface-soft border border-border-light rounded-2xl p-4 text-[15px] text-text-primary leading-relaxed resize-none outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
        />
        {content.trim() && (
          <p className="text-[12px] text-text-muted mt-2 text-right">{content.length}자</p>
        )}
      </section>

      <section className="px-5 mb-8">
        <div className="flex items-center gap-2 text-text-muted">
          <span className="text-[14px] font-medium">카테고리 자동 추천</span>
          <Sparkles size={16} className="text-brand-purple" />
        </div>
        <p className="text-[13px] text-text-muted mt-1">저장하면 AI가 카테고리와 태그를 추천해요.</p>
      </section>

      <section className="px-5">
        <button
          onClick={handleSave}
          disabled={!content.trim() || loading}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
            content.trim() && !loading
              ? "bg-text-primary text-white active:scale-[0.98]"
              : "bg-surface-section text-text-muted"
          }`}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "저장 중..." : "저장하기"}
        </button>
      </section>
    </div>
  );
}
