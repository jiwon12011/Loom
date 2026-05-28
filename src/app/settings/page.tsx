"use client";

import { useState, useEffect } from "react";
import { ChevronRight, User, Moon, Database, CreditCard, Bell, Shield, HelpCircle, LogOut, Tags } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { supabase } from "@/lib/supabase";
import { PROFILE_ICON_STORAGE_KEY, getProfileIcon } from "@/lib/profile-icons";
import { useToast } from "@/components/ui/Toast";
import { getStoredTheme, setStoredTheme, getThemeLabel, type ThemeMode } from "@/lib/theme";
import BottomSheet from "@/components/ui/BottomSheet";

export default function SettingsPage() {
  const router = useRouter();
  const { show } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [profileIconId, setProfileIconId] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { count } = await supabase
        .from("items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setItemCount(count ?? 0);
      setProfileIconId(localStorage.getItem(PROFILE_ICON_STORAGE_KEY));
      setThemeMode(getStoredTheme());
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/onboarding");
  };

  const profileIcon = getProfileIcon(profileIconId);

  const handleComingSoon = (feature: string) => {
    show(`${feature} 기능은 준비 중이에요.`, "success");
  };

  const settingsGroups = [
    {
      title: "계정",
      items: [
        { icon: User, label: "계정 정보", desc: email || "-", href: "/settings/account" },
        { icon: CreditCard, label: "구독 관리", desc: `Free · ${itemCount}/100`, href: "/settings/subscription" },
      ],
    },
    {
      title: "앱 설정",
      items: [
        { icon: Moon, label: "다크모드", desc: getThemeLabel(themeMode), onTap: () => setShowThemePicker(true) },
        { icon: Bell, label: "알림 설정", desc: "", onTap: () => handleComingSoon("알림 설정") },
        { icon: Tags, label: "카테고리 관리", desc: "", href: "/settings/categories" },
        { icon: Database, label: "저장 용량", desc: `${itemCount}개`, href: "/settings/subscription" },
      ],
    },
    {
      title: "기타",
      items: [
        { icon: Shield, label: "개인정보 처리방침", desc: "", href: "/settings/privacy" },
        { icon: HelpCircle, label: "도움말", desc: "", href: "/settings/help" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-5 pt-14 pb-3 bg-surface">
        <h1 className="text-[20px] font-bold text-text-primary">설정</h1>
      </header>

      <Link href="/settings/account">
        <section className="px-5 py-4 bg-surface mb-2 active:bg-surface-soft transition-colors">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full bg-surface-section overflow-hidden flex items-center justify-center">
              <Image src={profileIcon.image} alt="" fill sizes="56px" className="object-cover scale-[1.08] translate-y-[2px]" />
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-text-primary">{email ? email.split("@")[0] : "사용자"}</p>
              <p className="text-[13px] text-text-muted mt-0.5">Free 플랜 · {itemCount}개 저장됨</p>
            </div>
            <ChevronRight size={18} className="text-text-muted" />
          </div>
        </section>
      </Link>

      {settingsGroups.map((group) => (
        <section key={group.title} className="bg-surface mb-2">
          <p className="px-5 pt-4 pb-2 text-[12px] font-semibold text-text-muted uppercase tracking-wider">{group.title}</p>
          {group.items.map((item) => {
            const { icon: Icon, label, desc } = item;
            const inner = (
              <div className="w-full flex items-center gap-4 px-5 py-3.5 active:bg-surface-soft transition-colors">
                <Icon size={20} className="text-text-muted" strokeWidth={1.5} />
                <span className="flex-1 text-left text-[15px] text-text-primary">{label}</span>
                {desc && <span className="text-[13px] text-text-muted">{desc}</span>}
                <ChevronRight size={16} className="text-text-placeholder" />
              </div>
            );
            if ("href" in item && item.href) {
              return <Link key={label} href={item.href}>{inner}</Link>;
            }
            return <button key={label} onClick={"onTap" in item ? item.onTap : undefined} className="w-full">{inner}</button>;
          })}
        </section>
      ))}

      <section className="bg-surface mt-2 mb-8">
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-5 py-4 active:bg-surface-soft transition-colors">
          <LogOut size={20} className="text-red-400" strokeWidth={1.5} />
          <span className="text-[15px] text-red-400">로그아웃</span>
        </button>
      </section>

      <p className="text-center text-[12px] text-text-placeholder pb-8">Loom v1.0.0</p>

      <BottomSheet open={showThemePicker} onClose={() => setShowThemePicker(false)} title="다크모드">
        <div className="space-y-1">
          {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setStoredTheme(mode); setThemeMode(mode); setShowThemePicker(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                themeMode === mode ? "bg-surface-soft" : "active:bg-surface-soft"
              }`}
            >
              <span className="text-[15px] text-text-primary">{getThemeLabel(mode)}</span>
              {themeMode === mode && (
                <span className="text-[13px] font-semibold text-brand-purple">✓</span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="로그아웃"
        message="정말 로그아웃 하시겠어요?"
        confirmLabel="로그아웃"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
