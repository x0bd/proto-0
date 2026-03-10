<p align="center">
  <img src="./face-3.png" alt="tron variant" width="200" />
  &nbsp;&nbsp;
  <img src="./face-2.png" alt="analogue variant" width="200" />
  &nbsp;&nbsp;
  <img src="./face-3.png" alt="analogue variant – dark" width="200" />
</p>

<h1 align="center">@xoboid/avatar</h1>

<p align="center">
  <strong>Animated SVG face component with emotion expressions, audio reactivity, and pointer interactions.</strong>
</p>

<p align="center">
  <code>npm i @xoboid/avatar gsap</code>
</p>

---

## Quick Start

```tsx
"use client";

import { Avatar } from "@xoboid/avatar";
import "@xoboid/avatar/avatar.css";

export default function App() {
	return (
		<Avatar
			emotion={{
				joy: 0.8,
				sadness: 0,
				surprise: 0.2,
				anger: 0,
				curiosity: 0.3,
			}}
			variant="minimal"
			color="#FF6B6B"
			size={280}
			interactive
		/>
	);
}
```

That's it. A living face with blinking, breathing, idle glances, pointer tracking, and boop reactions — zero config.

---

## Variants

Three visual archetypes, each with distinct geometry and animation feel:

| Variant    | Style          | Default Color   | Eyes                             | Animation           |
| ---------- | -------------- | --------------- | -------------------------------- | ------------------- |
| `minimal`  | Clean, soft    | `#FF6B6B` Coral | Solid ellipses                   | Smooth sinusoidal   |
| `tron`     | Digital, sharp | `#06B6D4` Cyan  | Rounded rects                    | Stepped (retro CRT) |
| `analogue` | Hand-drawn     | `#FBBF24` Amber | Stroked ellipses + pencil filter | Organic wobble      |

```tsx
<Avatar variant="tron" color="#06B6D4" />
```

---

## Emotion Model

A 5-axis float system. Each value is `0` to `1`.

```tsx
interface EmotionState {
	joy: number; // smile width, eye roundness
	sadness: number; // drooped eyes, inverted mouth
	surprise: number; // wide eyes, open mouth
	anger: number; // narrowed eyes, tight mouth
	curiosity: number; // head tilt, asymmetric eyes
}
```

```tsx
// Combine axes for complex expressions
<Avatar
	emotion={{ joy: 0.6, curiosity: 0.8, surprise: 0.2, sadness: 0, anger: 0 }}
/>
```

---

## Audio Reactivity

Connect a microphone, audio element, or file — the face reacts in real-time.

```tsx
import { Avatar, useAudioAnalysis } from "@xoboid/avatar";

function LiveAvatar() {
	const { levels, isAnalyzing, connectMicrophone } = useAudioAnalysis();

	return (
		<>
			<button onClick={connectMicrophone}>Enable Mic</button>
			<Avatar
				audioLevels={isAnalyzing ? levels : undefined}
				speaking={isAnalyzing}
			/>
		</>
	);
}
```

### Audio Sources

```tsx
const { connectMicrophone } = useAudioAnalysis(); // mic input
const { connectElement } = useAudioAnalysis(); // <audio> or <video> element
const { connectFile } = useAudioAnalysis(); // File / Blob
const { connectExternalAnalyser } = useAudioAnalysis(); // existing AnalyserNode
```

### Frequency Bands → Face Mapping

| Band       | Range        | Drives                            |
| ---------- | ------------ | --------------------------------- |
| `bass`     | 60–250 Hz    | Container breathing / scale pulse |
| `lowMid`   | 250–500 Hz   | Mouth opening (primary)           |
| `mid`      | 500–2000 Hz  | Mouth width variation             |
| `highMid`  | 2000–4000 Hz | Eye micro-pulse                   |
| `presence` | 4000–8000 Hz | Random glances                    |

---

## Voice Synthesis

Pair with a TTS endpoint for speaking avatars:

```tsx
import { Avatar, useVoiceSynthesis, useAudioAnalysis } from "@xoboid/avatar";

function SpeakingAvatar() {
	const { speak, isSpeaking, analyserRef } = useVoiceSynthesis({
		ttsEndpoint: "/api/tts",
	});
	const { levels, connectExternalAnalyser } = useAudioAnalysis();

	const say = async (text: string) => {
		const analyser = await speak(text);
		if (analyser) connectExternalAnalyser(analyser);
	};

	return (
		<>
			<button onClick={() => say("Hello world")}>Speak</button>
			<Avatar speaking={isSpeaking} audioLevels={levels} />
		</>
	);
}
```

---

## Imperative API

For programmatic control via `ref`:

```tsx
import { useRef } from "react";
import { Avatar, type AvatarHandle } from "@xoboid/avatar";

function App() {
	const ref = useRef<AvatarHandle>(null);

	return (
		<>
			<Avatar ref={ref} />
			<button onClick={() => ref.current?.wink("left")}>Wink</button>
			<button onClick={() => ref.current?.surprise()}>Surprise</button>
			<button onClick={() => ref.current?.boop()}>Boop</button>
			<button
				onClick={() =>
					ref.current?.setEmotion({
						joy: 1,
						sadness: 0,
						surprise: 0,
						anger: 0,
						curiosity: 0,
					})
				}
			>
				Happy
			</button>
		</>
	);
}
```

| Method              | Effect                                       |
| ------------------- | -------------------------------------------- |
| `setEmotion(state)` | Animate to an emotion state                  |
| `wink(eye)`         | `"left"` or `"right"` wink                   |
| `surprise()`        | Surprised expression with scale bounce       |
| `boop()`            | Squish bounce (like poking the face)         |
| `feedAudio(levels)` | Inject a single `AudioLevels` frame manually |

---

## Interaction Callbacks

```tsx
<Avatar
	onEyeClick={(eye) => console.log(eye)} // "left" | "right"
	onMouthClick={() => {}} // tap on the mouth
	onLongPress={() => {}} // 500ms hold → deep emotion mode
	onStateChange={(state) => {}} // { emotion, isSpeaking, variant }
/>
```

---

## Data-Driven Emotion

Feed arbitrary data into the avatar via the adapter pattern:

```tsx
import type { InteractionFeed, AdapterFn } from "@xoboid/avatar";

// Adapter: convert chat sentiment to emotion
const chatAdapter: AdapterFn<{ sentiment: number }> = (data) => [
	{
		emotion: {
			joy: Math.max(0, data.sentiment),
			sadness: Math.max(0, -data.sentiment),
		},
		timestamp: Date.now(),
	},
];

// Feed into Avatar
<Avatar interactions={chatAdapter({ sentiment: 0.7 })} />;
```

---

## Theming

### CSS Variables

```tsx
import "@xoboid/avatar/avatar.css";
```

Override in your stylesheet:

```css
:root {
	--face-color: #ff6b6b;
	--face-glow: rgba(255, 107, 107, 0.6);
	--face-bg-tint: rgba(255, 107, 107, 0.04);
	--face-transition-fast: 0.04s;
	--face-transition-base: 0.3s;
	--face-transition-slow: 0.8s;
}
```

### Runtime

```tsx
import { applyAgentTheme } from "@dot/avatar";

// Apply to document root
applyAgentTheme("tron");

// Apply with custom color
applyAgentTheme("minimal", "#8B5CF6");

// Apply to a specific element
applyAgentTheme("analogue", "#FBBF24", myContainerRef.current);
```

---

## Props Reference

| Prop            | Type                | Default             | Description                     |
| --------------- | ------------------- | ------------------- | ------------------------------- |
| `emotion`       | `EmotionState`      | `{ joy: 0.3, ... }` | 5-axis emotion state            |
| `variant`       | `FaceVariant`       | `"minimal"`         | Visual style                    |
| `color`         | `string`            | variant default     | Custom accent color             |
| `size`          | `number`            | `260`               | Height in px                    |
| `speaking`      | `boolean`           | `false`             | Voice animation mode            |
| `audioLevels`   | `AudioLevels`       | —                   | Multi-band audio data           |
| `voiceLevel`    | `number`            | `0`                 | Simple 0–1 level _(deprecated)_ |
| `interactive`   | `boolean`           | `true`              | Pointer interactions            |
| `className`     | `string`            | `""`                | Wrapper class                   |
| `onEyeClick`    | `(eye) => void`     | —                   | Eye tap callback                |
| `onMouthClick`  | `() => void`        | —                   | Mouth tap callback              |
| `onLongPress`   | `() => void`        | —                   | Long-press callback             |
| `onStateChange` | `(state) => void`   | —                   | State change callback           |
| `interactions`  | `InteractionFeed[]` | —                   | Data-driven emotion feed        |
| `ref`           | `AvatarHandle`      | —                   | Imperative handle               |

---

## Built-in Behaviors

These run automatically — no configuration needed:

- **Breathing** — subtle scale oscillation (variant-specific: smooth, stepped, or organic)
- **Blinking** — random interval (2.5–6s), variant-styled close/open
- **Glancing** — random micro eye movements (4–12s intervals)
- **Idle mouth** — gentle wave on the mouth curve
- **Pointer repulsion** — face subtly leans away when cursor gets close
- **Cursor tracking** — eyes and mouth follow the pointer
- **Haptic feedback** — vibration on wink, boop, and surprise (mobile)
- **Pencil boil** — animated turbulence filter on `analogue` variant

---

## Requirements

| Dependency | Version | Note                                                                  |
| ---------- | ------- | --------------------------------------------------------------------- |
| `react`    | ≥ 18    | Peer dependency                                                       |
| `gsap`     | ≥ 3.12  | Peer dependency — [GSAP license](https://gsap.com/licensing/) applies |

---

## License

MIT
