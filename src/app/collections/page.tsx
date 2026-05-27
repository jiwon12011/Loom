"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, MoreHorizontal, Pencil, Palette, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BottomSheet from "@/components/ui/BottomSheet";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { FOLDERS, getFolderByDescription } from "@/lib/folders";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  item_count: number;
};

export default function CollectionsPage() {
  const { show } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(FOLDERS[0].id);
  const [creating, setCreating] = useState(false);

  const [menuTarget, setMenuTarget] = useState<Collection | null>(null);
  const [editTarget, setEditTarget] = useState<Collection | null>(null);

  const [showRename, setShowRename] = useState(false);
  const [renameName, setRenameName] = useState("");

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorFolder, setColorFolder] = useState(FOLDERS[0].id);

  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  const fetchCollections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("collections")
      .select("id, name, description, item_count")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const collectionsWithCounts = await Promise.all((data ?? []).map(async (collection) => {
      const { count } = await supabase
        .from("collection_items")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", collection.id);
      return { ...collection, item_count: count ?? collection.item_count ?? 0 };
    }));

    setCollections(collectionsWithCounts);
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
      description: `folder:${selectedFolder}`,
    });
    setCreating(false);
    if (error) {
      show("생성 실패. 다시 시도해주세요.", "error");
    } else {
      show(`'${newName}' 컬렉션이 생성되었어요`, "success");
      setShowCreate(false);
      setNewName("");
      setSelectedFolder(FOLDERS[0].id);
      fetchCollections();
    }
  };

  const openMenu = (e: React.MouseEvent, col: Collection) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuTarget(col);
  };

  const startRename = () => {
    if (!menuTarget) return;
    setEditTarget(menuTarget);
    setRenameName(menuTarget.name);
    setMenuTarget(null);
    setTimeout(() => setShowRename(true), 150);
  };

  const handleRename = async () => {
    const trimmed = renameName.trim();
    if (!trimmed || !editTarget) return;
    await supabase.from("collections").update({ name: trimmed }).eq("id", editTarget.id);
    setCollections(prev => prev.map(c => c.id === editTarget.id ? { ...c, name: trimmed } : c));
    setShowRename(false);
    setEditTarget(null);
    show("이름이 변경되었어요", "success");
  };

  const startColorChange = () => {
    if (!menuTarget) return;
    setEditTarget(menuTarget);
    const current = getFolderByDescription(menuTarget.description, 0);
    setColorFolder(current.id);
    setMenuTarget(null);
    setTimeout(() => setShowColorPicker(true), 150);
  };

  const handleColorChange = async () => {
    if (!editTarget) return;
    const newDesc = `folder:${colorFolder}`;
    await supabase.from("collections").update({ description: newDesc }).eq("id", editTarget.id);
    setCollections(prev => prev.map(c => c.id === editTarget.id ? { ...c, description: newDesc } : c));
    setShowColorPicker(false);
    setEditTarget(null);
    show("폴더 색상이 변경되었어요", "success");
  };

  const startDelete = () => {
    if (!menuTarget) return;
    const target = menuTarget;
    setMenuTarget(null);
    setTimeout(() => setDeleteTarget(target), 200);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const colId = deleteTarget.id;
    setDeleteTarget(null);

    const { error: itemsErr } = await supabase.from("collection_items").delete().eq("collection_id", colId);
    if (itemsErr) {
      show("삭제 실패. 다시 시도해주세요.", "error");
      return;
    }
    const { error: colErr } = await supabase.from("collections").delete().eq("id", colId);
    if (colErr) {
      show("삭제 실패. 다시 시도해주세요.", "error");
      return;
    }
    setCollections(prev => prev.filter(c => c.id !== colId));
    show("컬렉션이 삭제되었어요", "success");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-text-primary">컬렉션</h1>
        <button onClick={() => setShowCreate(true)} className="p-2.5 -mr-1 text-text-muted">
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
        <div className="px-5 pt-2 pb-24">
          {collections.map((col, i) => {
            const folder = getFolderByDescription(col.description, i);
            return (
              <Link key={col.id} href={`/collections/${col.id}`} className="block">
                <div className="flex min-h-[82px] items-center gap-4 border-b border-border-light px-0 py-4 transition-colors active:bg-surface-soft">
                  <div className="relative h-12 w-14 flex-shrink-0">
                    <Image src={folder.image} alt="" fill sizes="56px" className="object-contain" priority={i < 4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-text-primary leading-tight truncate">{col.name}</p>
                    <p className="text-[13px] font-medium text-text-muted mt-1">{col.item_count}개</p>
                  </div>
                  <button
                    aria-label={`${col.name} 더보기`}
                    className="p-2 text-text-muted transition-colors hover:text-text-primary"
                    onClick={(e) => openMenu(e, col)}
                  >
                    <MoreHorizontal size={20} strokeWidth={1.8} />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create */}
      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="새 컬렉션">
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-semibold text-text-secondary mb-2 block">컬렉션 이름</label>
            <input
              type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()} placeholder="예) 마케팅 레퍼런스" autoFocus
              className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-text-secondary mb-3 block">폴더 색상</label>
            <div className="grid grid-cols-4 gap-3">
              {FOLDERS.map((folder) => (
                <button key={folder.id} type="button" onClick={() => setSelectedFolder(folder.id)}
                  className={`flex h-16 items-center justify-center rounded-xl border transition-all ${
                    selectedFolder === folder.id ? "border-brand-purple bg-surface-warm shadow-card" : "border-border-light bg-white active:bg-surface-soft"
                  }`}>
                  <span className="relative h-10 w-12">
                    <Image src={folder.image} alt="" fill sizes="48px" className="object-contain" />
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreate} disabled={!newName.trim() || creating}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
              newName.trim() && !creating ? "bg-brand-purple text-white" : "bg-surface-section text-text-muted"
            }`}>
            {creating && <Loader2 size={16} className="animate-spin" />}
            만들기
          </button>
        </div>
      </BottomSheet>

      {/* Menu */}
      <BottomSheet open={!!menuTarget} onClose={() => setMenuTarget(null)} title={menuTarget?.name ?? ""}>
        <div className="space-y-1">
          <button onClick={startRename}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors active:bg-surface-soft">
            <Pencil size={18} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[15px] text-text-primary">이름 변경</span>
          </button>
          <button onClick={startColorChange}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors active:bg-surface-soft">
            <Palette size={18} className="text-text-muted" strokeWidth={1.5} />
            <span className="text-[15px] text-text-primary">폴더 색상 변경</span>
          </button>
          <button onClick={startDelete}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors active:bg-surface-soft">
            <Trash2 size={18} className="text-red-400" strokeWidth={1.5} />
            <span className="text-[15px] text-red-400">컬렉션 삭제</span>
          </button>
        </div>
      </BottomSheet>

      {/* Rename */}
      <BottomSheet open={showRename} onClose={() => { setShowRename(false); setEditTarget(null); }} title="이름 변경">
        <div className="space-y-4">
          <input type="text" value={renameName} onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()} autoFocus
            className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-brand-purple transition-colors"
          />
          <button onClick={handleRename} disabled={!renameName.trim()}
            className={`w-full py-4 rounded-xl text-[15px] font-semibold transition-all ${
              renameName.trim() ? "bg-brand-purple text-white" : "bg-surface-section text-text-muted"
            }`}>
            변경하기
          </button>
        </div>
      </BottomSheet>

      {/* Color Picker */}
      <BottomSheet open={showColorPicker} onClose={() => { setShowColorPicker(false); setEditTarget(null); }} title="폴더 색상 변경">
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {FOLDERS.map((folder) => (
              <button key={folder.id} type="button" onClick={() => setColorFolder(folder.id)}
                className={`flex h-16 items-center justify-center rounded-xl border transition-all ${
                  colorFolder === folder.id ? "border-brand-purple bg-surface-warm shadow-card" : "border-border-light bg-white active:bg-surface-soft"
                }`}>
                <span className="relative h-10 w-12">
                  <Image src={folder.image} alt="" fill sizes="48px" className="object-contain" />
                </span>
              </button>
            ))}
          </div>
          <button onClick={handleColorChange}
            className="w-full py-4 rounded-xl text-[15px] font-semibold bg-brand-purple text-white transition-all">
            변경하기
          </button>
        </div>
      </BottomSheet>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="컬렉션 삭제"
        message={
          deleteTarget && deleteTarget.item_count > 0
            ? `"${deleteTarget.name}" 컬렉션을 삭제할까요? 안의 ${deleteTarget.item_count}개 아이템은 삭제되지 않아요.`
            : `"${deleteTarget?.name}" 컬렉션을 삭제할까요?`
        }
        confirmLabel="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
