"use client";

import { useState, useEffect, useCallback } from "react";
import type { OverlayConfig, ModelVariant, SidebarTab } from "@/types";
import { useCamera } from "@/lib/hooks/useCamera";
import { usePoseDetection } from "@/lib/hooks/usePoseDetection";
import { useOverlayRenderer } from "@/lib/hooks/useOverlayRenderer";
import Viewport from "./Viewport";
import Sidebar from "./Sidebar";
import AnglesPanel from "./panels/AnglesPanel";
import LandmarksPanel from "./panels/LandmarksPanel";
import MetricsPanel from "./panels/MetricsPanel";
import ConfigPanel from "./panels/ConfigPanel";

export default function PoseLab() {
  // Settings state
  const [modelVariant, setModelVariant] = useState<ModelVariant>("lite");
  const [detectionConfidence, setDetectionConfidence] = useState(0.5);
  const [smoothingFactor, setSmoothingFactor] = useState(0.4);
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    skeleton: true,
    landmarks: true,
    arcs: true,
    distances: false,
    ids: false,
  });
  const [activeTab, setActiveTab] = useState<SidebarTab>("angles");

  // Hooks
  const { videoRef, isStreaming, error, startCamera, stopCamera } = useCamera();
  const {
    isLoading,
    isTracking,
    fps,
    confidence,
    landmarks,
    angles,
    distances,
    positions,
    velocity,
    squatRatio,
    startDetection,
    stopDetection,
    resetCalibration,
  } = usePoseDetection(modelVariant, detectionConfidence, smoothingFactor);
  const { canvasRef, renderFrame, clearCanvas } = useOverlayRenderer();

  // Start/stop detection when camera streams
  useEffect(() => {
    if (isStreaming && videoRef.current) {
      startDetection(videoRef.current);
    } else {
      stopDetection();
      clearCanvas();
    }
  }, [isStreaming, videoRef, startDetection, stopDetection, clearCanvas]);

  // Render overlay when landmarks update
  useEffect(() => {
    if (landmarks && videoRef.current) {
      const video = videoRef.current;
      renderFrame(
        landmarks,
        overlayConfig,
        angles,
        distances,
        video.videoWidth,
        video.videoHeight
      );
    } else {
      clearCanvas();
    }
  }, [landmarks, overlayConfig, angles, distances, videoRef, renderFrame, clearCanvas]);

  const handleToggleCamera = useCallback(() => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isStreaming, startCamera, stopCamera]);

  const modelLabel = modelVariant.charAt(0).toUpperCase() + modelVariant.slice(1);

  const cycleModel = useCallback(() => {
    const variants: ModelVariant[] = ["lite", "full", "heavy"];
    const idx = variants.indexOf(modelVariant);
    setModelVariant(variants[(idx + 1) % variants.length]!);
  }, [modelVariant]);

  return (
    <div className="flex h-screen flex-col bg-bg-primary">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-sans text-base font-bold tracking-tight text-text-primary">
              POSE LAB
            </h1>
          </div>
          <span className="rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase text-accent">
            MediaPipe
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cycleModel}
            className="rounded-md border border-border bg-bg-card px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:border-border-active hover:text-text-primary"
          >
            Model: {modelLabel}
          </button>
          <button
            onClick={handleToggleCamera}
            className={`rounded-md px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
              isStreaming
                ? "border border-red bg-red/10 text-red hover:bg-red/20"
                : "bg-accent text-bg-primary hover:bg-accent-dim"
            }`}
          >
            {isStreaming ? "Stop Camera" : "Start Camera"}
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="border-b border-red/30 bg-red/10 px-4 py-2 font-mono text-xs text-red">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col p-4">
          <Viewport
            videoRef={videoRef}
            canvasRef={canvasRef}
            isStreaming={isStreaming}
            isTracking={isTracking}
            isLoading={isLoading}
            fps={fps}
            confidence={confidence}
          />
        </div>

        <Sidebar activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "angles" && <AnglesPanel angles={angles} />}
          {activeTab === "landmarks" && (
            <LandmarksPanel landmarks={landmarks} />
          )}
          {activeTab === "metrics" && (
            <MetricsPanel
              distances={distances}
              positions={positions}
              velocity={velocity}
              squatRatio={squatRatio}
              isTracking={isTracking}
            />
          )}
          {activeTab === "config" && (
            <ConfigPanel
              overlay={overlayConfig}
              onOverlayChange={setOverlayConfig}
              modelVariant={modelVariant}
              onModelChange={setModelVariant}
              detectionConfidence={detectionConfidence}
              onDetectionConfidenceChange={setDetectionConfidence}
              smoothingFactor={smoothingFactor}
              onSmoothingFactorChange={setSmoothingFactor}
              isLoading={isLoading}
              onResetCalibration={resetCalibration}
            />
          )}
        </Sidebar>
      </div>
    </div>
  );
}
