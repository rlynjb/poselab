import type {
  NormalizedLandmark,
  DistanceDefinition,
  DistanceResult,
} from "@/types";

export function dist2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function midpoint(
  a: NormalizedLandmark,
  b: NormalizedLandmark
): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function computeAllDistances(
  landmarks: NormalizedLandmark[],
  definitions: DistanceDefinition[]
): DistanceResult[] {
  return definitions.map((def) => {
    const a = landmarks[def.from];
    const b = landmarks[def.to];
    if (!a || !b) return { name: def.name, value: 0, color: def.color };
    return {
      name: def.name,
      value: dist2D(a, b),
      color: def.color,
    };
  });
}
