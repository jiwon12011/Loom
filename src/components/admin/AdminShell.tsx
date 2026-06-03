"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, BarChart3, Cpu, ArrowLeft, Menu, X
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계/분석", icon: BarChart3 },
  { href: "/admin/ai", label: "AI 모니터링", icon: Cpu },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <span className="text-violet-300 text-xs font-bold">L</span>
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-none">Loom</p>
          <p className="text-[11px] text-violet-400/70 mt-0.5">Admin</p>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-violet-500/15 text-violet-300 font-medium"
                  : "text-[#9991b8] hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} className={active ? "text-violet-400" : "opacity-70"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* back to app */}
      <div className="px-3 pb-5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9991b8] hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={15} className="opacity-60" />
          앱으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = NAV.find(n =>
    n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex"
      style={{ background: "#0c0a16", fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}
    >
      {/* desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r"
        style={{ background: "#100e1f", borderColor: "rgba(139,126,168,0.1)" }}
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative w-[220px] flex flex-col"
            style={{ background: "#100e1f", borderRight: "1px solid rgba(139,126,168,0.1)" }}
          >
            <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* top bar */}
        <header
          className="flex items-center gap-3 px-5 h-14 flex-shrink-0 border-b"
          style={{ borderColor: "rgba(139,126,168,0.08)" }}
        >
          <button
            className="md:hidden p-1.5 rounded-lg text-[#9991b8] hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
          <span className="text-white/80 text-sm font-medium">
            {currentPage?.label ?? "Admin"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}
            >
              관리자
            </span>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
