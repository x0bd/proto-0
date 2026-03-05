# `@dot/avatar` — Component Package Plan

A self-contained, zero-config React component that renders an expressive SVG face driven by emotion, audio, and arbitrary data feeds. Publishable to npm.

---

## Goals

- Drop-in React component: `<Avatar />` renders and animates with no required props
- Fully typed TypeScript API
- Peer dep on `gsap` only (no other animation runtime)
- No CSS-in-JS — ships a single optional CSS file for defaults
- SSR-safe (Next.js, Remix, Vite, CRA)
- Tree-shakeable — consumers import only what they use
- Imperative escape hatch via `ref` for advanced control
- Extensible **data adapter** pattern so any signal (weather, AI, WebSocket, cursor) can drive emotion or interaction

---

## Package Structure

```
packages/avatar/
├── src/
│   ├── index.ts                  # Public barrel export
│   ├── Avatar.tsx                # Core component
│   ├── types.ts                  # All public TypeScript types
│   ├── face/
│   │   ├── Eyes.tsx
│   │   ├── Mouth.tsx
│   │   ├── Ears.tsx
│   │   ├── themes.ts
│   │   └── types.ts
│   ├── hooks/
│   │   ├── useAudioAnalysis.ts   # Mic / audio element → AudioLevels
│   │   ├── useVoiceSynthesis.ts  # TTS → speaking state + audio
│   │   ├── useEmotion.ts         # Utility: blend/lerp emotion states
│   │   └── useDataFeed.ts        # Generic adapter hook (see below)
│   └── adapters/
│       ├── weather.ts            # OpenWeatherMap → EmotionState
│       ├── cursor.ts             # Mouse / touch → InteractionState
│       └── sound.ts              # AudioLevels → EmotionState bridge
├── dist/                         # Built output (ESM + CJS + types)
├── avatar.css                    # Optional baseline styles
├── package.json
├── tsconfig.json
└── README.md
```

---

## Core Component API

```tsx
import { Avatar } from "@dot/avatar";

<Avatar
	// ─── Appearance ────────────────────────────────────────
	variant="minimal" // "minimal" | "tron" | "analogue"
	color="#FF6B6B" // accent hex — overrides variant default
	className="" // wrapper class
	size={240} // px — controls rendered width (square)
	// ─── Emotion ────────────────────────────────────────────
	emotion={emotion} // EmotionState object (see types)
	// ─── Voice / Audio ──────────────────────────────────────
	speaking={false} // true = idle mouth wave → speaking animation
	audioLevels={levels} // AudioLevels from useAudioAnalysis
	// ─── Interaction ────────────────────────────────────────
	interactive={true} // enable mouse / touch tracking (default true)
	interactions={feeds} // array of InteractionFeed (see below)
	// ─── Callbacks ──────────────────────────────────────────
	onEyeClick={(eye) => {}} // "left" | "right"
	onMouthClick={() => {}}
	onLongPress={() => {}}
	// ─── Imperative ref ─────────────────────────────────────
	ref={avatarRef}
/>;
```

---

## TypeScript Types

### `EmotionState`

```ts
interface EmotionState {
	joy: number; // 0–1
	sadness: number; // 0–1
	surprise: number; // 0–1
	anger: number; // 0–1
	curiosity: number; // 0–1
}
```

Emotions are additive blends — multiple can be high simultaneously. Internally clamped and normalized.

### `FaceVariant`

```ts
type FaceVariant = "minimal" | "tron" | "analogue";
```

### `AudioLevels`

```ts
interface AudioLevels {
	bass: number; // 60–250 Hz  → breathing / scale
	lowMid: number; // 250–500 Hz → mouth open
	mid: number; // 500–2k Hz  → mouth width
	highMid: number; // 2k–4k Hz   → eye pulse
	presence: number; // 4k–8k Hz   → micro-blinks / glances
	overall: number; // RMS 0–1
	frequencyData: Uint8Array | null;
}
```

### `InteractionFeed`

The core extensibility primitive. Any external signal that should influence the face becomes a feed:

```ts
type FeedKind = "emotion" | "interaction" | "custom";

interface InteractionFeed<T = unknown> {
	/** Unique id — used for deduplication and priority order */
	id: string;

	/**
	 * The current value of this feed.
	 * Updated by the consumer (e.g. from a useEffect, WebSocket, etc.)
	 */
	value: T;

	/**
	 * How this feed maps to avatar state.
	 * Provide either a built-in adapter name or a custom transform function.
	 */
	adapter:
		| "weather" // WeatherData → EmotionState
		| "cursor" // {x,y} → eye tracking override
		| "sound" // AudioLevels → EmotionState
		| "heartrate" // number (bpm) → EmotionState
		| AdapterFn<T>; // (value: T, current: AvatarState) => Partial<AvatarState>

	/**
	 * Blend weight (0–1). At 1.0 this feed fully overrides.
	 * Multiple feeds are blended by weight. Default: 1.
	 */
	weight?: number;

	/** Optional priority when weights are equal. Higher = applied last. */
	priority?: number;
}

type AdapterFn<T> = (value: T, current: AvatarState) => Partial<AvatarState>;
```

### `AvatarState`

The full live state consumers can read (via ref):

```ts
interface AvatarState {
	emotion: EmotionState;
	variant: FaceVariant;
	color: string;
	speaking: boolean;
	isActive: boolean; // is face currently reacting to something
}
```

---

## Imperative Ref API

Via `React.forwardRef` + `useImperativeHandle`:

```ts
interface AvatarHandle {
	/** Instantly snap to an emotion (no tween) */
	setEmotion(emotion: Partial<EmotionState>): void;

	/** Animate to an emotion with optional duration */
	animateTo(emotion: Partial<EmotionState>, duration?: number): void;

	/** Trigger one-shot reactions */
	wink(eye?: "left" | "right"): void;
	blink(): void;
	glance(direction?: "left" | "right" | "up"): void;
	react(trigger: "surprise" | "joy" | "nod" | "shake"): void;

	/** Read current state */
	getState(): AvatarState;

	/** Direct GSAP timeline access (escape hatch) */
	getTimeline(): gsap.core.Timeline;
}
```

---

## Bundled Hooks

All hooks are exported individually — consumers use only what they need.

### `useAudioAnalysis(source, options?)`

```ts
// Mic
const { levels, start, stop } = useAudioAnalysis("microphone");

// HTML audio/video element
const { levels } = useAudioAnalysis("element", { element: audioRef });

// File / Blob
const { levels } = useAudioAnalysis("file", { buffer: arrayBuffer });
```

### `useVoiceSynthesis(options?)`

```ts
const { speak, stop, isSpeaking, audioLevels } = useVoiceSynthesis({
	ttsEndpoint: "/api/tts", // or a full URL for external TTS
	onStart: () => {},
	onEnd: () => {},
});
```

### `useEmotion(initial?)`

Utility for managing emotion state with helper methods:

```ts
const { emotion, set, blend, reset, fromText } = useEmotion();

// Set individual axes
set({ joy: 0.9 });

// Blend toward a state over time (returns cleanup fn)
blend({ sadness: 0.7 }, { duration: 2 });

// Use built-in heuristic NLP mapping (no LLM needed)
// "I'm excited" → { joy: 0.8, surprise: 0.3 }
fromText("I'm excited");
```

### `useDataFeed(feedConfig, refreshMs?)`

Generic polling adapter for external data:

```ts
// Drive emotion from a weather API
const weatherFeed = useDataFeed({
  id: "weather",
  fetch: () => fetch("/api/weather").then(r => r.json()),
  adapter: "weather",
  refreshMs: 60_000,
})

// Drive from any custom signal
const heartrateFeed = useDataFeed({
  id: "hr",
  value: currentBpm,                       // reactive value
  adapter: (bpm, state) => ({
    emotion: {
      ...state.emotion,
      joy: bpm > 100 ? 0.8 : 0.2,
      anger: bpm > 140 ? 0.6 : 0,
    }
  }),
})

// Connect feeds to avatar
<Avatar interactions={[weatherFeed, heartrateFeed]} />
```

---

## Built-in Adapters

| Adapter       | Input type                           | What it drives                                        |
| ------------- | ------------------------------------ | ----------------------------------------------------- |
| `"cursor"`    | `{ x, y }` (px or normalized)        | Eye follow direction                                  |
| `"weather"`   | `WeatherData` (OpenWeatherMap shape) | EmotionState (sunny→joy, storm→surprise, fog→sadness) |
| `"sound"`     | `AudioLevels`                        | EmotionState + mouth open                             |
| `"heartrate"` | `number` (bpm)                       | joy/anger/surprise based on BPM zone                  |
| `"scroll"`    | `number` (0–1 page progress)         | curiosity increases as user reads                     |
| `"time"`      | `Date`                               | mood follows time of day (morning→joy, night→calm)    |

---

## Usage Examples

### Minimal drop-in

```tsx
import { Avatar } from "@dot/avatar";
import "@dot/avatar/avatar.css";

export default function App() {
	return <Avatar />;
}
```

### Wired to voice + mic

```tsx
import { Avatar, useVoiceSynthesis, useAudioAnalysis } from "@dot/avatar";

export default function VoiceApp() {
	const {
		speak,
		isSpeaking,
		audioLevels: ttsLevels,
	} = useVoiceSynthesis({
		ttsEndpoint: "/api/tts",
	});
	const { levels: micLevels } = useAudioAnalysis("microphone");

	return (
		<>
			<Avatar
				speaking={isSpeaking}
				audioLevels={isSpeaking ? ttsLevels : micLevels}
				emotion={{ joy: 0.5, curiosity: 0.3 }}
			/>
			<button onClick={() => speak("Hello, I'm Dot.")}>Speak</button>
		</>
	);
}
```

### Weather-driven mood

```tsx
import { Avatar, useDataFeed } from "@dot/avatar";

export default function WeatherAvatar({ lat, lon }) {
	const feed = useDataFeed({
		id: "weather",
		fetch: () =>
			fetch(`/api/weather?lat=${lat}&lon=${lon}`).then((r) => r.json()),
		adapter: "weather",
		refreshMs: 300_000,
	});

	return <Avatar interactions={[feed]} />;
}
```

### Imperative reactions from AI text stream

```tsx
import { Avatar, useEmotion } from "@dot/avatar";
import { useRef } from "react";

export default function AIChat() {
	const avatarRef = useRef();
	const { emotion, fromText } = useEmotion();

	const onChunk = (text: string) => {
		const detected = fromText(text);
		avatarRef.current?.animateTo(detected, 1.2);
	};

	return <Avatar ref={avatarRef} emotion={emotion} />;
}
```

---

## Build & Distribution

```json
// package.json
{
	"name": "@dot/avatar",
	"version": "0.1.0",
	"sideEffects": ["*.css"],
	"exports": {
		".": {
			"import": "./dist/index.mjs",
			"require": "./dist/index.cjs",
			"types": "./dist/index.d.ts"
		},
		"./avatar.css": "./avatar.css"
	},
	"peerDependencies": {
		"react": ">=18",
		"react-dom": ">=18",
		"gsap": ">=3.12"
	},
	"devDependencies": {
		"tsup": "^8",
		"typescript": "^5"
	}
}
```

**Build tool**: `tsup` — generates ESM + CJS + `.d.ts` in one command.

```bash
tsup src/index.ts --format esm,cjs --dts --external react gsap
```

---

## Extraction Checklist

Steps to go from this monorepo to a publishable standalone package:

- [ ] Create `packages/avatar/` — copy `app/components/Avatar.tsx`, `face/`, hooks
- [ ] Rename `"use client"` directives → add `"use client"` guard at barrel only
- [ ] Replace `@/` path aliases with relative imports
- [ ] Remove Next.js-specific imports (`next/font`, etc.)
- [ ] Make `ttsEndpoint` configurable in `useVoiceSynthesis` (not hardcoded `/api/tts`)
- [ ] Extract `applyAgentTheme` to pure CSS variable injection (no `document` assumption in SSR)
- [ ] Add `"use client"` hint or `isBrowser` guard around GSAP ticker / window refs
- [ ] Write `avatar.css` with CSS custom properties as defaults
- [ ] Set up `tsup` build
- [ ] Write Storybook stories (one per variant, one per emotion extreme)
- [ ] Add Vitest unit tests for emotion math and adapter transforms
- [ ] Publish to npm under `@dot/avatar`

---

## Open Questions

1. **GSAP license** — GSAP is free for most uses but the Club GreenSock plugins are commercial. Confirm no Club plugins are used before open-sourcing.
2. **`fromText` NLP** — simple keyword heuristics or ship a tiny ONNX model? Heuristics first, model as optional peer dep.
3. **Framer Motion variant** — should there be an optional `animationEngine` prop to swap GSAP for Framer? Deferred — GSAP stays default.
4. **React Native** — SVG-based so could work with `react-native-svg`. Out of scope for v0.1 but the SVG layer is easily portable.
5. **Web Component** — wrapping in a Custom Element via `react-to-webcomponent` would let non-React devs use it. Possible v0.2 target.
