# Project Rewrite Specification: "Stuff"

## 0. The Vision: "Living Interface" (Kokoro 2.0)
We are building a hyper-polished, emotion-first AI companion. It’s not just a chatbot; it’s a **living interface** that feels present, reactive, and visually stunning. This new repo will be a clean slate to merge the "Brain" of your prototype with the "Soul" of the inspiration design.

### What's Inside? (The Synthesis)
1.  **The "Soul" (Visuals from `face.js`)**
    *   **6 Distinct Personas**: Porting the agent system—**Lumina**, **Volo**, **Myst**, **Zane**, **Flux**, **Echo**.
    *   **Premium Aesthetics**: High-end glassmorphism, dynamic glowing backgrounds, and organic gradients.
    *   **Fluid Motion**: Refined physics and "breathing" animations for every blink, glance, and hover.

2.  **The "Brain" (Logic from `proto-0`)**
    *   **Emotion Engine**: The avatar reacts to *what* it says (sadness -> drooping eyes, color shifts).
    *   **Audio Intelligence**: Real-time frequency analysis drives mouth pulse and pupil size.
    *   **Smart Conversation**: **Vercel AI SDK** with streaming responses so the avatar speaks *as* it thinks.

3.  **The Stack**
    *   **Framework**: Next.js 15.
    *   **Animation**: GSAP + Framer Motion.
    *   **Styling**: Tailwind CSS + CSS Variables.
    *   **Voice**: ElevenLabs integration.

---

## 1. Visual Interface (Source: `public/inspo/face.js`)
**The UI must be pixel-perfect to the inspiration file.**

### A. Face Variants (The "Agents")
The application must support 6 distinct agent personas, each with unique geometry, themes, and animations.
*   **Lumina (Classic)**: Dual ellipses, "Creative Companion", Amber/Gold theme.
*   **Volo (Cyclops)**: Single large eye, "The Focus", Cyan/Teal theme.
*   **Myst (Triad)**: Three eyes (pyramid), "The Visionary", Purple/Fuchsia theme.
*   **Zane (Asymmetric)**: Glitch style, "The Maverick", Rose/Pink theme.
*   **Flux (Geometric)**: Triangular sclera, "The Architect", Indigo/Blue theme.
*   **Echo (Minimal)**: Simple dots, "The Essence", Zinc/Gray theme.

### B. Styling & Theming
*   **CSS Variables**: Use the `face.js` variable system (`--bg-base`, `--text-main`, `--accent-primary`, `--glow-color`).
*   **Glow Effects**: Implementing `drop-shadow` and `filter` stacks for the "premium" feel.
*   **Glassmorphism**: Use `.glass-panel` and `.glass-pill` classes for UI overlays.
*   **Dynamic Gradients**: Moving radial gradients for backgrounds (`ambient-bg` animation).

### C. Animations (CSS & GSAP)
All animations from `face.js` must be ported:
1.  `float`: Gentle vertical hovering of the eye container.
2.  `blink` & `microBlink`: Organic blinking patterns (random intervals).
3.  `pupilMove`: Idle scanning behavior when mouse is inactive.
4.  `glowPulse`: Rhythmic breathing of the background glow.
5.  `wave`: Voice activity bar animation.

---

## 2. Core Logic (Keep from `proto-0`)
**We retain the "brain" and "voice" of the current application.**

### A. The "Voice" (Audio Engine)
*   **Hook**: `useAudioAnalysis.ts`
*   **Functionality**:
    *   Web Audio API context management.
    *   Frequency Analysis: 5-band spectrum (Bass, LowMid, Mid, HighMid, Presence).
    *   Mapping: Audio levels drive visual parameters (Mouth curve, Pupil size, Container scale).
    *   Input Support: Microphone (real-time) and TTS Audio Element.

### B. The "Emotion Engine" (Motion)
*   **State Management**: `baseEmotionRef` vs `targetEmotionRef`.
*   **Interpolation**: Smooth `lerp` transitions between emotional states to prevent jerky movements.
*   **Mappings**:
    *   `Cursor Y` -> Joy/Sadness axis.
    *   `Cursor X` -> Anger/Curiosity axis.
    *   `Audio Bass` -> "Presence" (Pulse).
*   **LLM integration**: Parsing emotion tags from chat responses to drive `targetEmotion`.

### C. Interaction Layer
*   **Physics**: Damped spring physics for gaze tracking.
*   **Gestures**:
    *   **Boop**: Click-to-squash (Haptic feedback).
    *   **Wink**: Individual eye clicks.
*   **Input**: Unified Pointer Events (Mouse + Touch).

---

## 3. Application Architecture (Three-Layer Model)

### Layer 1: Conversation (AI SDK)
*   **Input**: User text/voice.
*   **Processing**: Vercel AI SDK (`streamText`) connecting to user-provided LLM (OpenAI/Gemini).
*   **Output**: Streaming text + Emotion Metadata (JSON).

### Layer 2: Voice (ElevenLabs)
*   **Source**: `/api/tts` route (Server-side proxy).
*   **Output**: Audio stream played via HTMLAudioElement.
*   **Sync**: `useAudioAnalysis` listens to the TTS audio source for lip-sync.

### Layer 3: Visualization (React + GSAP)
*   **Renderer**: SVG-based component (`Avatar.tsx`) driven by `RequestAnimationFrame`.
*   **Composition**:
    *   `Container` (Breathing/Float)
    *   `ScleraGroup` (ClipPaths for variants)
    *   `PupilGroup` (Tracking + Dilating)
    *   `MouthPath` (Audio-reactive Bezier)

---

## 4. Migration Plan (To-Do)
1.  **Scaffold**: clean React/Next.js app.
2.  **Port**: Copy `useAudioAnalysis` and `useVoiceSynthesis` hooks.
3.  **Integrate**: Rebuild `Avatar.tsx` to strictly follow `face.js` DOM structure but use `proto-0`'s math/logic for movement.
4.  **Style**: Copy all CSS from `face.js` into global CSS or Tailwind config.
5.  **Connect**: Wire up the "Brain" (LLM) to the "Face".
