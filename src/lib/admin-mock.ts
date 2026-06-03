// Mock data — swap these with real Supabase queries when service-role key is wired up

export const dashboardStats = {
  totalUsers: 1284,
  newUsersToday: 12,
  dau: 347,
  dauChangePct: 8.2,
  totalItems: 28493,
  newItemsToday: 156,
  aiSuccessRate: 96.8,
  aiSuccessRateChange: 0.3,
};

const today = new Date();
const day = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const signupTrend30 = Array.from({ length: 30 }, (_, i) => ({
  date: day(29 - i),
  value: Math.floor(30 + Math.random() * 80 + i * 2.5),
}));

export const saveTrend14 = Array.from({ length: 14 }, (_, i) => ({
  date: day(13 - i),
  value: Math.floor(700 + Math.random() * 600 + i * 20),
}));

export const categoryDist = [
  { name: "카피/문구", value: 32, color: "#a78bfa" },
  { name: "디자인", value: 24, color: "#60a5fa" },
  { name: "개발", value: 18, color: "#34d399" },
  { name: "링크", value: 12, color: "#fbbf24" },
  { name: "기타", value: 14, color: "#f87171" },
];

export const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
  hour: h,
  value: h < 6 ? Math.floor(Math.random() * 15)
       : h < 9 ? Math.floor(50 + Math.random() * 80)
       : h < 13 ? Math.floor(100 + Math.random() * 120)
       : h < 18 ? Math.floor(80 + Math.random() * 100)
       : h < 22 ? Math.floor(120 + Math.random() * 140)
       : Math.floor(20 + Math.random() * 40),
}));

// ─── Users ────────────────────────────────────────────────────────────────────

const emailPrefixes = ["jiwon", "minjun", "sohee", "taehyun", "yuna", "junho",
  "seulgi", "hyunwoo", "jisoo", "minjae", "eunji", "seongmin", "dahye",
  "kyungmin", "nayeon", "jiho", "sumin", "donghyun", "yeji", "woojin"];
const domains = ["gmail.com", "naver.com", "kakao.com", "hanmail.net", "daum.net"];

export const mockUsers = Array.from({ length: 60 }, (_, i) => {
  const created = new Date(today);
  created.setDate(created.getDate() - Math.floor(Math.random() * 180));
  const lastActive = new Date(created);
  lastActive.setDate(lastActive.getDate() + Math.floor(Math.random() * (today.getDate() - created.getDate() + 1)));
  return {
    id: `user-${i}`,
    email: `${emailPrefixes[i % emailPrefixes.length]}${i > 19 ? i : ""}@${domains[i % domains.length]}`,
    createdAt: created.toISOString(),
    lastActiveAt: lastActive.toISOString(),
    itemCount: Math.floor(Math.random() * 300),
    plan: Math.random() > 0.7 ? ("pro" as const) : ("free" as const),
    status: Math.random() > 0.1 ? ("active" as const) : ("inactive" as const),
  };
});

// ─── Analytics ────────────────────────────────────────────────────────────────

export const retentionCohorts = [
  { week: "5/5주차", users: 240, d1: 71, d7: 48, d30: 31 },
  { week: "5/12주차", users: 298, d1: 68, d7: 44, d30: 27 },
  { week: "5/19주차", users: 334, d1: 73, d7: 51, d30: null },
  { week: "5/26주차", users: 412, d1: 76, d7: null, d30: null },
];

export const featureUsage = [
  { name: "텍스트 저장", value: 8420, color: "#a78bfa" },
  { name: "자연어 검색", value: 6340, color: "#60a5fa" },
  { name: "복사", value: 4180, color: "#34d399" },
  { name: "링크 저장", value: 3210, color: "#fbbf24" },
  { name: "이미지 저장", value: 2890, color: "#f87171" },
  { name: "컬렉션", value: 1740, color: "#f472b6" },
];

export const topSearches = [
  { query: "마케팅 카피", count: 384 },
  { query: "색상 코드", count: 291 },
  { query: "레이아웃 아이디어", count: 248 },
  { query: "폰트 추천", count: 203 },
  { query: "코드 스니펫", count: 187 },
  { query: "버튼 디자인", count: 156 },
  { query: "브랜딩 문구", count: 143 },
  { query: "그라데이션", count: 128 },
  { query: "아이콘 참고", count: 112 },
  { query: "UX 패턴", count: 98 },
];

export const emptySearches = [
  { query: "애플 디자인 가이드라인", count: 42 },
  { query: "스위프트 예제 코드", count: 37 },
  { query: "2025 트렌드", count: 31 },
  { query: "모달 애니메이션", count: 28 },
  { query: "리텐션 전략", count: 24 },
];

// ─── AI ──────────────────────────────────────────────────────────────────────

export const aiDailyStats = Array.from({ length: 14 }, (_, i) => ({
  date: day(13 - i),
  processed: Math.floor(900 + Math.random() * 400),
  failed: Math.floor(10 + Math.random() * 40),
  avgMs: Math.floor(1800 + Math.random() * 800),
  costUsd: parseFloat((0.6 + Math.random() * 0.5).toFixed(2)),
}));

export const aiTodayStats = {
  processed: 1156,
  failed: 37,
  successRate: 96.8,
  avgMs: 2340,
  costUsd: 0.87,
  queuePending: 4,
};

export const contentTypeDist = [
  { name: "텍스트", value: 52, color: "#a78bfa" },
  { name: "링크", value: 28, color: "#60a5fa" },
  { name: "이미지", value: 14, color: "#34d399" },
  { name: "Mixed", value: 6, color: "#fbbf24" },
];

export const recentAiJobs = Array.from({ length: 12 }, (_, i) => {
  const mins = Math.floor(Math.random() * 60);
  const ok = Math.random() > 0.06;
  const types = ["text", "link", "image", "mixed"] as const;
  return {
    id: `item-${1000 + i}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: ok ? ("done" as const) : ("failed" as const),
    ms: ok ? Math.floor(1200 + Math.random() * 2000) : 0,
    minsAgo: mins,
  };
});
