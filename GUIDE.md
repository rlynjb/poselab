# Pose Lab — App Guide

A hands-on guide to using Pose Lab for learning how MediaPipe pose detection works.

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in Chrome or Edge (best WebGPU/WASM support).

---

## Interface Overview

```
┌──────────────────────────────────────────────────────┐
│  HEADER:  [POSE LAB]  [MediaPipe]   [Model: Lite]   │
│                                      [Start Camera]  │
├──────────────────────────────┬───────────────────────┤
│                              │  SIDEBAR              │
│                              │  ┌─────────────────┐  │
│     VIEWPORT                 │  │ ANGLES │ LAND-  │  │
│     (Camera + Canvas)        │  │ MARKS  │ MET-   │  │
│                              │  │ RICS   │ CONFIG  │  │
│     Floating stats:          │  │                 │  │
│     [● Tracking] [FPS: 30]  │  │ (active panel)  │  │
│     [Confidence: 92%]        │  │                 │  │
│                              │  └─────────────────┘  │
└──────────────────────────────┴───────────────────────┘
```

---

## Step-by-Step Walkthrough

### 1. Start the Camera

Click **Start Camera** in the top-right. Your browser will ask for camera permission — allow it.

Once streaming, you'll see:
- Your mirrored webcam feed in the viewport
- A loading spinner while the MediaPipe model downloads (~3MB for Lite)
- Floating stat pills once detection begins: **Tracking** status, **FPS**, and **Confidence %**

### 2. The Angles Tab (default)

This is where most learning happens. You'll see 9 joint angles updating in real time:

| Angle | What it measures | Try this |
|-------|-----------------|----------|
| **L/R Elbow** | How bent your arm is | Extend your arm (→ ~170°), then curl it (→ ~30°) |
| **L/R Knee** | How bent your leg is | Stand straight (~170°), then squat (~80°) |
| **L/R Shoulder** | How raised your arm is | Arms at sides (~20°), then raise overhead (~170°) |
| **L/R Hip** | Torso lean angle | Stand tall (~170°), then bend forward (~90°) |
| **Body Align** | Overall posture | Stand straight (~175°), then slouch to see it drop |

Each angle shows:
- The name on the left
- A color-coded progress bar (proportion of 180°)
- The degree value on the right

**What to observe:** Move slowly and watch how angles change smoothly. The info card at the top explains the math formula being used.

### 3. The Landmarks Tab

Switch to the **LANDMARKS** tab to see raw data for all 33 body points.

Each row shows:

| Column | Meaning |
|--------|---------|
| **#** | Landmark index (0–32) |
| **Name** | Body part name |
| **X** | Horizontal position (0.0 = left edge → 1.0 = right edge) |
| **Y** | Vertical position (0.0 = top → 1.0 = bottom) |
| **Z** | Depth from hip midpoint (negative = closer to camera) |
| **Vis** | Confidence that this point is visible (0.0–1.0) |

**What to try:**
- Stand still and note your nose X/Y coordinates
- Move left — watch X increase (remember: the view is mirrored)
- Crouch down — watch Y values increase (Y goes top-to-bottom)
- Turn sideways — watch visibility scores drop for occluded landmarks
- Cover one hand — watch that wrist's visibility drop near 0

**Dimmed rows** have low visibility (< 0.5) — MediaPipe is guessing those positions.

### 4. The Metrics Tab

Four measurement categories, each teaching a different detection technique:

#### Distances
Shows how far apart body parts are in normalized units (0–1 range):
- **Wrist-to-Wrist** — spread your arms wide to maximize, bring hands together to minimize
- **Shoulder Width** — fairly constant, useful as a normalization reference
- **Hip Width** — similar to shoulders
- **Ankle Spread** — spread your feet to increase

**Try:** Do a jumping jack and watch wrist-to-wrist and ankle spread change simultaneously.

#### Relative Positions
Binary checks about body part relationships:
- **Orientation** — Stand up ("Standing"), lie on the floor ("Lying Down"), do a handstand ("Inverted")
- **Wrists above Shoulders?** — Raise your hands above your shoulders to see "Yes ↑"
- **Hands above Head?** — Raise your hands above your head to see "Yes ↑"

**Try:** Slowly raise your arms from your sides to above your head. Watch the two checks flip from "No" to "Yes" at different heights.

#### Ratios
- **Squat Depth Ratio** — starts at 1.0 (standing). Squat down and watch it increase. The app auto-calibrates by tracking your highest hip position as the "standing" baseline.

**Try:** Stand tall for a moment (let it calibrate), then squat. A value of ~1.3 means your hips dropped 30% below standing height.

#### Velocity
Tracks how fast your nose moves between frames:
- **Current** — instantaneous speed
- **Peak** — highest speed seen this session
- **Sparkline** — a 30-frame bar chart. Pink bars = high velocity (> 70% of peak)

**Try:**
- Stand perfectly still — velocity near 0
- Move your head slowly — small green bars
- Snap your head quickly — pink spike in the sparkline
- Jump — large pink spike

### 5. The Config Tab

Controls that change how detection and visualization work.

#### Model Variant
Three models with different speed/accuracy tradeoffs:

| Model | Size | When to use |
|-------|------|-------------|
| **Lite** | ~3MB | Default. Fast, good enough for most experiments |
| **Full** | ~6MB | When Lite struggles with tricky angles |
| **Heavy** | ~16MB | Best accuracy, but slower. Use when precision matters |

**Try:** Switch to Heavy, then try a side-angle pose that Lite couldn't track well. Compare the landmark stability.

Switching models requires re-downloading — you'll see a loading spinner.

#### Overlay Options

Five toggles controlling what's drawn on the camera feed:

| Toggle | Default | What it shows |
|--------|---------|---------------|
| **Show Skeleton** | ON | Green lines connecting body landmarks |
| **Show Landmarks** | ON | Colored dots at each body point (blue = face, green = upper body, gold = lower body) |
| **Show Angle Arcs** | ON | Arcs at joints with degree labels |
| **Show Distances** | OFF | Dashed lines between distance pairs with values |
| **Show Landmark IDs** | OFF | Index numbers (0–32) next to each dot |

**Try:**
1. Turn everything OFF — see just the raw camera feed
2. Turn on **Landmark IDs** only — identify which number is which body part
3. Turn on **Distances** — see the measurement lines overlaid
4. Turn everything ON — the full visualization

#### Detection Confidence (slider: 0.1–0.9)

Controls how certain MediaPipe needs to be before reporting a pose.

- **Lower (0.1–0.3)** — detects poses more easily, but more noise and false positives
- **Default (0.5)** — balanced
- **Higher (0.7–0.9)** — only reports high-confidence detections, may lose tracking in tricky positions

**Try:** Lower to 0.2, then turn sideways or partially hide behind something. MediaPipe will try harder to maintain detection. Then raise to 0.8 — it'll drop tracking more easily but the data it does report will be more reliable.

Note: Changing this re-initializes the model (brief loading pause).

#### Smoothing Factor (slider: 0.1–1.0)

Controls how much angle readings are smoothed using Exponential Moving Average.

- **0.1** — very smooth, angles change slowly (noticeable lag when you move fast)
- **0.4** — default, good balance
- **1.0** — no smoothing, raw jittery data

**Try:** Set to 0.1, wave your arm, and watch the elbow angle lag behind your movement. Then set to 1.0 and see it react instantly but jitter when you hold still.

#### Reset Height Calibration

Resets the standing hip position used for squat depth ratio. Click this if the ratio seems off (e.g., if you started the app while sitting).

#### Landmark Reference

A quick-reference table of all 33 landmark indices and names. Useful when you're looking at the Landmarks tab or have Landmark IDs enabled on the overlay.

---

## Experiments to Try

These exercises are designed to build your understanding of how pose data maps to real movement.

### Experiment 1: Understand the Coordinate System
1. Open the **Landmarks** tab
2. Watch landmark #0 (Nose)
3. Move left/right — observe X change
4. Move up/down — observe Y change
5. Move toward/away from camera — observe Z change
6. Question: Why does X increase when you move to YOUR left? (Answer: the view is mirrored, but coordinates are in camera space)

### Experiment 2: Visibility and Occlusion
1. Open the **Landmarks** tab
2. Put one hand behind your back
3. Watch that hand's wrist visibility drop
4. Note: MediaPipe still reports X/Y/Z even with low visibility — it's guessing
5. Question: At what visibility threshold should you stop trusting the data? (Try 0.3–0.5)

### Experiment 3: Angle Ranges
1. Open the **Angles** tab
2. For each joint, find the practical min/max angle by moving to extreme positions
3. Record what you observe:
   - Elbow: fully extended = ___°, fully bent = ___°
   - Knee: standing = ___°, deep squat = ___°
   - Shoulder: arms at sides = ___°, overhead = ___°
4. These ranges are what you'd use as thresholds in an exercise detector

### Experiment 4: Smoothing vs Responsiveness
1. Open the **Config** tab
2. Set smoothing to **1.0** (no smoothing)
3. Hold still and watch the angle values jitter
4. Set smoothing to **0.1** (heavy smoothing)
5. Wave your arm and notice the lag
6. Find YOUR preferred balance — this is a real tradeoff in exercise tracking apps

### Experiment 5: Model Comparison
1. Strike an unusual pose (twist, reach behind you, or face sideways)
2. Note the confidence % and which landmarks have low visibility
3. Switch from **Lite** to **Heavy**
4. Compare: Does Heavy track the same pose better? Check the confidence % and landmark visibility

### Experiment 6: Simulated Bicep Curl Detection
1. Open the **Angles** tab
2. Stand with arms at your sides — note the L Elbow angle (~160°)
3. Slowly curl your left arm up — watch the angle decrease
4. At the top of the curl, note the angle (~30-40°)
5. Now you know: a curl counter needs to detect the transition from ~160° → ~40° → ~160°

### Experiment 7: Distance-Based Detection
1. Open the **Metrics** tab and enable **Show Distances** in Config
2. Stand with arms at your sides — note the Wrist-to-Wrist distance
3. Do a jumping jack — watch the distance spike
4. The threshold between "arms down" and "arms up" is somewhere around 2-3x shoulder width

### Experiment 8: Velocity Patterns
1. Open the **Metrics** tab, look at the Velocity section
2. Stand still — velocity near 0
3. Do 3 slow squats, then 3 fast squats
4. Compare the sparkline patterns — slow reps should show lower, wider bars; fast reps should show tall, narrow spikes
5. This is how you'd detect "tempo" in an exercise tracking app

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Camera access denied" | Check browser permissions — click the camera icon in the URL bar |
| Low FPS (< 15) | Switch to Lite model, close other tabs, check if GPU is available |
| Jittery angles | Increase smoothing factor (Config tab), or switch to Heavy model |
| Tracking lost frequently | Lower detection confidence in Config, ensure good lighting |
| Landmarks flicker | Some body parts are partially occluded — check visibility values |
| Model won't load | Check internet connection (models are loaded from Google CDN) |
| No skeleton drawn | Check that "Show Skeleton" toggle is ON in Config |

---

## What's Next?

After exploring the app, you're ready to build on top of it. See [LEARNING.md](LEARNING.md) for:
- The math foundations in detail (vectors, dot products, angles)
- Exercise detection recipes (bicep curl, squat, push-up, overhead press, jumping jack)
- State machine patterns for rep counting
- Common pitfalls and how to avoid them
