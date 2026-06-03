"use client";

import {
  ResponsiveContainer, LineChart, Line, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { aiDailyStats, aiTodayStats, contentTypeDist, recentAiJobs } from "@/lib/admin-mock";
import { CheckCircle, XCircle, Clock, DollarSign, Zap, AlertTriangle } from "lucide-react";

const CARD_STYLE = { background: "#181527", borderColor: "rgba(139,126,168,0.12)" };
const GRID_COLOR = "rgba(139,126,168,0.08)";
const AXIS_COLOR = "#6b6485";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg border text-xs space-y-0.5"
      style={{ background: "#1e1a30", borderColor: "rgba(139,126,168,0.2)", color: "#e0dcf0" }}
    >
      <p style={{ color: "#9991b8" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === "number" && p.value < 10 ? `$${p.value}` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function GaugeRing({ pct, color, size = 96 }: { pct: number; color: string; size?: number }) {
  const r = 38, cx = 50, cy = 50, circum = 2 * Math.PI * r;
  const dash = (pct / 100) * circum;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle r={r} cx={cx} cy={cy} fill="none" stroke="rgba(139,126,168,0.1)" strokeWidth="10" />
      <circle
        r={r} cx={cx} cy={cy}
        fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circum - dash}`}
        strokeDashoffset={circum / 4}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffffff">
        {pct}%
      </text>
    </svg>
  );
}

function JobTypeBadge({ type }: { type: "text" | "link" | "image" | "mixed" }) {
  const map = {
    text: { label: "텍스트", color: "#a78bfa" },
    link: { label: "링크", color: "#60a5fa" },
    image: { label: "이미지", color: "#34d399" },
    mixed: { label: "Mixed", color: "#fbbf24" },
  };
  const { label, color } = map[type];
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{ background: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

export default function AiPage() {
  const t = aiTodayStats;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-white text-xl font-bold">AI 모니터링</h1>
        <p style={{ color: "#7a7494", fontSize: 13, marginTop: 4 }}>
          GPT-4o-mini 처리 현황 · 비용 추적 · 품질 지표
        </p>
      </div>

      {/* today KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* success rate gauge */}
        <div className="rounded-2xl border p-5 flex items-center gap-5" style={CARD_STYLE}>
          <GaugeRing pct={t.successRate} color="#34d399" />
          <div>
            <p style={{ color: "#7a7494", fontSize: 11 }}>성공률 (오늘)</p>
            <p className="text-white text-lg font-bold mt-1">{t.processed.toLocaleString()}건</p>
            <p className="text-xs mt-1" style={{ color: "#f87171" }}>실패 {t.failed}건</p>
          </div>
        </div>

        {/* avg time */}
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} style={{ color: "#60a5fa" }} />
            <p style={{ color: "#7a7494", fontSize: 11 }}>평균 처리 시간</p>
          </div>
          <p className="text-white text-2xl font-bold">
            {(t.avgMs / 1000).toFixed(1)}
            <span className="text-sm font-normal text-white/50 ml-1">초</span>
          </p>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(96,165,250,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: "58%", background: "#60a5fa" }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: "#6b6485" }}>목표 &lt; 3.0초</p>
        </div>

        {/* cost + queue */}
        <div className="rounded-2xl border p-5 col-span-2 lg:col-span-1" style={CARD_STYLE}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={14} style={{ color: "#fbbf24" }} />
            <p style={{ color: "#7a7494", fontSize: 11 }}>오늘 GPT 비용</p>
          </div>
          <p className="text-white text-2xl font-bold">
            ${t.costUsd.toFixed(2)}
          </p>
          <div
            className="mt-3 flex items-center gap-2 rounded-lg p-2"
            style={{ background: t.queuePending > 0 ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)" }}
          >
            {t.queuePending > 0
              ? <AlertTriangle size={12} style={{ color: "#fbbf24" }} />
              : <CheckCircle size={12} style={{ color: "#34d399" }} />}
            <span className="text-xs" style={{ color: t.queuePending > 0 ? "#fbbf24" : "#34d399" }}>
              {t.queuePending > 0 ? `대기 중 ${t.queuePending}건` : "큐 정상"}
            </span>
          </div>
        </div>
      </div>

      {/* trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* processed + failed bar */}
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">일별 처리량 (14일)</p>
          <ResponsiveContainer width="100%" height={170}>
            <ComposedChart data={aiDailyStats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="processed" name="성공" fill="#34d399" radius={[3, 3, 0, 0]} opacity={0.8} stackId="a" />
              <Bar dataKey="failed" name="실패" fill="#f87171" radius={[3, 3, 0, 0]} opacity={0.85} stackId="a" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* avg processing time trend */}
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">평균 처리 시간 추이 (ms)</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={aiDailyStats} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="avgMs"
                name="처리시간(ms)"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* cost + content type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* daily cost line */}
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">일별 GPT 비용 (USD)</p>
          <ResponsiveContainer width="100%" height={155}>
            <LineChart data={aiDailyStats} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="costUsd"
                name="비용"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#fbbf24", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* content type dist */}
        <div className="rounded-2xl border p-5" style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">콘텐츠 타입 분포</p>
          <div className="space-y-3">
            {contentTypeDist.map(c => (
              <div key={c.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: c.color }}>{c.name}</span>
                  <span className="text-xs font-medium text-white">{c.value}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(139,126,168,0.1)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.value}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#6b6485" }}>
            이미지 처리는 OCR + AI 분석으로 평균 3.8초 소요 (텍스트 대비 1.6배)
          </p>
        </div>
      </div>

      {/* recent jobs feed */}
      <div className="rounded-2xl border overflow-hidden" style={CARD_STYLE}>
        <p className="text-white text-sm font-medium px-5 py-4">
          최근 AI 처리 내역
        </p>
        <div>
          {recentAiJobs.map((job, i) => (
            <div
              key={job.id}
              className="flex items-center gap-3 px-5 py-3"
              style={{
                borderTop: i > 0 ? "1px solid rgba(139,126,168,0.06)" : undefined,
              }}
            >
              {job.status === "done"
                ? <CheckCircle size={14} style={{ color: "#34d399", flexShrink: 0 }} />
                : <XCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />}

              <span className="text-xs font-mono" style={{ color: "#9991b8" }}>{job.id}</span>
              <JobTypeBadge type={job.type} />
              <span className="ml-auto text-xs" style={{ color: "#6b6485" }}>
                {job.status === "done" ? `${job.ms}ms` : "실패"}
              </span>
              <span className="text-xs" style={{ color: "#4a4565" }}>
                {job.minsAgo}분 전
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
