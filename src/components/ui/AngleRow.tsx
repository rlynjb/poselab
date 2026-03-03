"use client";

interface AngleRowProps {
  label: string;
  degrees: number;
  color: string;
}

export default function AngleRow({ label, degrees, color }: AngleRowProps) {
  const pct = Math.min((degrees / 180) * 100, 100);

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-24 shrink-0 font-mono text-xs text-text-secondary">
        {label}
      </div>
      <div className="relative h-1.5 flex-1 rounded-full bg-border">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div
        className="w-12 text-right font-mono text-sm tabular-nums"
        style={{ color }}
      >
        {Math.round(degrees)}°
      </div>
    </div>
  );
}
