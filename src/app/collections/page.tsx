"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import BottomSheet from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import folderBlue from "../../../img/folder_blue.png";
import folderDarkgrey from "../../../img/folder_darkgrey.png";
import folderGreen from "../../../img/folder_green.png";
import folderGrey from "../../../img/folder_grey.png";
import folderPink from "../../../img/folder_pink.png";
import folderPurple from "../../../img/folder_purple.png";
import folderPurplepink from "../../../img/folder_purplepink.png";
import folderYellow from "../../../img/folder_yellow.png";

const FOLDERS: { id: string; label: string; image: StaticImageData }[] = [
  { id: "yellow", label: "옐로우", image: folderYellow },
  { id: "blue", label: "블루", image: folderBlue },
  { id: "green", label: "그린", image: folderGreen },
  { id: "purple", label: "퍼플", image: folderPurple },
  { id: "pink", label: "핑크", image: folderPink },
  { id: "purplepink", label: "라벤더", image: folderPurplepink },
  { id: "grey", label: "그레이", image: folderGrey },
  { id: "darkgrey", label: "다크 그레이", image: folderDarkgrey },
];

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

      return {
        ...collection,
        item_count: count ?? collection.item_count ?? 0,
      };
    }));

    setCollections(collectionsWithCounts);
    setLoading(false);
  };

  useEffect(() => { fetchCollections(); }, []);

  const getFolder = (collection: Collection, index: number) => {
    const folderId = collection.description?.startsWith("folder:")
      ? collection.description.replace("folder:", "")
      : null;
    return FOLDERS.find((folder) => folder.id === folderId) ?? FOLDERS[index % FOLDERS.length];
  };

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
        <div className="px-5 pt-2">
          {collections.map((col, i) => {
            const folder = getFolder(col, i);
            return (
              <Link key={col.id} href={`/collections/${col.id}`} className="block">
                <div className="flex min-h-[82px] items-center gap-4 border-b border-border-light px-0 py-4 transition-colors active:bg-surface-soft">
                  <div className="relative h-12 w-14 flex-shrink-0">
                    <Image
                      src={folder.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain"
                      priority={i < 4}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-text-primary leading-tight truncate">{col.name}</p>
                    <p className="text-[13px] font-medium text-text-muted mt-1">{col.item_count}개</p>
                  </div>
                  <button
                    aria-label={`${col.name} 더보기`}
                    className="p-2 text-text-muted transition-colors hover:text-text-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal size={20} strokeWidth={1.8} />
                  </button>
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
            <label className="text-[13px] font-semibold text-text-secondary mb-3 block">폴더 색상</label>
            <div className="grid grid-cols-4 gap-3">
              {FOLDERS.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolder(folder.id)}
                  aria-label={`${folder.label} 폴더 선택`}
                  className={`flex h-16 items-center justify-center rounded-xl border transition-all ${
                    selectedFolder === folder.id
                      ? "border-brand-purple bg-surface-warm shadow-card"
                      : "border-border-light bg-white active:bg-surface-soft"
                  }`}
                >
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
    </div>
  );
}

