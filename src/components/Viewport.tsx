"use client";

import { type RefObject } from "react";
import StatPill from "./ui/StatPill";

interface ViewportProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isTracking: boolean;
  isLoading: boolean;
  fps: number;
  confidence: number;
}

export default function Viewport({
  videoRef,
  canvasRef,
  isStreaming,
  isTracking,
  isLoading,
  fps,
  confidence,
}: ViewportProps) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-bg-secondary">
      {/* Video + Canvas */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Floating Stats */}
      {isStreaming && (
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatPill
            label="Status"
            value={isTracking ? "Tracking" : "No pose"}
            dotColor={isTracking ? "#00e5a0" : "#f87171"}
          />
          <StatPill label="FPS" value={fps} />
          {isTracking && <StatPill label="Confidence" value={`${confidence}%`} />}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-2 h-6 w-6 mx-auto animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <div className="font-mono text-sm text-accent">
              Loading MediaPipe...
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isStreaming && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-2 font-sans text-2xl font-bold tracking-tight text-text-primary">
              MediaPipe Pose Lab
            </div>
            <div className="max-w-sm font-mono text-xs leading-relaxed text-text-muted">
              A developer sandbox for real-time pose detection. Start the camera
              to see 33 body landmarks, joint angles, distances, velocities,
              and more — all computed live.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
