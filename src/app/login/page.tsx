"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.includes("@") && password.length >= 1;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    // TODO: Replace with Supabase auth
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-purple-light flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <span className="text-[24px] font-bold text-text-primary">Loom</span>
        </div>

        <h1 className="text-[22px] font-bold text-text-primary mb-2">로그인</h1>
        <p className="text-[14px] text-text-muted mb-8">기억을 저장하고 다시 찾아보세요.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block">비밀번호</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="비밀번호를 입력하세요"
              className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 pr-12 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
            />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!canSubmit || loading}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-[15px] font-semibold transition-all mb-4 ${
            canSubmit && !loading
              ? "bg-text-primary text-white active:scale-[0.98]"
              : "bg-surface-section text-text-muted"
          }`}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-text-muted">또는</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={() => { setLoading(true); setTimeout(() => router.push("/"), 1000); }}
          className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-4 text-[15px] font-semibold active:scale-[0.98] transition-transform mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M15.24 12.96c-.36.84-.54 1.2-.99 1.92-.63.99-1.53 2.22-2.64 2.23-1.02.02-1.26-.66-2.64-.66-1.38 0-1.65.63-2.61.68-1.14.03-2.01-1.35-2.64-2.34C2.37 12.48 1.8 9.09 3.24 6.87c.72-1.11 1.98-1.77 3.15-1.77 1.23 0 2.01.66 3.03.66.99 0 1.59-.66 3.03-.66.99 0 2.1.54 2.82 1.47-2.49 1.35-2.07 4.89.48 5.82-.39.99-.57 1.44-.99 2.34l-.52.23zM11.1 3.27c.51-.66.9-1.59.75-2.52-.84.06-1.83.6-2.4 1.29-.51.63-.93 1.56-.78 2.46.93.03 1.89-.51 2.43-1.23z"/></svg>
          Apple로 계속하기
        </button>

        <button className="w-full flex items-center justify-center gap-2 bg-white border border-border text-text-primary rounded-xl py-4 text-[15px] font-semibold active:scale-[0.98] transition-transform">
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Google로 계속하기
        </button>
      </div>

      <div className="px-6 pb-10 text-center">
        <p className="text-[14px] text-text-muted">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-brand-purple font-semibold">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
