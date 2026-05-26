"use client";

import { useState, useRef } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

export default function SaveImagePage() {
  const router = useRouter();
  const { show } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setSaving(false);
      show("업로드 실패. 다시 시도해주세요.", "error");
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);

    const { error: insertError } = await supabase.from("items").insert({
      user_id: user.id,
      original_content: publicUrl,
      content_type: "image",
      category: null,
      tags: memo.trim() ? [memo.trim()] : [],
    });

    setSaving(false);
    if (insertError) {
      show("저장 실패. 다시 시도해주세요.", "error");
    } else {
      show("이미지 저장 완료!", "success");
      setTimeout(() => router.push("/"), 800);
    }
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {preview ? (
          <div className="relative rounded-2xl overflow-hidden bg-surface-soft">
            <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-72 bg-surface-soft border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 active:bg-surface-section transition-colors"
          >
            <ImagePlus size={40} className="text-text-muted" strokeWidth={1} />
            <p className="text-[14px] text-text-muted">이미지를 선택해 주세요</p>
            <p className="text-[12px] text-text-placeholder">탭하여 사진 선택</p>
          </button>
        )}
      </section>

      {preview && (
        <section className="px-5 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[13px] text-brand-purple font-semibold"
          >
            다른 이미지 선택
          </button>
        </section>
      )}

      <section className="px-5 mb-6">
        <p className="text-[14px] font-semibold text-text-primary mb-2">
          메모 <span className="text-text-muted font-normal">(선택)</span>
        </p>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이미지에 대한 메모를 입력하세요..."
          className="w-full h-24 bg-surface-soft border border-border-light rounded-xl p-4 text-[14px] text-text-primary leading-relaxed resize-none outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
        />
      </section>

      <section className="px-5 pb-8">
        <button
          onClick={handleSave}
          disabled={!file || saving}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
            file && !saving ? "bg-text-primary text-white active:scale-[0.98]" : "bg-surface-section text-text-muted"
          }`}
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </section>
    </div>
  );
}
