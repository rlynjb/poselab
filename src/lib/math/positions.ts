import type { NormalizedLandmark, PositionChecks } from "@/types";
import { dist2D, midpoint } from "./distances";

export function detectOrientation(landmarks: NormalizedLandmark[]): string {
  const nose = landmarks[0];
  const lAnkle = landmarks[27];
  const rAnkle = landmarks[28];
  const lHip = landmarks[23];
  const rHip = landmarks[24];
  if (!nose || !lAnkle || !rAnkle || !lHip || !rHip) return "Unknown";

  const ankleCenter = {
    x: (lAnkle.x + rAnkle.x) / 2,
    y: (lAnkle.y + rAnkle.y) / 2,
    z: 0,
    visibility: 1,
  };
  const hipCenter = midpoint(lHip, rHip);

  const verticalSpan = Math.abs(nose.y - ankleCenter.y);
  const horizontalSpan = Math.abs(nose.x - ankleCenter.x);

  if (verticalSpan < 0.15) return "Lying Down";
  if (nose.y > hipCenter.y + 0.05) return "Inverted";
  if (horizontalSpan > verticalSpan * 0.8) return "Sideways";
  return "Standing";
}

export function wristsAboveShoulders(landmarks: NormalizedLandmark[]): boolean {
  const lw = landmarks[15];
  const rw = landmarks[16];
  const ls = landmarks[11];
  const rs = landmarks[12];
  if (!lw || !rw || !ls || !rs) return false;
  const avgWristY = (lw.y + rw.y) / 2;
  const avgShoulderY = (ls.y + rs.y) / 2;
  return avgWristY < avgShoulderY;
}

export function handsAboveHead(landmarks: NormalizedLandmark[]): boolean {
  const lw = landmarks[15];
  const rw = landmarks[16];
  const nose = landmarks[0];
  if (!lw || !rw || !nose) return false;
  const avgWristY = (lw.y + rw.y) / 2;
  return avgWristY < nose.y;
}

export function computeSquatRatio(
  landmarks: NormalizedLandmark[],
  standingHipY: number
): number {
  const lHip = landmarks[23];
  const rHip = landmarks[24];
  if (!lHip || !rHip || standingHipY <= 0) return 1;
  const currentHipY = (lHip.y + rHip.y) / 2;
  return currentHipY / standingHipY;
}

export function computePositionChecks(
  landmarks: NormalizedLandmark[]
): PositionChecks {
  return {
    orientation: detectOrientation(landmarks),
    wristsAboveShoulders: wristsAboveShoulders(landmarks),
    handsAboveHead: handsAboveHead(landmarks),
  };
}
