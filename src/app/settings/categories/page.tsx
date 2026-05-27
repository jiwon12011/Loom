"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, GripVertical, X, Pencil, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import {
  DEFAULT_CATEGORIES,
  UserCategory,
  fetchUserCategories,
  addUserCategory,
  updateUserCategory,
  deleteUserCategory,
  getCategoryCounts,
} from "@/lib/categories";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  isDefault: boolean;
  dbId: string | null;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { show } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [custom, counts] = await Promise.all([
        fetchUserCategories(user.id),
        getCategoryCounts(user.id),
      ]);

      const defaultItems: CategoryItem[] = DEFAULT_CATEGORIES.map((name, i) => ({
        id: `default-${i}`,
        name,
        count: counts[name] ?? 0,
        isDefault: true,
        dbId: null,
      }));

      const customNames = new Set(DEFAULT_CATEGORIES);
      const customItems: CategoryItem[] = custom
        .filter((c) => !customNames.has(c.name))
        .map((c) => ({
          id: c.id,
          name: c.name,
          count: counts[c.name] ?? 0,
          isDefault: false,
          dbId: c.id,
        }));

      setCategories([...defaultItems, ...customItems]);
      setLoading(false);
    };
    load();
  }, []);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.name === trimmed)) {
      show("이미 존재하는 카테고리예요.", "error");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const result = await addUserCategory(user.id, trimmed, categories.length);
    if (!result) {
      show("추가 실패. 다시 시도해주세요.", "error");
      return;
    }

    setCategories([
      ...categories,
      { id: result.id, name: trimmed, count: 0, isDefault: false, dbId: result.id },
    ]);
    setNewName("");
    setAdding(false);
    show("카테고리 추가 완료", "success");
  };

  const handleEdit = async (cat: CategoryItem) => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === cat.name) {
      setEditingId(null);
      return;
    }

    if (categories.some((c) => c.name === trimmed && c.id !== cat.id)) {
      show("이미 존재하는 이름이에요.", "error");
      return;
    }

    if (cat.dbId) {
      await updateUserCategory(cat.dbId, trimmed);
    }

    if (cat.count > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("items")
          .update({ category: trimmed })
          .eq("user_id", user.id)
          .eq("category", cat.name);
      }
    }

    setCategories(
      categories.map((c) => (c.id === cat.id ? { ...c, name: trimmed } : c))
    );
    setEditingId(null);
    show("카테고리 수정 완료", "success");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.dbId) {
      await deleteUserCategory(deleteTarget.dbId);
    }

    if (deleteTarget.count > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("items")
          .update({ category: null })
          .eq("user_id", user.id)
          .eq("category", deleteTarget.name);
      }
    }

    setCategories(categories.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    show("카테고리 삭제 완료", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2.5 -ml-1 text-text-primary">
            <ArrowLeft size={22} strokeWidth={1.5} />
          </button>
          <h1 className="text-[18px] font-bold text-text-primary">카테고리 관리</h1>
        </div>
        <button onClick={() => setAdding(true)} className="p-2.5 -mr-1 text-brand-purple">
          <Plus size={22} strokeWidth={1.5} />
        </button>
      </header>

      <p className="px-5 py-3 text-[13px] text-text-muted bg-white border-b border-border-light">
        카테고리를 추가하거나 이름을 변경할 수 있어요.
      </p>

      {adding && (
        <div className="bg-white border-b border-border-light px-5 py-3 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="새 카테고리 이름"
            autoFocus
            className="flex-1 bg-surface-soft border border-border rounded-lg px-3 py-2.5 text-[14px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple"
          />
          <button onClick={handleAdd} className="text-[14px] text-brand-purple font-semibold px-2">
            추가
          </button>
          <button onClick={() => { setAdding(false); setNewName(""); }} className="text-text-muted">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="bg-white mt-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 px-5 py-3.5 border-b border-border-light last:border-0"
          >
            <GripVertical size={18} className="text-text-placeholder flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {editingId === cat.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEdit(cat);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="flex-1 bg-surface-soft border border-brand-purple rounded-lg px-3 py-1.5 text-[14px] text-text-primary outline-none"
                  />
                  <button onClick={() => handleEdit(cat)} className="p-1 text-brand-purple">
                    <Check size={16} strokeWidth={2} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-text-muted">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[15px] text-text-primary font-medium">{cat.name}</p>
                  <p className="text-[12px] text-text-muted">{cat.count}개 아이템</p>
                </>
              )}
            </div>
            {editingId !== cat.id && (
              <>
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                  className="p-1.5 text-text-muted"
                >
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 text-red-400"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="카테고리 삭제"
        message={
          deleteTarget && deleteTarget.count > 0
            ? `"${deleteTarget.name}" 카테고리를 삭제하면 ${deleteTarget.count}개 아이템의 카테고리가 해제됩니다.`
            : `"${deleteTarget?.name}" 카테고리를 삭제할까요?`
        }
        confirmLabel="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
