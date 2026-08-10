"use client";

export function DeleteButton({ label, confirmText }: { label: string; confirmText: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-orange transition-colors"
    >
      {label}
    </button>
  );
}
