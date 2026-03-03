"use client";

import type { OverlayConfig, ModelVariant } from "@/types";
import Toggle from "../ui/Toggle";
import { LANDMARK_NAMES } from "@/lib/mediapipe/landmarks";

interface ConfigPanelProps {
  overlay: OverlayConfig;
  onOverlayChange: (overlay: OverlayConfig) => void;
  modelVariant: ModelVariant;
  onModelChange: (variant: ModelVariant) => void;
  detectionConfidence: number;
  onDetectionConfidenceChange: (value: number) => void;
  smoothingFactor: number;
  onSmoothingFactorChange: (value: number) => void;
  isLoading: boolean;
  onResetCalibration: () => void;
}

export default function ConfigPanel({
  overlay,
  onOverlayChange,
  modelVariant,
  onModelChange,
  detectionConfidence,
  onDetectionConfidenceChange,
  smoothingFactor,
  onSmoothingFactorChange,
  isLoading,
  onResetCalibration,
}: ConfigPanelProps) {
  const models: ModelVariant[] = ["lite", "full", "heavy"];

  return (
    <div className="space-y-5">
      {/* Model Selector */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Model Variant
        </div>
        <div className="flex gap-1">
          {models.map((m) => (
            <button
              key={m}
              onClick={() => onModelChange(m)}
              disabled={isLoading}
              className={`flex-1 rounded-md border px-3 py-1.5 font-mono text-xs uppercase transition-colors ${
                modelVariant === m
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-bg-card text-text-muted hover:border-border-active"
              } ${isLoading ? "cursor-wait opacity-50" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
        {isLoading && (
          <div className="mt-1 font-mono text-[10px] text-accent animate-pulse">
            Loading model...
          </div>
        )}
      </div>

      {/* Overlay Toggles */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Overlay Options
        </div>
        <div className="rounded-md border border-border bg-bg-card p-3 space-y-1">
          <Toggle
            label="Show Skeleton"
            checked={overlay.skeleton}
            onChange={(v) => onOverlayChange({ ...overlay, skeleton: v })}
          />
          <Toggle
            label="Show Landmarks"
            checked={overlay.landmarks}
            onChange={(v) => onOverlayChange({ ...overlay, landmarks: v })}
          />
          <Toggle
            label="Show Angle Arcs"
            checked={overlay.arcs}
            onChange={(v) => onOverlayChange({ ...overlay, arcs: v })}
          />
          <Toggle
            label="Show Distances"
            checked={overlay.distances}
            onChange={(v) => onOverlayChange({ ...overlay, distances: v })}
          />
          <Toggle
            label="Show Landmark IDs"
            checked={overlay.ids}
            onChange={(v) => onOverlayChange({ ...overlay, ids: v })}
          />
        </div>
      </div>

      {/* Detection Confidence */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Detection Confidence: {detectionConfidence.toFixed(1)}
        </div>
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.1}
          value={detectionConfidence}
          onChange={(e) => onDetectionConfidenceChange(parseFloat(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-1 font-mono text-[10px] text-text-muted">
          Lower = more detections but more noise. Default: 0.5
        </div>
      </div>

      {/* Smoothing Factor */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Smoothing Factor: {smoothingFactor.toFixed(1)}
        </div>
        <input
          type="range"
          min={0.1}
          max={1.0}
          step={0.1}
          value={smoothingFactor}
          onChange={(e) => onSmoothingFactorChange(parseFloat(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-1 font-mono text-[10px] text-text-muted">
          EMA: <code className="text-accent">smoothed = prev + factor × (curr - prev)</code>.
          Lower = smoother (more lag), Higher = responsive (jittery).
        </div>
      </div>

      {/* Calibration Reset */}
      <div>
        <button
          onClick={onResetCalibration}
          className="w-full rounded-md border border-border bg-bg-card px-3 py-2 font-mono text-xs text-text-secondary transition-colors hover:border-border-active hover:text-text-primary"
        >
          Reset Height Calibration
        </button>
      </div>

      {/* Landmark Reference */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Landmark Reference
        </div>
        <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-bg-card p-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[10px]">
            {Object.entries(LANDMARK_NAMES).map(([idx, name]) => (
              <div key={idx} className="flex gap-2">
                <span className="w-5 text-right text-text-muted">{idx}</span>
                <span className="text-text-secondary">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
