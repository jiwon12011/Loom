"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl w-[300px] mx-auto overflow-hidden shadow-elevated animate-slide-in">
        <div className="px-6 pt-6 pb-4 text-center">
          <h3 className="text-[17px] font-bold text-text-primary mb-2">{title}</h3>
          <p className="text-[14px] text-text-muted leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-border-light">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 text-[15px] font-medium text-text-secondary border-r border-border-light active:bg-surface-soft transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 text-[15px] font-semibold active:bg-surface-soft transition-colors ${
              danger ? "text-red-500" : "text-brand-purple"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
