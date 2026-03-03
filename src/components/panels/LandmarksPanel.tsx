"use client";

import type { NormalizedLandmark } from "@/types";
import { LANDMARK_NAMES } from "@/lib/mediapipe/landmarks";

interface LandmarksPanelProps {
  landmarks: NormalizedLandmark[] | null;
}

export default function LandmarksPanel({ landmarks }: LandmarksPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-bg-card p-3">
        <div className="font-mono text-[10px] leading-relaxed text-text-muted">
          Coordinates:{" "}
          <code className="text-cyan">x</code> (0.0=left → 1.0=right),{" "}
          <code className="text-cyan">y</code> (0.0=top → 1.0=bottom),{" "}
          <code className="text-cyan">z</code> (depth from hip midpoint),{" "}
          <code className="text-cyan">vis</code> (confidence 0–1)
        </div>
      </div>

      {!landmarks ? (
        <div className="py-8 text-center font-mono text-xs text-text-muted">
          No pose detected
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-[11px]">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-1 py-1.5 text-left font-normal">#</th>
                <th className="px-1 py-1.5 text-left font-normal">Name</th>
                <th className="px-1 py-1.5 text-right font-normal">X</th>
                <th className="px-1 py-1.5 text-right font-normal">Y</th>
                <th className="px-1 py-1.5 text-right font-normal">Z</th>
                <th className="px-1 py-1.5 text-right font-normal">Vis</th>
              </tr>
            </thead>
            <tbody>
              {landmarks.map((lm, i) => {
                const vis = lm.visibility ?? 0;
                const dimmed = vis < 0.5;
                return (
                  <tr
                    key={i}
                    className={`border-b border-border/50 ${
                      dimmed ? "opacity-40" : ""
                    }`}
                  >
                    <td className="px-1 py-1 text-text-muted">{i}</td>
                    <td className="px-1 py-1 text-text-secondary">
                      {LANDMARK_NAMES[i] ?? `Landmark ${i}`}
                    </td>
                    <td className="px-1 py-1 text-right tabular-nums text-text-primary">
                      {lm.x.toFixed(3)}
                    </td>
                    <td className="px-1 py-1 text-right tabular-nums text-text-primary">
                      {lm.y.toFixed(3)}
                    </td>
                    <td className="px-1 py-1 text-right tabular-nums text-text-primary">
                      {(lm.z ?? 0).toFixed(3)}
                    </td>
                    <td className="px-1 py-1 text-right tabular-nums text-accent">
                      {vis.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
