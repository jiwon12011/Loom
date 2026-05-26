"use client";

import { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { mockCollections } from "@/lib/mock-data";
import Link from "next/link";
import BottomSheet from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";

const colors = ["#D4BFA8", "#A99ABF", "#8BC6A8", "#8B7EA8", "#C4A87E", "#E8A8A8"];

export default function CollectionsPage() {
  const { show } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    setShowCreate(false);
    setNewName("");
    show(`'${newName}' 컬렉션이 생성되었어요`, "success");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-text-primary">컬렉션</h1>
        <button onClick={() => setShowCreate(true)} className="p-1.5 text-text-muted">
          <Plus size={22} strokeWidth={1.5} />
        </button>
      </header>

      {/* Collections List */}
      <div className="px-5 pt-2 space-y-1">
        {mockCollections.map((col) => (
          <Link key={col.id} href={`/collections/${col.id}`}>
            <div className="flex items-center gap-4 py-4 border-b border-border-light active:bg-surface-soft transition-colors rounded-lg px-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: col.color + "20" }}
              >
                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: col.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-text-primary">{col.name}</p>
                <p className="text-[12px] text-text-muted mt-0.5">{col.item_count}개</p>
              </div>
              <button className="p-1.5 text-text-muted" onClick={(e) => e.preventDefault()}>
                <MoreHorizontal size={18} strokeWidth={1.5} />
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Collection Bottom Sheet */}
      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="새 컬렉션">
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">
              컬렉션 이름
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="예) 마케팅 레퍼런스"
              autoFocus
              className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">
              컬러
            </label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${
                    selectedColor === c ? "ring-2 ring-offset-2 ring-text-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            className={`w-full py-4 rounded-xl text-[15px] font-semibold transition-all ${
              newName.trim()
                ? "bg-text-primary text-white active:scale-[0.98]"
                : "bg-surface-section text-text-muted"
            }`}
            disabled={!newName.trim()}
          >
            만들기
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
