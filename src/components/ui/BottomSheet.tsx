"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  /** 실제 DOM 마운트 여부 — slide-down 완료 후에 언마운트 */
  const [mounted, setMounted] = useState(false);
  /** 닫히는 중 → slide-down 클래스 적용 */
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      // 열릴 때: 바로 마운트, closing 해제
      setClosing(false);
      setMounted(true);
    } else if (mounted) {
      // 닫힐 때: slide-down 먼저, 애니메이션(250ms) 후 언마운트
      setClosing(true);
      timerRef.current = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 260);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* 오버레이: 닫힘 중엔 pointer-events 차단 */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-[220ms] ${closing ? "opacity-0" : "opacity-100"}`}
        onClick={onClose}
      />
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface rounded-t-3xl shadow-modal safe-bottom ${
          closing ? "animate-slide-down" : "animate-slide-up"
        }`}
      >
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 py-3">
            <h3 className="text-[17px] font-bold text-text-primary">{title}</h3>
            <button onClick={onClose} className="p-1 text-text-muted focus-ring">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
