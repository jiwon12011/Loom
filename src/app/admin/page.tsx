"use client";

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  dashboardStats, signupTrend30, saveTrend14, categoryDist, hourlyActivity,
} from "@/lib/admin-mock";
import { Users, Package, Activity, Zap, TrendingUp } from "lucide-react";

// ─── shared primitives ────────────────────────────────────────────────────────

const CARD = "rounded-2xl p-5 border" as const;
const CARD_STYLE = {
  background: "#181527",
  borderColor: "rgba(139,126,168,0.12)",
} as const;

const GRID_COLOR = "rgba(139,126,168,0.08)";
const AXIS_COLOR = "#6b6485";

function StatCard({
  label, value, sub, icon: Icon, color = "#a78bfa", positive,
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; color?: string; positive?: boolean;
}) {
  return (
    <div className={CARD} style={CARD_STYLE}>
      <div className="flex items-start justify-between">
        <div>
          <p style={{ color: "#7a7494", fontSize: 12 }}>{label}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          <p
            className="text-xs mt-1.5"
            style={{ color: positive === false ? "#f87171" : "#34d399" }}
          >
            {sub}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ─── tooltips ─────────────────────────────────────────────────────────────────

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

// ─── heatmap ──────────────────────────────────────────────────────────────────

function ActivityHeatmap() {
  const max = Math.max(...hourlyActivity.map(d => d.value));
  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {hourlyActivity.map(({ hour, value }) => {
          const intensity = value / max;
          return (
            <div
              key={hour}
              title={`${hour}시 : ${value}명`}
              className="relative group"
              style={{
                width: 26, height: 26,
                borderRadius: 6,
                background: `rgba(167,139,250,${0.07 + intensity * 0.73})`,
                border: "1px solid rgba(167,139,250,0.1)",
              }}
            >
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] rounded whitespace-nowrap pointer-events-none z-10 hidden group-hover:block"
                style={{ background: "#1e1a30", color: "#e0dcf0", border: "1px solid rgba(139,126,168,0.2)" }}
              >
                {hour}시 · {value}명
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span style={{ color: "#6b6485", fontSize: 10 }}>낮음</span>
        {[0.07, 0.25, 0.45, 0.65, 0.8].map((o, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(167,139,250,${o})` }} />
        ))}
        <span style={{ color: "#6b6485", fontSize: 10 }}>높음</span>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const s = dashboardStats;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-white text-xl font-bold">대시보드</h1>
        <p style={{ color: "#7a7494", fontSize: 13, marginTop: 4 }}>
          오늘 기준 · 실시간 현황
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="총 사용자"
          value={s.totalUsers.toLocaleString()}
          sub={`+${s.newUsersToday} 오늘 신규`}
          icon={Users}
          color="#a78bfa"
          positive
        />
        <StatCard
          label="DAU"
          value={s.dau.toLocaleString()}
          sub={`+${s.dauChangePct}% 어제 대비`}
          icon={Activity}
          color="#60a5fa"
          positive
        />
        <StatCard
          label="총 아이템"
          value={s.totalItems.toLocaleString()}
          sub={`+${s.newItemsToday} 오늘 저장`}
          icon={Package}
          color="#34d399"
          positive
        />
        <StatCard
          label="AI 처리 성공률"
          value={`${s.aiSuccessRate}%`}
          sub={`${s.aiSuccessRateChange > 0 ? "+" : ""}${s.aiSuccessRateChange}% 어제 대비`}
          icon={Zap}
          color="#fbbf24"
          positive
        />
      </div>

      {/* charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* signup trend */}
        <div className={`${CARD} lg:col-span-2`} style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white text-sm font-medium">가입자 추이</p>
            <span className="text-xs flex items-center gap-1" style={{ color: "#34d399" }}>
              <TrendingUp size={12} /> 30일
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={signupTrend30} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: AXIS_COLOR }}
                tickLine={false}
                interval={4}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: AXIS_COLOR }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* category donut */}
        <div className={CARD} style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">카테고리 분포</p>
          <div className="flex flex-col items-center">
            <PieChart width={130} height={130}>
              <Pie
                data={categoryDist}
                cx={60}
                cy={60}
                innerRadius={38}
                outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {categoryDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="w-full space-y-1.5 mt-2">
              {categoryDist.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-xs" style={{ color: "#9991b8" }}>{c.name}</span>
                  </div>
                  <span className="text-xs font-medium text-white">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* daily saves bar */}
        <div className={CARD} style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">일별 저장 수 (14일)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={saveTrend14} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: AXIS_COLOR }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: AXIS_COLOR }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* hourly heatmap */}
        <div className={CARD} style={CARD_STYLE}>
          <p className="text-white text-sm font-medium mb-4">시간대별 활동 (오늘)</p>
          <ActivityHeatmap />
        </div>
      </div>
    </div>
  );
}
