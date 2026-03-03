import type { NormalizedLandmark } from "@/types";

export function computeVelocity(
  curr: NormalizedLandmark,
  prev: NormalizedLandmark
): number {
  return (
    Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2) * 1000
  );
}
