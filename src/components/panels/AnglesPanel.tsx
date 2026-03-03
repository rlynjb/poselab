"use client";

import type { AngleResult } from "@/types";
import AngleRow from "../ui/AngleRow";

interface AnglesPanelProps {
  angles: AngleResult[];
}

export default function AnglesPanel({ angles }: AnglesPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-bg-card p-3">
        <div className="font-mono text-[10px] leading-relaxed text-text-muted">
          Given 3 landmarks A → B → C, we compute the angle at B using:{" "}
          <code className="text-accent">
            angle = acos((BA·BC) / (|BA|×|BC|)) × 180/π
          </code>
        </div>
      </div>

      {angles.length === 0 ? (
        <div className="py-8 text-center font-mono text-xs text-text-muted">
          No pose detected
        </div>
      ) : (
        <div className="space-y-0.5">
          {angles.map((angle) => (
            <AngleRow
              key={angle.name}
              label={angle.name}
              degrees={angle.degrees}
              color={angle.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
