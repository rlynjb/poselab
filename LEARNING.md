# Learning MediaPipe Pose Detection

A practical learning path for developers who want to understand pose detection and build exercise tracking on top of MediaPipe.

---

## How MediaPipe Works (The Mental Model)

MediaPipe is a black box that turns a video frame into **33 body coordinate points**. Each point has:

- `x` — horizontal position (0.0 = left edge, 1.0 = right edge)
- `y` — vertical position (0.0 = top, 1.0 = bottom)
- `z` — depth relative to hip midpoint (negative = closer to camera)
- `visibility` — confidence that this point is visible (0.0–1.0)

```
Camera frame → MediaPipe model → 33 landmarks (x, y, z, visibility) → Your code
```

Everything after the landmarks is **just geometry** — no ML knowledge required.

---

## The 33 Landmarks

```
        0: nose
       / \
     7: L ear    8: R ear
     |              |
    11: L shoulder --- 12: R shoulder
     |                    |
    13: L elbow       14: R elbow
     |                    |
    15: L wrist       16: R wrist
     |                    |
    23: L hip      --- 24: R hip
     |                    |
    25: L knee        26: R knee
     |                    |
    27: L ankle       28: R ankle
```

Full index reference:

```
 0  Nose            17 L Pinky
 1  L Eye Inner     18 R Pinky
 2  L Eye           19 L Index
 3  L Eye Outer     20 R Index
 4  R Eye Inner     21 L Thumb
 5  R Eye           22 R Thumb
 6  R Eye Outer     23 L Hip
 7  L Ear           24 R Hip
 8  R Ear           25 L Knee
 9  L Mouth         26 R Knee
10  R Mouth         27 L Ankle
11  L Shoulder      28 R Ankle
12  R Shoulder      29 L Heel
13  L Elbow         30 R Heel
14  R Elbow         31 L Foot Index
15  L Wrist         32 R Foot Index
16  R Wrist
```

---

## Math Foundations

### Tier 1 — Essential

These are the building blocks for everything else. High school geometry level.

#### Euclidean Distance

How far apart two body points are.

```
distance = sqrt((x2 - x1)² + (y2 - y1)²)
```

**Used for:** Stance width, arm spread, wrist-to-wrist distance, detecting jumping jacks.

```ts
function dist2D(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
```

#### Vectors and Dot Product

A vector is just a direction from one point to another. The dot product tells you how aligned two vectors are.

```
Given points A, B, C — compute the angle at B:

    A
   /
  / angle
 B --------C

Vector BA = A - B
Vector BC = C - B
dot = BA.x * BC.x + BA.y * BC.y + BA.z * BC.z
```

**Used for:** Every joint angle calculation.

#### Angle Calculation (acos)

Convert the dot product into degrees:

```
cosAngle = dot / (|BA| × |BC|)
angle = acos(cosAngle) × (180 / π)
```

Full implementation:

```ts
function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0) };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: (c.z ?? 0) - (b.z ?? 0) };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

  if (magBA === 0 || magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}
```

**Key angles for exercises:**

| Angle | Landmarks (A → B → C) | Measures |
|-------|----------------------|----------|
| Elbow | Shoulder → Elbow → Wrist | Arm bend (curls, pushups) |
| Knee | Hip → Knee → Ankle | Leg bend (squats, lunges) |
| Shoulder | Hip → Shoulder → Elbow | Arm raise (overhead press) |
| Hip | Shoulder → Hip → Knee | Torso lean (deadlifts, squats) |

---

### Tier 2 — Exercise Detection

#### Thresholds

The simplest form of detection — compare an angle to a number:

```ts
const kneeAngle = calculateAngle(hip, knee, ankle);

if (kneeAngle < 90) {
  // Deep squat
} else if (kneeAngle < 130) {
  // Partial squat
} else {
  // Standing
}
```

Threshold values are found through experimentation. Run the app, do the exercise, and observe what angle values correspond to each position.

#### State Machines

A state machine tracks where someone is in a repetition cycle. This is how you count reps.

```
          angle decreasing
 IDLE ─────────────────────► DESCENDING
  ▲                              │
  │                              │ angle < bottom threshold
  │                              ▼
  │    angle > top threshold   AT_BOTTOM
  │                              │
  │                              │ angle increasing
  │                              ▼
  └──────────────────────── ASCENDING
         count + 1
```

Implementation:

```ts
type RepState = "idle" | "descending" | "at_bottom" | "ascending";

let state: RepState = "idle";
let repCount = 0;
let previousAngle = 180;

function updateRep(currentAngle: number) {
  const isDecreasing = currentAngle < previousAngle - 2; // 2° buffer for noise
  const isIncreasing = currentAngle > previousAngle + 2;

  switch (state) {
    case "idle":
      if (isDecreasing && currentAngle < 160) state = "descending";
      break;
    case "descending":
      if (currentAngle < 90) state = "at_bottom";
      break;
    case "at_bottom":
      if (isIncreasing) state = "ascending";
      break;
    case "ascending":
      if (currentAngle > 160) {
        state = "idle";
        repCount++;
      }
      break;
  }

  previousAngle = currentAngle;
}
```

#### Exponential Moving Average (Smoothing)

Raw landmark data is noisy — angles jump by a few degrees between frames even when standing still. EMA smooths this out:

```
smoothed = previous + factor × (current - previous)
```

- `factor = 0.1` — very smooth, but laggy (good for slow exercises)
- `factor = 0.4` — balanced (good default)
- `factor = 1.0` — no smoothing (raw data)

```ts
function smooth(current: number, previous: number, factor: number): number {
  return previous + factor * (current - previous);
}
```

#### Velocity (Rate of Change)

How fast a body part is moving between frames:

```ts
velocity = sqrt((curr.x - prev.x)² + (curr.y - prev.y)²) × 1000
```

**Used for:**
- Detecting explosive vs controlled movement
- Finding the pause at the bottom of a rep
- Measuring rep speed / tempo

---

### Tier 3 — Advanced Techniques

#### Body-Size Normalization

Raw distances depend on how far the person is from the camera. Normalize by dividing by a reference measurement (like shoulder width):

```ts
const shoulderWidth = dist2D(leftShoulder, rightShoulder);
const normalizedArmSpan = dist2D(leftWrist, rightWrist) / shoulderWidth;
// Now this value is ~1.0 regardless of camera distance
```

#### Camera Angle Compensation

MediaPipe gives 2D projections of a 3D body. If the person is turned sideways, angles become unreliable. Detect this by checking if both shoulders are visible and at similar Y positions:

```ts
function isFacingCamera(landmarks: Landmark[]): boolean {
  const ls = landmarks[11]; // L shoulder
  const rs = landmarks[12]; // R shoulder
  return Math.abs(ls.y - rs.y) < 0.08 && (ls.visibility ?? 0) > 0.7 && (rs.visibility ?? 0) > 0.7;
}
```

#### Bilateral Averaging

Average left + right side landmarks so detection works regardless of which side faces the camera:

```ts
function averageLandmarks(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
    visibility: Math.min(a.visibility ?? 0, b.visibility ?? 0),
  };
}

// Use averaged shoulder → averaged hip → averaged ankle for body alignment
const avgShoulder = averageLandmarks(landmarks[11], landmarks[12]);
const avgHip = averageLandmarks(landmarks[23], landmarks[24]);
```

---

## Exercise Detection Recipes

### Bicep Curl (Easiest — start here)

**Watch:** Elbow angle (Shoulder → Elbow → Wrist)

```
Standing:  ~160°
Top of curl: ~30°

State machine:
  IDLE (> 140°) → CURLING (decreasing) → CURLED (< 50°) → RETURNING (increasing) → IDLE (count++)
```

**Form checks:**
- Upper arm should stay roughly vertical: `abs(shoulder.x - elbow.x) < 0.05`
- Elbow shouldn't drift forward: `elbow.x` stays near `shoulder.x`

### Squat

**Watch:** Knee angle (Hip → Knee → Ankle) + Hip angle (Shoulder → Hip → Knee)

```
Standing:  Knee ~170°, Hip ~170°
Bottom:    Knee ~70-90°, Hip ~70-90°

Form checks:
- Knees over toes: knee.x should stay near ankle.x
- Back straight: hip angle shouldn't drop below knee angle significantly
- Depth: knee angle < 90° = parallel or below
```

### Push-Up

**Watch:** Elbow angle (Shoulder → Elbow → Wrist)

```
Top:     Elbow ~170° (arms extended)
Bottom:  Elbow ~70-90° (chest near ground)

Form checks:
- Body alignment: shoulder → hip → ankle should be roughly linear (~170°+)
- If hip angle drops significantly, the person is sagging
```

### Overhead Press

**Watch:** Shoulder angle (Hip → Shoulder → Elbow) + Elbow angle

```
Start:   Shoulder ~40°, Elbow ~70° (bar at shoulder height)
Top:     Shoulder ~170°, Elbow ~170° (arms fully extended overhead)

Detection: wrists above head (wrist.y < nose.y) at top position
```

### Jumping Jack

**Watch:** Distances, not angles

```
Arms down:  wrist-to-wrist distance is small, ankle spread is small
Arms up:    wrist-to-wrist distance is large, ankle spread is large

Threshold: normalize by shoulder width
  Spread ratio = wrist_distance / shoulder_width
  > 3.0 = arms out, < 1.5 = arms down
```

---

## Common Pitfalls

### 1. Noise and Jitter
Raw angles fluctuate 3-5° per frame even when still. Always apply smoothing (EMA) before using values for detection.

### 2. Camera Angle Sensitivity
MediaPipe works best when the full body is visible and roughly facing the camera. Side views cause depth ambiguity — angles become unreliable. Check visibility scores before trusting readings.

### 3. Threshold Sensitivity
Hard-coded thresholds break for different body proportions, camera distances, and camera angles. Add a calibration step or use relative thresholds (e.g., "angle decreased by 50% from standing" instead of "angle < 90°").

### 4. Frame Rate Dependence
Velocity calculations depend on frame rate. If FPS drops, velocity spikes falsely. Normalize by `deltaTime` between frames:

```ts
const deltaTime = currentTimestamp - previousTimestamp;
const velocity = distance / deltaTime; // now frame-rate independent
```

### 5. Left/Right Confusion
MediaPipe labels "left" and "right" from the **person's perspective**, not the camera's. With mirroring enabled (as in this app), the person's left appears on the right side of the screen.

---

## Learning Resources

### MediaPipe
- [Pose Landmarker Guide (Web)](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js) — official setup and API docs
- [Pose Landmarker API Reference](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) — landmark definitions, model details
- [MediaPipe GitHub](https://github.com/google-ai-edge/mediapipe) — source code, issues, examples

### Math
- [Khan Academy — Vectors and Spaces](https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces) — dot product, magnitude (just the first few sections)
- [3Blue1Brown — Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab) — visual intuition for vectors (episodes 1-4 are enough)

### Pose Detection / Computer Vision
- [MediaPipe BlazePose paper](https://arxiv.org/abs/2006.10204) — how the model works internally (optional, for curiosity)
- [Nicholas Renotte — MediaPipe Pose Estimation](https://www.youtube.com/watch?v=06TE_U21FK4) — practical YouTube walkthrough of rep counting

---

## Suggested Learning Order

1. **Run this app** (`npm run dev`) — move around, watch angles and landmarks change in real time
2. **Read the landmark map above** — memorize which index is which body part (you'll reference these constantly)
3. **Understand the angle formula** — try computing one angle by hand with coordinates from the Landmarks tab
4. **Build a bicep curl counter** — simplest exercise, just one angle + a basic state machine
5. **Add form checking** — detect if the elbow drifts forward during the curl
6. **Try squats** — requires two angles (knee + hip) and more sophisticated state machine
7. **Explore normalization** — make your detection work at different camera distances
8. **Experiment with the Config panel** — change smoothing, confidence thresholds, and model variants to see how they affect detection quality
