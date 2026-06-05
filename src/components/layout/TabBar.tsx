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
  "/reset-password",
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
                {/* FAB: active:scale-90 + spring 이징으로 탄성 프레스감 */}
                <div className="w-11 h-11 rounded-full bg-[var(--profile-accent)] flex items-center justify-center -mt-3 shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition-[transform,colors] active:scale-90" style={{ transitionTimingFunction: "var(--ease-spring)", transitionDuration: "var(--dur-press)" }}>
                  <Plus size={22} strokeWidth={2.5} style={{ color: "var(--profile-on-accent)" }} />
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
              {/* 활성 탭: 아이콘을 살짝 위로 띄워 공중에 뜨는 느낌 */}
              <Icon
                size={22}
                className={`transition-transform ${active ? "text-text-primary -translate-y-0.5" : "text-text-muted translate-y-0"}`}
                style={{ transitionDuration: "var(--dur-press)", transitionTimingFunction: "var(--ease-spring)" }}
                strokeWidth={active ? 2 : 1.5}
              />
              <span
                className={`text-[10px] ${
                  active ? "text-text-primary font-semibold" : "text-text-muted"
                }`}
              >
                {tab.label}
              </span>
              {/* 활성 dot: scale 0→1 spring 팝 */}
              <span
                className={`block w-1 h-1 rounded-full mt-0.5 ${active ? "tab-dot-active" : "opacity-0 scale-0"}`}
                style={{ backgroundColor: active ? "var(--profile-accent)" : "transparent" }}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

