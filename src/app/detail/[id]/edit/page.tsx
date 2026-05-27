"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES = ["카피/문구", "디자인", "아이디어", "코드", "레퍼런스", "일상", "기타"];

export default function EditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { show } = useToast();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("items")
        .select("original_content, category, tags")
        .eq("id", id)
        .single();
      if (data) {
        setContent(data.original_content);
        setCategory(data.category ?? "");
        setTags(data.tags ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const addTag = () => {
    if (newTag.trim() && tags.length < 5 && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("items").update({
      original_content: content.trim(),
      category: category || null,
      tags,
    }).eq("id", id);

    setSaving(false);
    if (error) {
      show("저장 실패. 다시 시도해주세요.", "error");
    } else {
      show("수정 완료", "success");
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[17px] font-bold text-text-primary">수정</h1>
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="text-[15px] font-semibold text-brand-purple py-1.5 px-2 disabled:opacity-40"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : "저장"}
        </button>
      </header>

      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">원문</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-48 bg-surface-soft border border-border-light rounded-2xl p-4 text-[15px] text-text-primary leading-relaxed resize-none outline-none focus:border-brand-purple transition-colors"
        />
      </section>

      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? "" : cat)}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                category === cat
                  ? "bg-brand-purple text-white border-brand-purple"
                  : "bg-white text-text-secondary border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">
          태그 <span className="text-text-muted font-normal">({tags.length}/5)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-surface-section text-text-secondary text-[13px] font-medium rounded-lg px-3 py-1.5">
              {tag}
              <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="text-text-muted ml-0.5">
                <X size={13} />
              </button>
            </span>
          ))}
          {tags.length < 5 && (
            <div className="flex items-center gap-1 border border-border rounded-lg px-3 py-1.5">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="태그 추가"
                className="bg-transparent text-[13px] text-text-primary outline-none w-20 placeholder:text-text-placeholder"
              />
              <button onClick={addTag} className="text-text-muted">
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

