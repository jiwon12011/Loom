"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import BottomSheet from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

const COLORS = ["#D4BFA8", "#A99ABF", "#8BC6A8", "#8B7EA8", "#C4A87E", "#E8A8A8"];

type Collection = {
  id: string;
  name: string;
  description: string | null;
  item_count: number;
  color?: string;
};

export default function CollectionsPage() {
  const { show } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [creating, setCreating] = useState(false);

  const fetchCollections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("collections")
      .select("id, name, description, item_count")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCollections(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCollections(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("collections").insert({
      user_id: user.id,
      name: newName.trim(),
    });
    setCreating(false);
    if (error) {
      show("생성 실패. 다시 시도해주세요.", "error");
    } else {
      show(`'${newName}' 컬렉션이 생성되었어요`, "success");
      setShowCreate(false);
      setNewName("");
      fetchCollections();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-text-primary">컬렉션</h1>
        <button onClick={() => setShowCreate(true)} className="p-1.5 text-text-muted">
          <Plus size={22} strokeWidth={1.5} />
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center pt-20">
          <Loader2 size={24} className="animate-spin text-brand-purple" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 px-8">
          <p className="text-[18px] font-bold text-text-primary mb-2">컬렉션이 없어요</p>
          <p className="text-[14px] text-text-muted mb-8">+ 버튼을 눌러 컬렉션을 만들어보세요</p>
        </div>
      ) : (
        <div className="px-5 pt-2 space-y-1">
          {collections.map((col, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <Link key={col.id} href={`/collections/${col.id}`}>
                <div className="flex items-center gap-4 py-4 border-b border-border-light active:bg-surface-soft transition-colors rounded-lg px-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "30" }}>
                    <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-text-primary">{col.name}</p>
                    <p className="text-[12px] text-text-muted mt-0.5">{col.item_count}개</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="새 컬렉션">
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">컬렉션 이름</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="예) 마케팅 레퍼런스"
              autoFocus
              className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">컬러</label>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${selectedColor === c ? "ring-2 ring-offset-2 ring-text-primary scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button onClick={handleCreate} disabled={!newName.trim() || creating}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
              newName.trim() && !creating ? "bg-text-primary text-white" : "bg-surface-section text-text-muted"
            }`}>
            {creating && <Loader2 size={16} className="animate-spin" />}
            만들기
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
