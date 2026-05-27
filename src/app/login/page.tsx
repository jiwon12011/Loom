"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않아요.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="flex items-center gap-2.5 mb-12">
          <Image src="/logo.png" alt="Loom" width={36} height={36} className="object-contain" />
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
              ? "bg-brand-purple text-white active:scale-[0.98]"
              : "bg-surface-section text-text-muted"
          }`}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "로그인 중..." : "로그인"}
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

