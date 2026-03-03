"use client";

interface DataCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color?: string;
  className?: string;
}

export default function DataCard({
  title,
  value,
  unit,
  color = "var(--color-accent)",
  className = "",
}: DataCardProps) {
  return (
    <div
      className={`rounded-md border border-border bg-bg-card p-3 ${className}`}
    >
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {title}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono text-xl tabular-nums"
          style={{ color }}
        >
          {typeof value === "number" ? value.toFixed(2) : value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-text-muted">{unit}</span>
        )}
      </div>
    </div>
  );
}
