"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Bookmark, Settings } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/search", icon: Search, label: "검색" },
  { href: "/collections", icon: Bookmark, label: "컬렉션" },
  { href: "/settings", icon: Settings, label: "설정" },
];

const HIDDEN_PATHS = ["/onboarding", "/login", "/signup"];

export default function Sidebar() {
  const pathname = usePathname();

  const shouldHide = HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-border-light z-50 px-4 py-6">
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
        <Image src="/logo.png" alt="Loom" width={28} height={28} className="object-contain" />
        <span className="text-[18px] font-semibold text-text-primary tracking-tight">Loom</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                active
                  ? "bg-surface-soft text-text-primary"
                  : "text-text-muted hover:bg-surface-soft hover:text-text-primary"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/save"
        className="flex items-center justify-center gap-2 bg-brand-purple text-white rounded-xl py-3 text-[14px] font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus size={16} strokeWidth={2.5} />
        새로 저장
      </Link>
    </aside>
  );
}

