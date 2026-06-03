"use client";

import { useState, useMemo } from "react";
import { mockUsers } from "@/lib/admin-mock";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type SortKey = "createdAt" | "lastActiveAt" | "itemCount";
type SortDir = "asc" | "desc";

const CARD_STYLE = {
  background: "#181527",
  borderColor: "rgba(139,126,168,0.12)",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "2-digit", month: "short", day: "numeric" });
}

function daysAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return `${diff}일 전`;
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    let list = mockUsers;
    if (query) list = list.filter(u => u.email.includes(query.toLowerCase()));
    if (planFilter !== "all") list = list.filter(u => u.plan === planFilter);
    list = [...list].sort((a, b) => {
      const av = sortKey === "itemCount" ? a[sortKey] : new Date(a[sortKey]).getTime();
      const bv = sortKey === "itemCount" ? b[sortKey] : new Date(b[sortKey]).getTime();
      return sortDir === "desc" ? (bv as number) - (av as number) : (av as number) - (bv as number);
    });
    return list;
  }, [query, planFilter, sortKey, sortDir]);

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(0);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown size={12} className="opacity-30" />;
    return sortDir === "desc" ? <ChevronDown size={12} style={{ color: "#a78bfa" }} /> : <ChevronUp size={12} style={{ color: "#a78bfa" }} />;
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div>
        <h1 className="text-white text-xl font-bold">사용자 관리</h1>
        <p style={{ color: "#7a7494", fontSize: 13, marginTop: 4 }}>
          전체 {mockUsers.length.toLocaleString()}명 · 검색 결과 {filtered.length}명
        </p>
      </div>

      {/* summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체", value: mockUsers.length, color: "#a78bfa" },
          { label: "유료 (Pro)", value: mockUsers.filter(u => u.plan === "pro").length, color: "#34d399" },
          { label: "비활성", value: mockUsers.filter(u => u.status === "inactive").length, color: "#f87171" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4 border" style={CARD_STYLE}>
            <p style={{ color: "#7a7494", fontSize: 11 }}>{stat.label}</p>
            <p className="text-white text-xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[200px]"
          style={CARD_STYLE}
        >
          <Search size={14} style={{ color: "#6b6485" }} />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            placeholder="이메일 검색..."
            className="bg-transparent text-sm outline-none flex-1"
            style={{ color: "#e0dcf0" }}
          />
        </div>

        {(["all", "free", "pro"] as const).map(p => (
          <button
            key={p}
            onClick={() => { setPlanFilter(p); setPage(0); }}
            className="px-3 py-2 rounded-xl border text-xs font-medium transition-all"
            style={{
              ...CARD_STYLE,
              ...(planFilter === p
                ? { background: "rgba(167,139,250,0.15)", borderColor: "rgba(167,139,250,0.4)", color: "#c4b5fd" }
                : { color: "#9991b8" }),
            }}
          >
            {p === "all" ? "전체" : p === "pro" ? "Pro" : "무료"}
          </button>
        ))}
      </div>

      {/* table */}
      <div className="rounded-2xl border overflow-hidden" style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(139,126,168,0.1)" }}>
                {[
                  { label: "이메일", key: null },
                  { label: "가입일", key: "createdAt" as SortKey },
                  { label: "마지막 접속", key: "lastActiveAt" as SortKey },
                  { label: "저장 수", key: "itemCount" as SortKey },
                  { label: "플랜", key: null },
                  { label: "상태", key: null },
                ].map(col => (
                  <th
                    key={col.label}
                    className="px-4 py-3 text-left font-medium"
                    style={{ color: "#6b6485", fontSize: 11 }}
                  >
                    {col.key ? (
                      <button
                        className="flex items-center gap-1"
                        onClick={() => toggleSort(col.key!)}
                      >
                        {col.label}
                        <SortIcon k={col.key} />
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, i) => (
                <tr
                  key={user.id}
                  className="transition-colors"
                  style={{
                    borderBottom: i < paginated.length - 1 ? "1px solid rgba(139,126,168,0.06)" : undefined,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(167,139,250,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td className="px-4 py-3">
                    <span className="text-white">{user.email}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9991b8", whiteSpace: "nowrap" }}>
                    {fmt(user.createdAt)}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9991b8", whiteSpace: "nowrap" }}>
                    {daysAgo(user.lastActiveAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {user.itemCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={user.plan === "pro"
                        ? { background: "rgba(52,211,153,0.12)", color: "#34d399" }
                        : { background: "rgba(139,126,168,0.1)", color: "#9991b8" }}
                    >
                      {user.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={user.status === "active"
                        ? { background: "rgba(96,165,250,0.1)", color: "#60a5fa" }
                        : { background: "rgba(248,113,113,0.1)", color: "#f87171" }}
                    >
                      {user.status === "active" ? "활성" : "비활성"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "1px solid rgba(139,126,168,0.08)" }}
        >
          <p style={{ color: "#6b6485", fontSize: 12 }}>
            {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} / {filtered.length}명
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                style={i === page
                  ? { background: "rgba(167,139,250,0.2)", color: "#c4b5fd" }
                  : { color: "#6b6485" }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
