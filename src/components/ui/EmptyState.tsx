interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-[48px] mb-4">{emoji}</div>
      <h3 className="text-[17px] font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-[14px] text-text-muted leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-3 btn-accent rounded-xl text-[14px] font-semibold active:scale-[0.98] transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--profile-accent)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

