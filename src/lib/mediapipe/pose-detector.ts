import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { ModelVariant } from "@/types";
import { MODEL_URLS, WASM_CDN } from "./types";

export class PoseDetector {
  private landmarker: PoseLandmarker | null = null;

  async initialize(
    variant: ModelVariant,
    detectionConfidence: number
  ): Promise<void> {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }

    const vision = await FilesetResolver.forVisionTasks(WASM_CDN);

    this.landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URLS[variant],
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: detectionConfidence,
      minPosePresenceConfidence: detectionConfidence,
      minTrackingConfidence: detectionConfidence,
    });
  }

  detect(
    video: HTMLVideoElement,
    timestampMs: number
  ): PoseLandmarkerResult | null {
    if (!this.landmarker) return null;
    return this.landmarker.detectForVideo(video, timestampMs);
  }

  close(): void {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
  }

  get isReady(): boolean {
    return this.landmarker !== null;
  }
}
