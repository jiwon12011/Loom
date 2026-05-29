"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pwMatch = password.length > 0 && password === confirm;
  const pwLong = password.length >= 8;
  const canSubmit = email.includes("@") && pwMatch && pwLong && agreed && !loading;

  const handleSignup = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "User already registered"
        ? "이미 가입된 이메일이에요."
        : error.message);
    } else if (data.session) {
      // 이메일 인증이 꺼져 있으면 가입 즉시 세션이 발급돼 바로 로그인됩니다.
      router.replace("/");
    } else {
      // (이메일 인증이 켜진 경우 대비) 인증 안내 화면
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-6">
          <Check size={32} className="text-green-500" strokeWidth={2.5} />
        </div>
        <h1 className="text-[22px] font-bold text-text-primary mb-3">이메일을 확인해주세요</h1>
        <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
          <span className="font-semibold text-text-primary">{email}</span>로<br />
          인증 메일을 보냈어요. 확인 후 로그인해주세요.
        </p>
        <Link href="/login" className="w-full flex items-center justify-center bg-brand-purple text-white rounded-xl py-4 text-[15px] font-semibold">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="px-4 pt-14 pb-2">
        <button onClick={() => router.back()} className="p-1.5 text-text-primary">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
      </header>

      <div className="flex-1 px-6 pt-4">
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo.png" alt="Loom" width={28} height={28} className="object-contain" />
          <span className="text-[18px] font-bold text-text-primary">Loom</span>
        </div>

        <h1 className="text-[22px] font-bold text-text-primary mb-2">회원가입</h1>
        <p className="text-[14px] text-text-muted mb-8">Loom과 함께 기억을 정리하세요.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block">이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
            className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors" />
        </div>

        <div className="mb-4">
          <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block">비밀번호</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8자 이상 입력하세요"
              className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 pr-12 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password.length > 0 && (
            <p className={`text-[12px] mt-1.5 ${pwLong ? "text-green-500" : "text-red-400"}`}>
              {pwLong ? "✓ 8자 이상" : "8자 이상 입력해주세요"}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block">비밀번호 확인</label>
          <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="비밀번호를 다시 입력하세요"
            className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors" />
          {confirm.length > 0 && (
            <p className={`text-[12px] mt-1.5 ${pwMatch ? "text-green-500" : "text-red-400"}`}>
              {pwMatch ? "✓ 비밀번호 일치" : "비밀번호가 일치하지 않아요"}
            </p>
          )}
        </div>

        <button onClick={() => setAgreed(!agreed)} className="flex items-center gap-3 mb-8">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${agreed ? "bg-brand-purple border-brand-purple" : "border-border"}`}>
            {agreed && <Check size={13} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-[13px] text-text-secondary">이용약관 및 개인정보처리방침에 동의합니다</span>
        </button>

        <button
          onClick={handleSignup}
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold transition-all ${
            canSubmit ? "bg-brand-purple text-white active:scale-[0.98]" : "bg-surface-section text-text-muted"
          }`}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "가입 중..." : "가입하기"}
        </button>
      </div>

      <div className="px-6 pb-10 text-center">
        <p className="text-[14px] text-text-muted">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-brand-purple font-semibold">로그인</Link>
        </p>
      </div>
    </div>
  );
}

