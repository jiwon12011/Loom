"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "copy" | "error";
  /** true이면 slide-out 중 — DOM에서 제거 직전 */
  removing?: boolean;
}

interface ToastContextType {
  show: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

/** 토스트 하나를 렌더링. removing 상태일 때 slide-out 클래스 적용 */
function ToastItem({ toast }: { toast: Toast }) {
  return (
    <div
      className={`flex items-center gap-2.5 bg-brand-purple text-white rounded-xl px-4 py-3 shadow-elevated ${
        toast.removing ? "animate-slide-out" : "animate-slide-in"
      }`}
    >
      {toast.type === "copy" && <Copy size={16} />}
      {toast.type === "success" && <Check size={16} />}
      {toast.type === "error" && <AlertCircle size={16} />}
      <span className="text-[14px] font-medium">{toast.message}</span>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // 퇴장 시작: 총 2000ms 중 마지막 220ms에 slide-out
    const EXIT_DURATION = 220;
    const TOTAL = 2000;

    setTimeout(() => {
      // removing 플래그 세팅 → slide-out 애니메이션 시작
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, removing: true } : t));
    }, TOTAL - EXIT_DURATION);

    setTimeout(() => {
      // 애니메이션 완료 후 DOM에서 제거
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOTAL);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[390px] px-5">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
