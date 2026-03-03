import type { NormalizedLandmark, AngleDefinition, AngleResult } from "@/types";

export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const ba = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: (a.z ?? 0) - (b.z ?? 0),
  };
  const bc = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: (c.z ?? 0) - (b.z ?? 0),
  };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

  if (magBA === 0 || magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

export function averageLandmarks(
  a: NormalizedLandmark,
  b: NormalizedLandmark
): NormalizedLandmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
    visibility: Math.min(a.visibility ?? 0, b.visibility ?? 0),
  };
}

export function smoothAngle(
  current: number,
  previous: number,
  factor: number
): number {
  return previous + factor * (current - previous);
}

export function computeAllAngles(
  landmarks: NormalizedLandmark[],
  definitions: AngleDefinition[]
): AngleResult[] {
  return definitions.map((def) => {
    // Special case: Body Alignment uses averaged landmarks
    if (def.points[0] === -1) {
      const avgShoulder = averageLandmarks(landmarks[11]!, landmarks[12]!);
      const avgHip = averageLandmarks(landmarks[23]!, landmarks[24]!);
      const avgAnkle = averageLandmarks(landmarks[27]!, landmarks[28]!);
      return {
        name: def.name,
        degrees: calculateAngle(avgShoulder, avgHip, avgAnkle),
        color: def.color,
      };
    }

    const [ai, bi, ci] = def.points;
    const a = landmarks[ai!];
    const b = landmarks[bi!];
    const c = landmarks[ci!];
    if (!a || !b || !c) return { name: def.name, degrees: 0, color: def.color };
    return {
      name: def.name,
      degrees: calculateAngle(a, b, c),
      color: def.color,
    };
  });
}
