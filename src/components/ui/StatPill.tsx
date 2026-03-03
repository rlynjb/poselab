"use client";

interface StatPillProps {
  label: string;
  value: string | number;
  dotColor?: string;
}

export default function StatPill({ label, value, dotColor }: StatPillProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-bg-card/80 px-2 py-1 backdrop-blur-sm">
      {dotColor && (
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span className="font-mono text-[10px] uppercase text-text-muted">
        {label}
      </span>
      <span className="font-mono text-xs tabular-nums text-text-primary">
        {value}
      </span>
    </div>
  );
}
