"use client";

import { useState } from "react";
import { ArrowLeft, Plus, GripVertical, X, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

const defaultCategories = [
  { id: "1", name: "디자인", count: 128, editable: false },
  { id: "2", name: "카피/문구", count: 96, editable: false },
  { id: "3", name: "아이디어", count: 72, editable: false },
  { id: "4", name: "개발", count: 48, editable: false },
  { id: "5", name: "AI/프롬프트", count: 81, editable: false },
  { id: "6", name: "기타", count: 34, editable: false },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [cats, setCats] = useState(defaultCategories);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const addCategory = () => {
    if (newName.trim()) {
      setCats([...cats, { id: Date.now().toString(), name: newName.trim(), count: 0, editable: true }]);
      setNewName("");
      setAdding(false);
    }
  };

  const removeCategory = (id: string) => {
    setCats(cats.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-4 pt-14 pb-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 text-text-primary">
            <ArrowLeft size={22} strokeWidth={1.5} />
          </button>
          <h1 className="text-[18px] font-bold text-text-primary">카테고리 관리</h1>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="p-1.5 text-brand-purple"
        >
          <Plus size={22} strokeWidth={1.5} />
        </button>
      </header>

      <p className="px-5 py-3 text-[13px] text-text-muted bg-white border-b border-border-light">
        카테고리를 추가하거나 순서를 변경할 수 있어요.
      </p>

      {/* Add New */}
      {adding && (
        <div className="bg-white border-b border-border-light px-5 py-3 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="새 카테고리 이름"
            autoFocus
            className="flex-1 bg-surface-soft border border-border rounded-lg px-3 py-2.5 text-[14px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple"
          />
          <button onClick={addCategory} className="text-[14px] text-brand-purple font-semibold px-2">
            추가
          </button>
          <button onClick={() => { setAdding(false); setNewName(""); }} className="text-text-muted">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Category List */}
      <div className="bg-white mt-2">
        {cats.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 px-5 py-3.5 border-b border-border-light last:border-0"
          >
            <GripVertical size={18} className="text-text-placeholder flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[15px] text-text-primary font-medium">{cat.name}</p>
              <p className="text-[12px] text-text-muted">{cat.count}개 아이템</p>
            </div>
            <button className="p-1.5 text-text-muted">
              <Pencil size={15} strokeWidth={1.5} />
            </button>
            {cat.editable && (
              <button onClick={() => removeCategory(cat.id)} className="p-1.5 text-red-400">
                <X size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
