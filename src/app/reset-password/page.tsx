"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // supabase-js가 이메일 복구 링크의 토큰을 URL에서 자동 파싱해 복구 세션을 설정하고
    // PASSWORD_RECOVERY 이벤트를 발생시킵니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setValidSession(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const pwLong = password.length >= 8;
  const pwMatch = password.length > 0 && password === confirm;
  const canSubmit = pwLong && pwMatch && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("비밀번호 변경에 실패했어요. 링크가 만료되었을 수 있어요. 다시 요청해주세요.");
      return;
    }
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => router.replace("/login"), 1600);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-6">
          <Check size={32} className="text-green-500" strokeWidth={2.5} />
        </div>
        <h1 className="text-[22px] font-bold text-text-primary mb-3">비밀번호가 변경되었어요</h1>
        <p className="text-[14px] text-text-muted">잠시 후 로그인 화면으로 이동해요...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-[20px] font-bold text-text-primary mb-3">링크가 유효하지 않아요</h1>
        <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
          비밀번호 재설정 링크가 만료되었거나 잘못되었어요.<br />
          로그인 화면에서 다시 요청해주세요.
        </p>
        <Link href="/login" className="w-full max-w-[320px] flex items-center justify-center bg-brand-purple text-white rounded-xl py-4 text-[15px] font-semibold">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="flex items-center gap-2.5 mb-12">
          <Image src="/logo.png" alt="Loom" width={36} height={36} className="object-contain" />
          <span className="text-[24px] font-bold text-text-primary">Loom</span>
        </div>

        <h1 className="text-[22px] font-bold text-text-primary mb-2">새 비밀번호 설정</h1>
        <p className="text-[14px] text-text-muted mb-8">새로 사용할 비밀번호를 입력해주세요.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block">새 비밀번호</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력하세요"
              className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 pr-12 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
            />
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
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-purple transition-colors"
          />
          {confirm.length > 0 && (
            <p className={`text-[12px] mt-1.5 ${pwMatch ? "text-green-500" : "text-red-400"}`}>
              {pwMatch ? "✓ 비밀번호 일치" : "비밀번호가 일치하지 않아요"}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-[15px] font-semibold transition-all ${
            canSubmit ? "bg-brand-purple text-white active:scale-[0.98]" : "bg-surface-section text-text-muted"
          }`}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </div>
    </div>
  );
}
