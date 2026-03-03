"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { PoseDetector } from "../mediapipe/pose-detector";
import { DEFAULT_ANGLES, DEFAULT_DISTANCES } from "../mediapipe/landmarks";
import { computeAllAngles, smoothAngle } from "../math/angles";
import { computeAllDistances } from "../math/distances";
import { computeVelocity } from "../math/velocity";
import { computePositionChecks } from "../math/positions";
import type {
  NormalizedLandmark,
  ModelVariant,
  AngleResult,
  DistanceResult,
  PositionChecks,
  VelocityData,
} from "@/types";

interface PoseDetectionState {
  isLoading: boolean;
  isTracking: boolean;
  fps: number;
  confidence: number;
  landmarks: NormalizedLandmark[] | null;
  angles: AngleResult[];
  distances: DistanceResult[];
  positions: PositionChecks;
  velocity: VelocityData;
  squatRatio: number;
}

export function usePoseDetection(
  modelVariant: ModelVariant,
  detectionConfidence: number,
  smoothingFactor: number
) {
  const detectorRef = useRef<PoseDetector | null>(null);
  const rafIdRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const prevLandmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const prevTimestampRef = useRef<number>(0);
  const smoothedAnglesRef = useRef<number[]>([]);
  const frameCountRef = useRef<number>(0);
  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());
  const standingHipYRef = useRef<number>(1);
  const velocityHistoryRef = useRef<number[]>([]);
  const peakVelocityRef = useRef<number>(0);

  const [state, setState] = useState<PoseDetectionState>({
    isLoading: false,
    isTracking: false,
    fps: 0,
    confidence: 0,
    landmarks: null,
    angles: [],
    distances: [],
    positions: { orientation: "Unknown", wristsAboveShoulders: false, handsAboveHead: false },
    velocity: { current: 0, peak: 0, history: [] },
    squatRatio: 1,
  });

  // Initialize/reinitialize detector on model or confidence change
  useEffect(() => {
    const detector = new PoseDetector();
    detectorRef.current = detector;

    setState((s) => ({ ...s, isLoading: true }));
    detector
      .initialize(modelVariant, detectionConfidence)
      .then(() => {
        setState((s) => ({ ...s, isLoading: false }));
      })
      .catch(() => {
        setState((s) => ({ ...s, isLoading: false }));
      });

    return () => {
      detector.close();
    };
  }, [modelVariant, detectionConfidence]);

  const startDetection = useCallback((video: HTMLVideoElement) => {
    const detectFrame = () => {
      const detector = detectorRef.current;
      if (!detector?.isReady) {
        rafIdRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      const now = performance.now();

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        const result = detector.detect(video, now);

        if (result?.landmarks && result.landmarks.length > 0) {
          const lm = result.landmarks[0]!;

          // Compute angles
          const rawAngles = computeAllAngles(lm, DEFAULT_ANGLES);

          // Smooth angles
          if (smoothedAnglesRef.current.length === 0) {
            smoothedAnglesRef.current = rawAngles.map((a) => a.degrees);
          } else {
            smoothedAnglesRef.current = rawAngles.map((a, i) =>
              smoothAngle(a.degrees, smoothedAnglesRef.current[i] ?? a.degrees, smoothingFactor)
            );
          }
          const smoothedAngleResults: AngleResult[] = rawAngles.map((a, i) => ({
            ...a,
            degrees: smoothedAnglesRef.current[i] ?? a.degrees,
          }));

          // Compute distances
          const dists = computeAllDistances(lm, DEFAULT_DISTANCES);

          // Compute positions
          const posChecks = computePositionChecks(lm);

          // Compute velocity (nose landmark)
          let vel = 0;
          const nose = lm[0];
          const prevNose = prevLandmarksRef.current?.[0];
          if (nose && prevNose && prevTimestampRef.current > 0) {
            vel = computeVelocity(nose, prevNose);
          }
          if (vel > peakVelocityRef.current) {
            peakVelocityRef.current = vel;
          }
          velocityHistoryRef.current.push(vel);
          if (velocityHistoryRef.current.length > 30) {
            velocityHistoryRef.current.shift();
          }

          // Squat ratio auto-calibration
          const lHip = lm[23];
          const rHip = lm[24];
          if (lHip && rHip) {
            const hipY = (lHip.y + rHip.y) / 2;
            if (hipY < standingHipYRef.current) {
              standingHipYRef.current = hipY;
            }
          }
          const sqRatio =
            lHip && rHip
              ? (lHip.y + rHip.y) / 2 / standingHipYRef.current
              : 1;

          // Compute average confidence
          const avgVis =
            lm.reduce((sum, l) => sum + (l.visibility ?? 0), 0) / lm.length;

          // Store previous frame
          prevLandmarksRef.current = lm;
          prevTimestampRef.current = now;

          // FPS tracking
          fpsFrameCountRef.current++;
          const fpsElapsed = now - fpsLastTimeRef.current;
          let currentFps = state.fps;
          if (fpsElapsed >= 1000) {
            currentFps = Math.round(
              (fpsFrameCountRef.current * 1000) / fpsElapsed
            );
            fpsFrameCountRef.current = 0;
            fpsLastTimeRef.current = now;
          }

          // Throttle state updates to every 3 frames
          frameCountRef.current++;
          if (frameCountRef.current % 3 === 0) {
            setState({
              isLoading: false,
              isTracking: true,
              fps: currentFps,
              confidence: Math.round(avgVis * 100),
              landmarks: lm,
              angles: smoothedAngleResults,
              distances: dists,
              positions: posChecks,
              velocity: {
                current: vel,
                peak: peakVelocityRef.current,
                history: [...velocityHistoryRef.current],
              },
              squatRatio: sqRatio,
            });
          }
        } else {
          frameCountRef.current++;
          if (frameCountRef.current % 3 === 0) {
            setState((s) => ({
              ...s,
              isTracking: false,
              landmarks: null,
              angles: [],
              distances: [],
            }));
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(detectFrame);
    };

    rafIdRef.current = requestAnimationFrame(detectFrame);
  }, [smoothingFactor, state.fps]);

  const stopDetection = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    prevLandmarksRef.current = null;
    prevTimestampRef.current = 0;
    smoothedAnglesRef.current = [];
    frameCountRef.current = 0;
    setState((s) => ({
      ...s,
      isTracking: false,
      landmarks: null,
      angles: [],
      distances: [],
    }));
  }, []);

  const resetCalibration = useCallback(() => {
    standingHipYRef.current = 1;
    peakVelocityRef.current = 0;
    velocityHistoryRef.current = [];
  }, []);

  return { ...state, startDetection, stopDetection, resetCalibration };
}
