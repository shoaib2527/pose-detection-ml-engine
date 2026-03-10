# React Native Real-Time Pose Skeleton 🏃‍♂️

A specialized React Native implementation focused on the high-performance rendering of human pose skeletons at the edge. This project demonstrates seamless mapping of 33-point BlazePose landmarks onto a responsive SVG overlay, maintained at a consistent 60 FPS.

---

## 📱 Visual Demonstration

<p align="center">
  <img src="./assets/demo.gif" width="300" alt="Skeleton Overlay Demo" />
</p>

_Above: Dynamic skeleton mapping showing real-time joint tracking and limb connectivity._

---

## 🛠️ Engineering Focus: The Rendering Pipeline

Most React Native vision apps struggle with "UI Lag" because the JS thread gets overwhelmed by coordinate data. This project showcases a solution focused on **UI Thread Efficiency**:

- **Declarative Rendering:** Using `react-native-svg` to translate raw landmark coordinates into a connected skeletal graph.
- **Coordinate Transformation:** A custom scaling engine that maps normalized MediaPipe coordinates (0.0 to 1.0) to absolute device pixels across different screen aspect ratios.
- **Occlusion Handling:** Logic to manage landmark "visibility" scores, ensuring the skeleton only renders high-confidence points to prevent visual jitter.

---

## 🧬 System Architecture

This MVP serves as the **Visualization Layer** for a larger Biometric AI system:

1. **Input:** Real-time 60fps camera feed.
2. **Processing:** On-device inference via MediaPipe (BlazePose).
3. **Mapping:** Translating 33 keypoints into a hierarchical set of interconnected bones.
4. **Output:** A smooth, low-latency SVG skeleton overlay.

---

## 🚀 Key Technical Features

- [x] **Zero-Latency Overlay:** Decoupled rendering logic to prevent JS thread blocking.
- [x] **33-Point Rigging:** Full body tracking from head to ankles.
- [x] **Responsive Scaling:** Auto-adjusts skeleton to fit Portrait/Landscape and various screen densities.
- [ ] **Roadmap:** Adding the Biometric Logic layer (Joint Angle calculation & Exercise classification).

---

## 🧰 Stack

- **Framework:** React Native (New Architecture / Fabric)
- **Vision:** MediaPipe / Google BlazePose
- **Rendering:** React Native SVG
- **Language:** TypeScript
