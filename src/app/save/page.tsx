"use client";

import { useRef, useState } from "react";
import { X, FileText, Image, Link2, Sparkles, Loader2, ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { notifyAiComplete } from "@/lib/notifications";

const saveTypes = [
  { id: "text", icon: FileText, label: "텍스트", href: "/save" },
  { id: "image", icon: Image, label: "이미지", href: "/save/image" },
  { id: "link", icon: Link2, label: "링크", href: "/save/link" },
];

export default function SavePage() {
  const router = useRouter();
  const { show } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceImage(file);
    setReferencePreview(URL.createObjectURL(file));
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

    const { data: inserted, error } = await supabase.from("items").insert({
      user_id: user.id,
      original_content: content.trim(),
      content_type: referenceImage ? "mixed" : "text",
    }).select("id").single();

    if (error || !inserted) {
      setLoading(false);
      show("저장 실패. 다시 시도해주세요.", "error");
      return;
    }

    if (referenceImage) {
      const ext = referenceImage.name.split(".").pop();
      const path = `${user.id}/${inserted.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, referenceImage, { upsert: false });

      if (uploadError) {
        await supabase.from("items").delete().eq("id", inserted.id);
        setLoading(false);
        show("참고 이미지 업로드에 실패했어요. 다시 시도해주세요.", "error");
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);
      const { error: imageError } = await supabase.from("item_images").insert({
        item_id: inserted.id,
        user_id: user.id,
        image_url: publicUrl,
        display_order: 0,
      });

      if (imageError) {
        await supabase.storage.from("images").remove([path]);
        await supabase.from("items").delete().eq("id", inserted.id);
        setLoading(false);
        show("참고 이미지 저장에 실패했어요. 다시 시도해주세요.", "error");
        return;
      }
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
        await notifyAiComplete(user.id, inserted.id, category, tags ?? []);
      }
    } catch { /* AI 실패해도 저장은 유지 */ }

    setLoading(false);
    show("저장 완료!", "success");
    setTimeout(() => router.push("/"), 800);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-text-primary">저장하기</h1>
        <button aria-label="뒤로 가기" onClick={() => router.back()} className="p-2.5 -mr-1 text-text-muted">
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
                  ? "btn-accent border-accent"
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

      <section className="px-5 mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleReferenceImageChange}
        />
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[14px] font-semibold text-text-primary">참고 이미지</p>
            <p className="text-[12px] text-text-muted mt-0.5">텍스트를 설명하는 보조 이미지를 함께 저장해요.</p>
          </div>
          {referencePreview && (
            <button onClick={clearReferenceImage} className="text-[13px] font-semibold text-text-muted">
              제거
            </button>
          )}
        </div>
        {referencePreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative block w-full overflow-hidden rounded-2xl border border-border-light bg-surface-soft"
          >
            <img src={referencePreview} alt="참고 이미지 미리보기" className="h-44 w-full object-cover" />
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border border-dashed border-border bg-surface-soft px-4 py-5 text-left active:bg-surface-section transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-brand-purple">
                <ImagePlus size={22} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-text-primary">이미지 추가</p>
                <p className="text-[12px] text-text-muted mt-0.5">무드, 레퍼런스, 스크린샷 등을 붙일 수 있어요.</p>
              </div>
            </div>
          </button>
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
              ? "btn-accent active:scale-[0.98]"
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

