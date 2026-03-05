// ─────────────────────────────────────────────
//  @dot/avatar — public type surface
// ─────────────────────────────────────────────

export type { FaceVariant, EmotionState, FaceProps } from "./face/types";
export type { AudioLevels } from "./hooks/useAudioAnalysis";

// ── Avatar component types ────────────────────

/** Imperative handle exposed via forwardRef */
export interface AvatarHandle {
  /** Trigger a named emotion transition */
  setEmotion(state: EmotionState): void;
  /** Wink one eye */
  wink(eye: "left" | "right"): void;
  /** Run a surprised expression */
  surprise(): void;
  /** Trigger a boop squish */
  boop(): void;
  /** Feed a single audio frame manually */
  feedAudio(levels: AudioLevels): void;
}

/** Multi-band audio levels passed into the avatar */
export interface AudioLevels {
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  presence: number;
  overall: number;
  frequencyData: Float32Array;
}

/** Emotion scores — all values 0–1 */
export interface EmotionState {
  joy: number;
  sadness: number;
  surprise: number;
  anger: number;
  curiosity: number;
}

/** A data-feed entry that maps a state snapshot to emotion */
export interface InteractionFeed {
  /** Emotion derived from this entry */
  emotion: Partial<EmotionState>;
  /** Optional audio levels for this frame */
  audio?: Partial<AudioLevels>;
  /** Timestamp in ms (Date.now()) */
  timestamp?: number;
}

/** Adapter function signature — converts arbitrary data into InteractionFeed[] */
export type AdapterFn<T> = (data: T) => InteractionFeed[];

/** Live state snapshot exposed to parent via onStateChange */
export interface AvatarState {
  emotion: EmotionState;
  isSpeaking: boolean;
  variant: FaceVariant;
}

// ── Component props ───────────────────────────

import type { FaceVariant } from "./face/types";

export interface AvatarProps {
  /** Current emotion state */
  emotion?: EmotionState;
  /** Additional class name on the wrapper div */
  className?: string;
  /** Whether the avatar is in a speaking state (enables voice sim) */
  speaking?: boolean;
  /**
   * @deprecated Use `audioLevels` instead
   */
  voiceLevel?: number;
  /** Multi-band audio levels from `useAudioAnalysis` */
  audioLevels?: AudioLevels;
  /** Face variant — controls eye/mouth geometry */
  variant?: FaceVariant;
  /**
   * Custom accent color — overrides the variant default.
   * Accepts any CSS color string.
   */
  color?: string;
  /**
   * Logical size of the rendered SVG in px.
   * The viewBox is always 520×280; this just sets width/height.
   * @default 260
   */
  size?: number;
  /** Whether pointer interactions (cursor follow, boop, long-press) are enabled */
  interactive?: boolean;
  /** Called when the user clicks either eye */
  onEyeClick?: (eye: "left" | "right") => void;
  /** Called when the user clicks the mouth */
  onMouthClick?: () => void;
  /** Called when the long-press deep-emotion fires */
  onLongPress?: () => void;
  /** Called whenever internal avatar state changes */
  onStateChange?: (state: AvatarState) => void;
  /** Feed adapter output directly into the avatar */
  interactions?: InteractionFeed[];
}
