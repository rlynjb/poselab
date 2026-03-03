"use client";

import type {
  DistanceResult,
  PositionChecks,
  VelocityData,
} from "@/types";
import DataCard from "../ui/DataCard";
import VelocitySparkline from "../ui/VelocitySparkline";

interface MetricsPanelProps {
  distances: DistanceResult[];
  positions: PositionChecks;
  velocity: VelocityData;
  squatRatio: number;
  isTracking: boolean;
}

export default function MetricsPanel({
  distances,
  positions,
  velocity,
  squatRatio,
  isTracking,
}: MetricsPanelProps) {
  if (!isTracking) {
    return (
      <div className="py-8 text-center font-mono text-xs text-text-muted">
        No pose detected
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Distances */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Distances
        </div>
        <div className="mb-2 rounded-md border border-border bg-bg-card p-2">
          <div className="font-mono text-[10px] leading-relaxed text-text-muted">
            Distances between landmarks can detect jumping jacks, grip width,
            stance width, and more. Values are in normalized units (0–1).
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {distances.map((d) => (
            <DataCard
              key={d.name}
              title={d.name}
              value={d.value}
              color={d.color}
            />
          ))}
        </div>
      </div>

      {/* Relative Positions */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Relative Positions
        </div>
        <div className="mb-2 rounded-md border border-border bg-bg-card p-2">
          <div className="font-mono text-[10px] leading-relaxed text-text-muted">
            Is landmark A above/below B? Useful for detecting body orientation
            (standing, lying, inverted).
          </div>
        </div>
        <div className="space-y-1.5 rounded-md border border-border bg-bg-card p-3">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-text-muted">Orientation</span>
            <span className="text-accent">{positions.orientation}</span>
          </div>
          <div className="flex justify-between font-mono text-xs">
            <span className="text-text-muted">Wrists above Shoulders?</span>
            <span className={positions.wristsAboveShoulders ? "text-accent" : "text-text-secondary"}>
              {positions.wristsAboveShoulders ? "Yes ↑" : "No ↓"}
            </span>
          </div>
          <div className="flex justify-between font-mono text-xs">
            <span className="text-text-muted">Hands above Head?</span>
            <span className={positions.handsAboveHead ? "text-accent" : "text-text-secondary"}>
              {positions.handsAboveHead ? "Yes ↑" : "No ↓"}
            </span>
          </div>
        </div>
      </div>

      {/* Ratios */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Ratios
        </div>
        <DataCard
          title="Squat Depth Ratio"
          value={squatRatio}
          unit="(1.0 = standing)"
          color="#ffd166"
        />
      </div>

      {/* Velocity */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Velocity (Nose)
        </div>
        <div className="mb-2 rounded-md border border-border bg-bg-card p-2">
          <div className="font-mono text-[10px] leading-relaxed text-text-muted">
            Position change per frame. Detects explosive vs controlled movement,
            pauses, and speed.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <DataCard title="Current" value={velocity.current} color="#00e5a0" />
          <DataCard title="Peak" value={velocity.peak} color="#ff6b9d" />
        </div>
        <div className="mt-2 rounded-md border border-border bg-bg-card p-3">
          <div className="mb-1 font-mono text-[10px] uppercase text-text-muted">
            Last 30 Frames
          </div>
          <VelocitySparkline values={velocity.history} width={280} height={40} />
        </div>
      </div>
    </div>
  );
}
