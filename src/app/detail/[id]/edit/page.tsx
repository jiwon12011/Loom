"use client";

import { useState } from "react";
import { ArrowLeft, X, Plus, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockItems, categories as categoryList } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";

export default function EditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { show } = useToast();
  const item = mockItems.find((i) => i.id === id) || mockItems[0];

  const [content, setContent] = useState(item.content);
  const [category, setCategory] = useState(item.category);
  const [tags, setTags] = useState(item.tags);
  const [newTag, setNewTag] = useState("");
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    if (newTag.trim() && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const contentChanged = content !== item.content;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[17px] font-bold text-text-primary">수정</h1>
        <button
          onClick={() => {
            setSaving(true);
            setTimeout(() => {
              show("수정 완료", "success");
              router.back();
            }, 800);
          }}
          disabled={saving}
          className="text-[15px] font-semibold text-brand-purple py-1.5 px-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : "저장"}
        </button>
      </header>

      {/* Content Edit */}
      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">원문</label>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setShowRegenerate(true);
          }}
          className="w-full h-48 bg-surface-soft border border-border-light rounded-2xl p-4 text-[15px] text-text-primary leading-relaxed resize-none outline-none focus:border-brand-purple transition-colors"
        />
      </section>

      {/* AI Regenerate Prompt */}
      {showRegenerate && contentChanged && (
        <section className="px-5 mb-6">
          <div className="bg-surface-section border border-border-light rounded-xl p-4 flex items-start gap-3">
            <Sparkles size={18} className="text-brand-purple flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[14px] text-text-primary font-medium">
                내용이 수정되었어요.
              </p>
              <p className="text-[13px] text-text-muted mt-0.5">AI 정리를 다시 할까요?</p>
              <div className="flex gap-2 mt-3">
                <button className="px-4 py-2 bg-text-primary text-white text-[13px] font-semibold rounded-lg">
                  다시 정리하기
                </button>
                <button
                  onClick={() => setShowRegenerate(false)}
                  className="px-4 py-2 bg-white border border-border text-text-secondary text-[13px] font-semibold rounded-lg"
                >
                  건너뛰기
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category */}
      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {categoryList.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                category === cat.name
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-white text-text-secondary border-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="px-5 mb-6">
        <label className="text-[13px] font-semibold text-text-secondary mb-2 block">
          태그 <span className="text-text-muted font-normal">({tags.length}/5)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-surface-section text-text-secondary text-[13px] font-medium rounded-lg px-3 py-1.5"
            >
              {tag}
              <button onClick={() => removeTag(i)} className="text-text-muted ml-0.5">
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

      {/* Image Management (if image type) */}
      {item.image_url && (
        <section className="px-5 mb-6">
          <label className="text-[13px] font-semibold text-text-secondary mb-2 block">이미지</label>
          <div className="flex gap-3">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-soft">
              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              <button className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                <X size={12} className="text-white" />
              </button>
            </div>
            <button className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-text-muted">
              <Plus size={24} strokeWidth={1.5} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
