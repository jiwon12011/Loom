interface TagProps {
  label: string;
  variant?: "default" | "outline";
  onRemove?: () => void;
}

export default function Tag({ label, variant = "default", onRemove }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2.5 py-1 ${
        variant === "outline"
          ? "border border-border text-text-secondary"
          : "bg-surface-section text-text-secondary"
      }`}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="text-text-muted ml-0.5">
          ×
        </button>
      )}
    </span>
  );
}
