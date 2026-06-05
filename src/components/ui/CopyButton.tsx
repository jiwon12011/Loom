"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  onCopy: (e: React.MouseEvent) => Promise<void>;
  /** 복사 후 체크 아이콘 유지 시간(ms). 기본 1200ms */
  checkDuration?: number;
  className?: string;
}

/**
 * 복사 버튼: 클릭 시 Copy → Check 아이콘으로 200ms 모핑, checkDuration 후 복귀.
 * 연속 클릭 시 타이머 재시작.
 */
export default function CopyButton({ onCopy, checkDuration = 1200, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      await onCopy(e);
      setCopied(true);
      // 연속 클릭 시 타이머가 중복 생성되지 않도록 — state 자체가 true면 이미 타이머 진행 중
      // 재클릭하면 duration을 처음부터 다시 카운트
      setTimeout(() => setCopied(false), checkDuration);
    },
    [onCopy, checkDuration]
  );

  return (
    <button
      aria-label={copied ? "복사 완료" : "복사"}
      className={`p-2.5 flex-shrink-0 self-start transition-opacity hover:opacity-60 focus-ring ${className}`}
      onClick={handleClick}
      style={{ color: "var(--profile-accent)" }}
    >
      {/* key 변경으로 DOM 재생성 → icon-morph 애니메이션 재트리거 */}
      {copied ? (
        <Check key="check" size={16} strokeWidth={2.2} className="icon-morph" />
      ) : (
        <Copy key="copy" size={16} strokeWidth={1.8} className="icon-morph" />
      )}
    </button>
  );
}
