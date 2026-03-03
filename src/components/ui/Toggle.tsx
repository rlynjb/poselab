"use client";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between py-1.5"
    >
      <span className="font-mono text-xs text-text-secondary">{label}</span>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-border-active"
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
