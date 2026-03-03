"use client";

import { useRef, useCallback } from "react";
import type { NormalizedLandmark, OverlayConfig, AngleResult, DistanceResult } from "@/types";
import { SKELETON_CONNECTIONS, LANDMARK_NAMES, DEFAULT_DISTANCES } from "../mediapipe/landmarks";

function toPixel(
  lm: NormalizedLandmark,
  w: number,
  h: number
): { x: number; y: number } {
  return { x: lm.x * w, y: lm.y * h };
}

function getLandmarkColor(index: number): string {
  if (index <= 10) return "#60a5fa"; // face — blue
  if (index <= 22) return "#00e5a0"; // upper body — green
  return "#ffd166"; // lower body — gold
}

export function useOverlayRenderer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const renderFrame = useCallback(
    (
      landmarks: NormalizedLandmark[],
      config: OverlayConfig,
      angles: AngleResult[],
      distances: DistanceResult[],
      videoWidth: number,
      videoHeight: number
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, videoWidth, videoHeight);
      const w = videoWidth;
      const h = videoHeight;

      // Draw skeleton
      if (config.skeleton) {
        ctx.strokeStyle = "rgba(0, 229, 160, 0.6)";
        ctx.lineWidth = 2;
        for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
          const a = landmarks[startIdx!];
          const b = landmarks[endIdx!];
          if (!a || !b) continue;
          if ((a.visibility ?? 0) < 0.3 || (b.visibility ?? 0) < 0.3) continue;
          const pa = toPixel(a, w, h);
          const pb = toPixel(b, w, h);
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }

      // Draw landmarks
      if (config.landmarks) {
        for (let i = 0; i < landmarks.length; i++) {
          const lm = landmarks[i];
          if (!lm || (lm.visibility ?? 0) < 0.3) continue;
          const p = toPixel(lm, w, h);
          const radius = 3 + (lm.visibility ?? 0) * 3;

          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = getLandmarkColor(i);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw angle arcs
      if (config.arcs) {
        for (const angle of angles) {
          if (angle.name === "Body Align") continue; // skip special averaged angle for arc drawing
          const def = DEFAULT_ANGLE_DEFS.get(angle.name);
          if (!def) continue;
          const b = landmarks[def[1]!];
          if (!b || (b.visibility ?? 0) < 0.3) continue;
          const pb = toPixel(b, w, h);

          // Draw arc
          const a = landmarks[def[0]!];
          const c = landmarks[def[2]!];
          if (!a || !c) continue;
          const pa = toPixel(a, w, h);
          const pc = toPixel(c, w, h);

          const startAngle = Math.atan2(pa.y - pb.y, pa.x - pb.x);
          const endAngle = Math.atan2(pc.y - pb.y, pc.x - pb.x);

          ctx.beginPath();
          ctx.arc(pb.x, pb.y, 20, startAngle, endAngle);
          ctx.strokeStyle = angle.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw angle value label
          const midAngle = (startAngle + endAngle) / 2;
          const labelX = pb.x + Math.cos(midAngle) * 32;
          const labelY = pb.y + Math.sin(midAngle) * 32;

          ctx.font = "bold 11px monospace";
          ctx.fillStyle = "#000";
          ctx.fillText(`${Math.round(angle.degrees)}°`, labelX + 1, labelY + 1);
          ctx.fillStyle = angle.color;
          ctx.fillText(`${Math.round(angle.degrees)}°`, labelX, labelY);
        }
      }

      // Draw distances
      if (config.distances) {
        ctx.setLineDash([4, 4]);
        for (const dist of distances) {
          const def = DEFAULT_DISTANCES.find((d) => d.name === dist.name);
          if (!def) continue;
          const a = landmarks[def.from];
          const b = landmarks[def.to];
          if (!a || !b) continue;
          const pa = toPixel(a, w, h);
          const pb = toPixel(b, w, h);

          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.strokeStyle = dist.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Distance label at midpoint
          const mx = (pa.x + pb.x) / 2;
          const my = (pa.y + pb.y) / 2;
          ctx.font = "bold 11px monospace";
          ctx.fillStyle = "#000";
          ctx.fillText(dist.value.toFixed(2), mx + 1, my - 3);
          ctx.fillStyle = dist.color;
          ctx.fillText(dist.value.toFixed(2), mx, my - 4);
        }
        ctx.setLineDash([]);
      }

      // Draw landmark IDs
      if (config.ids) {
        ctx.font = "10px monospace";
        for (let i = 0; i < landmarks.length; i++) {
          const lm = landmarks[i];
          if (!lm || (lm.visibility ?? 0) < 0.3) continue;
          const p = toPixel(lm, w, h);
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillText(String(i), p.x + 7, p.y - 1);
          ctx.fillStyle = "#fff";
          ctx.fillText(String(i), p.x + 6, p.y - 2);
        }
      }
    },
    []
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  return { canvasRef, renderFrame, clearCanvas };
}

// Quick lookup map for angle definitions
import { DEFAULT_ANGLES } from "../mediapipe/landmarks";

const DEFAULT_ANGLE_DEFS = new Map<string, [number, number, number]>(
  DEFAULT_ANGLES.filter((d) => d.points[0] !== -1).map((d) => [d.name, d.points])
);
