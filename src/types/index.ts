import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type { NormalizedLandmark };

export type ModelVariant = "lite" | "full" | "heavy";

export type SidebarTab = "angles" | "landmarks" | "metrics" | "config";

export interface OverlayConfig {
  skeleton: boolean;
  landmarks: boolean;
  arcs: boolean;
  distances: boolean;
  ids: boolean;
}

export interface AngleDefinition {
  name: string;
  points: [number, number, number]; // [A, B (vertex), C]
  color: string;
}

export interface AngleResult {
  name: string;
  degrees: number;
  color: string;
}

export interface DistanceDefinition {
  name: string;
  from: number;
  to: number;
  color: string;
}

export interface DistanceResult {
  name: string;
  value: number;
  color: string;
}

export interface PositionChecks {
  orientation: string;
  wristsAboveShoulders: boolean;
  handsAboveHead: boolean;
}

export interface VelocityData {
  current: number;
  peak: number;
  history: number[];
}
