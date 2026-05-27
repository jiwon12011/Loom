"use client";

import { useState, useEffect } from "react";
import { ChevronRight, User, Moon, Database, CreditCard, Bell, Shield, HelpCircle, LogOut, Tags } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { supabase } from "@/lib/supabase";
import { PROFILE_ICON_STORAGE_KEY, getProfileIcon } from "@/lib/profile-icons";

export default function SettingsPage() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [profileIconId, setProfileIconId] = useState<string | null>(null);

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
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/onboarding");
  };

  const profileIcon = getProfileIcon(profileIconId);

  const settingsGroups = [
    {
      title: "계정",
      items: [
        { icon: User, label: "계정 정보", desc: email || "-", href: "/settings/account" },
        { icon: CreditCard, label: "구독 관리", desc: "Free 플랜", href: "/settings/subscription" },
      ],
    },
    {
      title: "앱 설정",
      items: [
        { icon: Moon, label: "다크모드", desc: "시스템 설정", href: "#" },
        { icon: Bell, label: "알림 설정", desc: "", href: "#" },
        { icon: Tags, label: "카테고리 관리", desc: "", href: "/settings/categories" },
        { icon: Database, label: "저장 용량", desc: `${itemCount}개`, href: "/settings/subscription" },
      ],
    },
    {
      title: "기타",
      items: [
        { icon: Shield, label: "개인정보 처리방침", desc: "", href: "#" },
        { icon: HelpCircle, label: "도움말", desc: "", href: "#" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="px-5 pt-14 pb-3 bg-white">
        <h1 className="text-[20px] font-bold text-text-primary">설정</h1>
      </header>

      <Link href="/settings/account">
        <section className="px-5 py-4 bg-white mb-2 active:bg-surface-soft transition-colors">
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
        <section key={group.title} className="bg-white mb-2">
          <p className="px-5 pt-4 pb-2 text-[12px] font-semibold text-text-muted uppercase tracking-wider">{group.title}</p>
          {group.items.map(({ icon: Icon, label, desc, href }) => (
            <Link key={label} href={href}>
              <div className="w-full flex items-center gap-4 px-5 py-3.5 active:bg-surface-soft transition-colors">
                <Icon size={20} className="text-text-muted" strokeWidth={1.5} />
                <span className="flex-1 text-left text-[15px] text-text-primary">{label}</span>
                {desc && <span className="text-[13px] text-text-muted">{desc}</span>}
                <ChevronRight size={16} className="text-text-placeholder" />
              </div>
            </Link>
          ))}
        </section>
      ))}

      <section className="bg-white mt-2 mb-8">
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-5 py-4 active:bg-surface-soft transition-colors">
          <LogOut size={20} className="text-red-400" strokeWidth={1.5} />
          <span className="text-[15px] text-red-400">로그아웃</span>
        </button>
      </section>

      <p className="text-center text-[12px] text-text-placeholder pb-8">Loom v1.0.0</p>

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
