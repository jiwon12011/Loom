"use client";

import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area,
} from "recharts";
import {
  retentionCohorts, featureUsage, topSearches, emptySearches, signupTrend30,
} from "@/lib/admin-mock";

const CARD_STYLE = {
  background: "#181527",
  borderColor: "rgba(139,126,168,0.12)",
};
const GRID_COLOR = "rgba(139,126,168,0.08)";
const AXIS_COLOR = "#6b6485";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg border text-xs"
      style={{ background: "#1e1a30", borderColor: "rgba(139,126,168,0.2)", color: "#e0dcf0" }}
    >
      <p style={{ color: "#9991b8" }}>{label}</p>
      <p className="font-semibold mt-0.5">{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

function RetentionCell({ value }: { value: number | null }) {
  if (value === null)
    return (
      <td className="px-4 py-3 text-center" style={{ color: "#3d3a52", fontSize: 12 }}>
        —
      </td>
    );
  const color =
    value >= 60 ? "#34d399" :
    value >= 40 ? "#fbbf24" :
    value >= 20 ? "#f97316" : "#f87171";
  return (
    <td className="px-4 py-3 text-center">
      <span
        className="text-xs font-bold px-2.5 py-1 rounded-lg"
        style={{ background: `${color}18`, color }}
      >
        {value}%
      </span>
    </td>
  );
}

export default function AnalyticsPage() {
  const maxFeature = Math.max(...featureUsage.map(f => f.value));

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-white text-xl font-bold">통계 / 분석</h1>
        <p style={{ color: "#7a7494", fontSize: 13, marginTop: 4 }}>
          리텐션 · 기능 사용 · 검색어 분석
        </p>
      </div>

      {/* retention summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Day 1 리텐션", value: "72%", desc: "신규 → 다음날 재방문", color: "#34d399" },
          { label: "Day 7 리텐션", value: "48%", desc: "1주 뒤 재방문", color: "#fbbf24" },
          { label: "Day 30 리텐션", value: "29%", desc: "30일 뒤 재방문", color: "#f97316" },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-5 border" style={CARD_STYLE}>
            <p style={{ color: "#7a7494", fontSize: 11 }}>{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
            <p style={{ color: "#6b6485", fontSize: 11, marginTop: 4 }}>{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* cohort table + area chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* cohort */}
        <div className="rounded-2xl border overflow-hidden" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium px-5 pt-5 pb-4">코호트 리텐션</p>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(139,126,168,0.08)" }}>
                {["코호트", "신규", "Day 1", "Day 7", "Day 30"].map(h => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 font-medium ${h !== "코호트" ? "text-center" : "text-left"}`}
                    style={{ color: "#6b6485", fontSize: 11 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retentionCohorts.map((row, i) => (
                <tr
                  key={row.week}
                  style={{ borderBottom: i < retentionCohorts.length - 1 ? "1px solid rgba(139,126,168,0.06)" : undefined }}
                >
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: "#c4b5fd" }}>{row.week}</td>
                  <td className="px-4 py-3 text-center text-xs text-white">{row.users}</td>
                  <RetentionCell value={row.d1} />
                  <RetentionCell value={row.d7} />
                  <RetentionCell value={row.d30} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* signup area chart */}
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">가입자 추이 (30일)</p>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={signupTrend30} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} fill="url(#areaFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* feature usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">기능별 사용 빈도 (누적)</p>
          <div className="space-y-3">
            {featureUsage.map(f => (
              <div key={f.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: "#c4b5fd" }}>{f.name}</span>
                  <span className="text-xs font-medium text-white">{f.value.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(139,126,168,0.12)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(f.value / maxFeature) * 100}%`, background: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bar chart feature */}
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">기능별 사용량 차트</p>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart
              data={featureUsage}
              layout="vertical"
              margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9991b8" }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {featureUsage.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* search analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">인기 검색어 Top 10</p>
          <div className="space-y-2">
            {topSearches.map((s, i) => (
              <div key={s.query} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{
                    background: i < 3 ? "rgba(167,139,250,0.2)" : "rgba(139,126,168,0.08)",
                    color: i < 3 ? "#c4b5fd" : "#6b6485",
                  }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm" style={{ color: "#e0dcf0" }}>{s.query}</span>
                <span className="text-xs font-medium" style={{ color: "#9991b8" }}>
                  {s.count.toLocaleString()}회
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white text-sm font-medium">결과 없는 검색어</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
            >
              개선 필요
            </span>
          </div>
          <div className="space-y-2">
            {emptySearches.map((s, i) => (
              <div key={s.query} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(139,126,168,0.06)" }}>
                <span className="text-sm" style={{ color: "#c4b5fd" }}>{s.query}</span>
                <span className="text-xs font-medium" style={{ color: "#f87171" }}>
                  {s.count}회 미결
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#6b6485" }}>
            이 쿼리들에 대한 콘텐츠 추가 또는 AI 프롬프트 개선을 고려하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
