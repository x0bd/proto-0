<p align="center">
  <img src="public/face-1.png" alt="DOT — minimal variant" width="180" />
  &nbsp;&nbsp;&nbsp;
  <img src="public/face-2.png" alt="DOT — analogue variant" width="180" />
  &nbsp;&nbsp;&nbsp;
  <img src="public/face-3.png" alt="DOT — tron variant" width="180" />
</p>

<h1 align="center">DOT</h1>

<p align="center">
  <strong>An SVG face that feels. Emotion mapped to geometry, in real time.</strong>
</p>

<p align="center">
  <a href="https://dot-0.vercel.app/">Live Demo</a> &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/package/@xoboid/avatar">npm</a> &nbsp;·&nbsp;
  <a href="https://xoboid.com">xoboid.com</a>
</p>

---

## What is this

DOT is a research project exploring one question: **what does machine emotion look like when the interface _is_ the face?**

Most AI companions hide behind chat boxes and loading spinners. DOT is the opposite — the face *is* the UI. Every emotional state, every audio reaction, every cursor movement maps directly to the geometry of a minimal SVG face. No text, no icons, no chrome. Just shape and motion.

The core is an emotion engine with five axes — joy, sadness, surprise, anger, curiosity — that interpolates smoothly between states. Layer on microphone input, real-time audio frequency analysis, and pointer tracking, and the face becomes a live mirror of whatever is happening in the session.

It ships as a standalone React component on npm (`@xoboid/avatar`) that you can drop into any project.

---

## Features

### Emotion Engine
Five-axis float model (`joy · sadness · surprise · anger · curiosity`), each `0–1`. States interpolate via a per-frame lerp loop — no jarring snaps, no keyframe transitions. The face is always *somewhere* between states, drifting toward the target at a configurable rate.

### Voice Reactive
Microphone input is analyzed across five frequency bands in real time using the Web Audio API:

| Band | Range | Drives |
|---|---|---|
| `bass` | 60–250 Hz | Container breathing / scale pulse |
| `lowMid` | 250–500 Hz | Mouth opening (primary) |
| `mid` | 500–2000 Hz | Mouth width variation |
| `highMid` | 2000–4000 Hz | Eye micro-pulse |
| `presence` | 4000–8000 Hz | Random glances |

### Cursor & Gesture Tracking
Pointer position maps to emotional state — moving up triggers joy, down sadness, left/right curiosity and anger. On mobile, swipe left/right cycles through emotion presets. The entire interaction field uses a dead zone and smooth clamping so it never feels mechanical.

### Face Variants
Three visual archetypes with completely distinct geometry and animation feel:

| Variant | Style | Eyes | Animation |
|---|---|---|---|
| `minimal` | Clean, soft | Solid ellipses | Smooth sinusoidal |
| `tron` | Digital, sharp | Rounded rects | Stepped (retro CRT) |
| `analogue` | Hand-drawn | Stroked ellipses + pencil filter | Organic wobble + boil |

### Built-in Autonomous Behaviors
No config needed — these run on their own:
- **Blinking** — randomized 2.5–6s intervals, variant-styled
- **Breathing** — subtle scale oscillation, tempo varies by variant
- **Glancing** — micro eye movements every 4–12s
- **Idle mouth** — gentle resting wave on the mouth curve
- **Pointer repulsion** — face subtly leans away when cursor gets very close
- **Pencil boil** — SVG turbulence filter animation on `analogue`

### Export
Capture the current expression as a **1024×1024 PNG** (resolves CSS variables, `currentColor`, and computed styles before serializing the SVG) or record a **4-second animated GIF** at 10fps.

### Theming
One accent color paints the entire face. Full HSV spectrum picker. Color persists in `localStorage` and is applied via CSS variables, so the glow, fill, stroke, and UI chrome all update atomically.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | File-based routing, server components, streaming |
| UI | **React 18** + **TypeScript** | Component model, strict typing |
| SVG Animation | **GSAP 3** | Sub-frame precision, imperative control over individual SVG attributes |
| UI Transitions | **Motion/React** | Declarative spring physics for shells, modals, dock |
| Styling | **Tailwind CSS v4** | Utility-first, zero-runtime, CSS variable theming |
| Voice Synthesis | **Web Speech API** | Native TTS, no external dependency |
| Audio Analysis | **Web Audio API** | Real-time FFT, multi-band frequency extraction |
| Deployment | **Vercel** | Edge network, preview URLs per commit |

### Why GSAP for the face, not CSS or Motion?

CSS transitions and spring-based animation libraries are declarative — you describe the end state. GSAP is imperative — you control the exact timeline, per attribute, per frame. For a face where 12+ SVG attributes need to update in sync every animation frame, GSAP's `gsap.to()` with shared timelines gives precise control that declarative approaches can't match without significant overhead.

---

## The Package — `@xoboid/avatar`

The face component is extracted into a standalone, tree-shakeable npm package. Drop it into any React project:

```bash
npm i @xoboid/avatar gsap
```

```tsx
import { Avatar } from "@xoboid/avatar";
import "@xoboid/avatar/avatar.css";

<Avatar
  emotion={{ joy: 0.8, sadness: 0, surprise: 0.2, anger: 0, curiosity: 0.3 }}
  variant="minimal"
  color="#FF6B6B"
  interactive
/>
```

Peer dependencies: `react ≥ 18`, `gsap ≥ 3.12`. Ships as ESM + CJS with full TypeScript declarations.

→ [Full package docs on npm](https://www.npmjs.com/package/@xoboid/avatar)

---

## Architecture

```
proto-0/
├── app/
│   ├── page.tsx                    # Root — emotion engine, audio loop, layout
│   ├── layout.tsx                  # Fonts, theme provider, metadata
│   └── components/
│       ├── Avatar.tsx              # Thin wrapper around @xoboid/avatar
│       ├── face/
│       │   ├── Eyes.tsx            # Eye geometry per variant
│       │   ├── Mouth.tsx           # Mouth curve + audio deformation
│       │   └── Ears.tsx            # Ear details
│       ├── CustomizationModal.tsx  # Name, color, variant picker
│       ├── DownloadButton.tsx      # PNG + GIF export engine
│       └── ChatWindow.tsx          # Conversation interface
├── components/
│   └── floating-dock.tsx           # Bottom nav — voice toggle, preset selector
├── hooks/
│   └── useAudioAnalysis.ts         # Web Audio API — FFT + band extraction
├── packages/
│   └── avatar/                     # @xoboid/avatar — published to npm
│       ├── src/
│       │   ├── Avatar.tsx          # Core component
│       │   ├── index.ts            # Public API surface
│       │   └── types.ts            # EmotionState, FaceVariant, AvatarHandle
│       └── package.json            # tsup build, ESM/CJS, peer deps
└── public/
    ├── face-1.png                  # minimal variant screenshot
    ├── face-2.png                  # analogue variant screenshot
    └── face-3.png                  # tron variant screenshot
```

### Data flow

```
Microphone → useAudioAnalysis → AudioLevels → Avatar (mouth, eyes, breathing)
Cursor     → onMouseMove      → EmotionState → lerp loop → Avatar
Swipe      → onDragEnd        → EmotionPreset → baseEmotion → lerp loop → Avatar
```

The lerp loop runs at 60fps via `requestAnimationFrame`. `targetEmotionRef` holds the destination state, `baseEmotionRef` holds the resting state. Every frame, the current emotion moves 8% toward the target and the base drifts 1.5% toward the current — creating a natural inertia where the face settles slowly after a stimulus ends.

---

## Getting Started

```bash
git clone https://github.com/x0bd/proto-0
cd proto-0
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

No API keys required to run the face. The chat and TTS endpoints need keys (`.env.local`):

```bash
OPENAI_API_KEY=...         # or GOOGLE_GENERATIVE_AI_API_KEY
```

---

## Status

Active prototype. The core emotion engine and face variants are stable. Current work:

- [ ] Emotion inference from speech content (not just audio level)
- [ ] More face variants
- [ ] Configurable lerp speeds per axis

Feedback, issues, and PRs welcome.

---

<p align="center">
  Built by <a href="https://xoboid.com">xoboid</a>
</p>
