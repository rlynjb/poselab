import type { AngleDefinition, DistanceDefinition } from "@/types";

export const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export const LANDMARK_NAMES: Record<number, string> = {
  0: "Nose",
  1: "L Eye Inner",
  2: "L Eye",
  3: "L Eye Outer",
  4: "R Eye Inner",
  5: "R Eye",
  6: "R Eye Outer",
  7: "L Ear",
  8: "R Ear",
  9: "L Mouth",
  10: "R Mouth",
  11: "L Shoulder",
  12: "R Shoulder",
  13: "L Elbow",
  14: "R Elbow",
  15: "L Wrist",
  16: "R Wrist",
  17: "L Pinky",
  18: "R Pinky",
  19: "L Index",
  20: "R Index",
  21: "L Thumb",
  22: "R Thumb",
  23: "L Hip",
  24: "R Hip",
  25: "L Knee",
  26: "R Knee",
  27: "L Ankle",
  28: "R Ankle",
  29: "L Heel",
  30: "R Heel",
  31: "L Foot Index",
  32: "R Foot Index",
};

export const SKELETON_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // upper body
  [11, 23], [12, 24], [23, 24],                       // torso
  [23, 25], [25, 27], [24, 26], [26, 28],             // legs
  [15, 17], [15, 19], [15, 21],                        // L hand
  [16, 18], [16, 20], [16, 22],                        // R hand
  [27, 29], [27, 31], [28, 30], [28, 32],             // feet
];

export const DEFAULT_ANGLES: AngleDefinition[] = [
  { name: "L Elbow", points: [11, 13, 15], color: "#00e5a0" },
  { name: "R Elbow", points: [12, 14, 16], color: "#00e5a0" },
  { name: "L Knee", points: [23, 25, 27], color: "#60a5fa" },
  { name: "R Knee", points: [24, 26, 28], color: "#60a5fa" },
  { name: "L Shoulder", points: [23, 11, 13], color: "#ff6b9d" },
  { name: "R Shoulder", points: [24, 12, 14], color: "#ff6b9d" },
  { name: "L Hip", points: [11, 23, 25], color: "#ffd166" },
  { name: "R Hip", points: [12, 24, 26], color: "#ffd166" },
  { name: "Body Align", points: [-1, -2, -3], color: "#ffffff" }, // special: uses averaged landmarks
];

export const DEFAULT_DISTANCES: DistanceDefinition[] = [
  { name: "Wrist-to-Wrist", from: 15, to: 16, color: "#00e5a0" },
  { name: "Shoulder Width", from: 11, to: 12, color: "#60a5fa" },
  { name: "Hip Width", from: 23, to: 24, color: "#ff6b9d" },
  { name: "Ankle Spread", from: 27, to: 28, color: "#ffd166" },
];
