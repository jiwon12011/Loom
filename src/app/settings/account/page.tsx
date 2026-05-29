"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Calendar, Database, Trash2, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BottomSheet from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { PROFILE_ICONS, PROFILE_ICON_STORAGE_KEY, PROFILE_THEME_EVENT, DEFAULT_PROFILE_ICON_ID, getProfileIcon } from "@/lib/profile-icons";

export default function AccountPage() {
  const router = useRouter();
  const { show } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [email, setEmail] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [profileIconId, setProfileIconId] = useState(DEFAULT_PROFILE_ICON_ID);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setJoinedAt(new Date(user.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }));
      const { count } = await supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      setItemCount(count ?? 0);
      setProfileIconId(localStorage.getItem(PROFILE_ICON_STORAGE_KEY) ?? DEFAULT_PROFILE_ICON_ID);
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/onboarding");
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      show("발송 실패. 다시 시도해주세요.", "error");
    } else {
      show("비밀번호 변경 이메일을 발송했어요", "success");
    }
  };

  const handleSelectProfileIcon = (iconId: string) => {
    localStorage.setItem(PROFILE_ICON_STORAGE_KEY, iconId);
    window.dispatchEvent(new Event(PROFILE_THEME_EVENT));
    setProfileIconId(iconId);
    setShowIconPicker(false);
    show("프로필 아이콘이 변경되었어요", "success");
  };

  const profileIcon = getProfileIcon(profileIconId);

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-5 pt-14 pb-3 flex items-center gap-3 bg-surface">
        <button onClick={() => router.back()} className="p-2.5 -ml-1 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-bold text-text-primary">계정 정보</h1>
      </header>

      <section className="bg-surface mt-2 px-5 py-6 flex flex-col items-center">
        <button
          onClick={() => setShowIconPicker(true)}
          className="flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <span className="relative w-20 h-20 rounded-full bg-surface-section overflow-hidden flex items-center justify-center">
            <Image src={profileIcon.image} alt="" fill sizes="80px" className="object-cover scale-[1.08] translate-y-[3px]" priority />
          </span>
          <span className="text-[13px] font-semibold text-brand-purple">프로필 아이콘 변경</span>
        </button>
      </section>

      <section className="bg-surface mt-2">
        {[
          { icon: Mail, label: "이메일", value: email || "-" },
          { icon: Calendar, label: "가입일", value: joinedAt || "-" },
          { icon: Database, label: "저장된 아이템", value: `${itemCount}개` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4 border-b border-border-light last:border-0">
            <Icon size={20} className="text-text-muted" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-[13px] text-text-muted">{label}</p>
              <p className="text-[15px] text-text-primary font-medium">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-surface mt-2">
        <button onClick={handlePasswordReset} className="w-full px-5 py-4 text-left active:bg-surface-soft transition-colors">
          <p className="text-[15px] text-text-primary">비밀번호 변경</p>
          <p className="text-[13px] text-text-muted mt-0.5">이메일로 비밀번호 재설정 링크를 보내드려요</p>
        </button>
      </section>

      <section className="bg-surface mt-2">
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-5 py-4 active:bg-surface-soft transition-colors">
          <LogOut size={20} className="text-text-muted" strokeWidth={1.5} />
          <p className="text-[15px] text-text-primary">로그아웃</p>
        </button>
      </section>

      <section className="bg-surface mt-8">
        <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-4 px-5 py-4 active:bg-red-500/10 transition-colors">
          <Trash2 size={20} className="text-red-400" strokeWidth={1.5} />
          <div>
            <p className="text-[15px] text-red-400 font-medium">계정 삭제</p>
            <p className="text-[12px] text-text-muted">모든 데이터가 영구적으로 삭제됩니다.</p>
          </div>
        </button>
      </section>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="로그아웃"
        message="로그아웃 하시겠어요?"
        confirmLabel="로그아웃"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <BottomSheet open={showIconPicker} onClose={() => setShowIconPicker(false)} title="프로필 아이콘 선택">
        <div className="grid grid-cols-4 gap-3">
          {PROFILE_ICONS.map((icon) => (
            <button
              key={icon.id}
              onClick={() => handleSelectProfileIcon(icon.id)}
              aria-label={icon.label}
              className={`flex aspect-square items-center justify-center rounded-2xl border transition-all ${
                profileIconId === icon.id
                  ? "border-brand-purple bg-surface-warm shadow-card"
                  : "border-border-light bg-surface active:bg-surface-soft"
              }`}
            >
              <span className="relative h-14 w-14 overflow-hidden rounded-full bg-surface-section">
                <Image src={icon.image} alt="" fill sizes="56px" className="object-cover scale-[1.08] translate-y-[2px]" />
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="계정을 삭제하시겠어요?"
        message="모든 저장된 아이템, 컬렉션, 태그가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        danger
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const uid = user.id;
          await supabase.from("notifications").delete().eq("user_id", uid);
          await supabase.from("collection_items").delete().in(
            "collection_id",
            (await supabase.from("collections").select("id").eq("user_id", uid)).data?.map(c => c.id) ?? []
          );
          await supabase.from("collections").delete().eq("user_id", uid);
          await supabase.from("item_images").delete().eq("user_id", uid);
          await supabase.from("user_categories").delete().eq("user_id", uid);
          await supabase.from("items").delete().eq("user_id", uid);
          await supabase.auth.signOut();
          localStorage.removeItem(PROFILE_ICON_STORAGE_KEY);
          show("계정이 삭제되었어요.", "success");
          router.replace("/onboarding");
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
