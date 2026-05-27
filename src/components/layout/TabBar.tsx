"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Bookmark, Settings } from "lucide-react";

const tabs = [
  { id: "home", href: "/", icon: Home, label: "홈" },
  { id: "search", href: "/search", icon: Search, label: "검색" },
  { id: "add", href: "/save", icon: Plus, label: "" },
  { id: "collections", href: "/collections", icon: Bookmark, label: "컬렉션" },
  { id: "settings", href: "/settings", icon: Settings, label: "설정" },
];

const HIDDEN_PATHS = [
  "/onboarding",
  "/login",
  "/signup",
  "/save",
  "/detail",
  "/notifications",
];

export default function TabBar() {
  const pathname = usePathname();

  const shouldHide = HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-surface border-t border-border-light safe-bottom md:absolute md:left-0 md:translate-x-0">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          if (tab.id === "add") {
            return (
              <Link key={tab.id} href={tab.href} aria-label="새로 저장" className="flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-[var(--profile-accent)] flex items-center justify-center -mt-3 shadow-[0_8px_22px_var(--profile-glow)] transition-colors">
                  <Plus size={22} className="text-white" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 w-16"
            >
              <Icon
                size={22}
                className={active ? "text-text-primary" : "text-text-muted"}
                strokeWidth={active ? 2 : 1.5}
              />
              <span
                className={`text-[10px] ${
                  active ? "text-text-primary font-semibold" : "text-text-muted"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

