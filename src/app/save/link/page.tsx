"use client";

import { useState } from "react";
import { X, Link2, FileText, Image, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { notifyAiComplete } from "@/lib/notifications";

const saveTypes = [
  { id: "text", icon: FileText, label: "텍스트", href: "/save" },
  { id: "image", icon: Image, label: "이미지", href: "/save/image" },
  { id: "link", icon: Link2, label: "링크", href: "/save/link" },
];

interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
}

export default function SaveLinkPage() {
  const router = useRouter();
  const { show } = useToast();
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [fetchError, setFetchError] = useState("");

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFetchError("");

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setFetchError("올바른 URL을 입력해주세요 (https://...)");
      return;
    }

    setLoading(true);
    setPreview(null);

    try {
      const res = await fetch("/api/fetch-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setFetchError("링크를 불러올 수 없어요. URL을 확인해주세요.");
        setLoading(false);
        return;
      }

      setPreview({
        title: data.title || null,
        description: data.description || null,
        image: data.image || null,
      });
    } catch {
      setFetchError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const contentParts = [url.trim()];
    if (preview.title) contentParts.push(preview.title);
    if (preview.description) contentParts.push(preview.description);
    if (memo.trim()) contentParts.push(`[메모] ${memo.trim()}`);
    const originalContent = contentParts.join("\n");

    const { data: inserted, error } = await supabase.from("items").insert({
      user_id: user.id,
      original_content: originalContent,
      content_type: "link",
      summary: preview.description || null,
    }).select("id").single();

    if (error || !inserted) {
      setSaving(false);
      show("저장 실패. 다시 시도해주세요.", "error");
      return;
    }

    try {
      const textForAi = [
        preview.title,
        preview.description,
        memo.trim(),
      ].filter(Boolean).join(" ");

      if (textForAi) {
        const res = await fetch("/api/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: textForAi }),
        });
        const { category, tags } = await res.json();
        if (category || tags?.length > 0) {
          await supabase.from("items").update({ category, tags }).eq("id", inserted.id);
          await notifyAiComplete(user.id, inserted.id, category, tags ?? []);
        }
      }
    } catch { /* AI 실패해도 저장은 유지 */ }

    setSaving(false);
    show("링크 저장 완료!", "success");
    setTimeout(() => router.push("/"), 800);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-text-primary">저장하기</h1>
        <button onClick={() => router.back()} className="p-2.5 -mr-1 text-text-muted">
          <X size={22} strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-5 mb-6">
        <div className="flex gap-2">
          {saveTypes.map(({ id, icon: Icon, label, href }) => (
            <button
              key={id}
              onClick={() => { if (id !== "link") router.push(href); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
                id === "link"
                  ? "bg-brand-purple text-white border-brand-purple"
                  : "bg-surface text-text-secondary border-border"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">URL</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-4 py-3">
            <Link2 size={18} className="text-text-muted flex-shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setFetchError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="https://..."
              className="flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-placeholder"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="px-4 bg-brand-purple text-white rounded-xl text-[14px] font-semibold flex-shrink-0 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
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
              {preview.image && (
                <div className="h-40 bg-surface-soft">
                  <img
                    src={preview.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-[15px] font-bold text-text-primary mb-1">
                  {preview.title || "제목 없음"}
                </h3>
                {preview.description && (
                  <p className="text-[13px] text-text-muted leading-relaxed">{preview.description}</p>
                )}
                <p className="text-[12px] text-brand-purple mt-2 truncate">{url}</p>
              </div>
            </div>
          </section>

          <section className="px-5 mb-6">
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">
              메모 <span className="text-text-muted font-normal">(선택)</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="이 링크에 대한 메모를 남겨보세요..."
              className="w-full h-20 bg-surface-soft border border-border-light rounded-xl p-4 text-[14px] text-text-primary leading-relaxed resize-none outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
            />
          </section>

          <section className="px-5 mb-4">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="text-[14px] font-medium">카테고리 자동 추천</span>
              <Sparkles size={16} className="text-brand-purple" />
            </div>
            <p className="text-[13px] text-text-muted mt-1">저장하면 AI가 카테고리와 태그를 추천해요.</p>
          </section>
        </>
      )}

      <section className="px-5 pb-8">
        <button
          onClick={handleSave}
          disabled={!preview || saving}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
            preview && !saving
              ? "bg-brand-purple text-white active:scale-[0.98]"
              : "bg-surface-section text-text-muted"
          }`}
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </section>
    </div>
  );
}
