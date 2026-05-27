"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "copy" | "error";
}

interface ToastContextType {
  show: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[390px] px-5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2.5 bg-brand-purple text-white rounded-xl px-4 py-3 shadow-elevated animate-slide-in"
          >
            {toast.type === "copy" && <Copy size={16} />}
            {toast.type === "success" && <Check size={16} />}
            {toast.type === "error" && <AlertCircle size={16} />}
            <span className="text-[14px] font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

