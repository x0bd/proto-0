import * as react from 'react';
import { RefObject, MutableRefObject } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type FaceVariant = "minimal" | "tron" | "analogue";
interface EmotionState {
    joy: number;
    sadness: number;
    surprise: number;
    anger: number;
    curiosity: number;
}

/**
 * Audio frequency bands mapped to avatar features.
 */
interface AudioLevels {
    /** 60–250 Hz — container breathing / scale */
    bass: number;
    /** 250–500 Hz — mouth opening (primary) */
    lowMid: number;
    /** 500–2000 Hz — mouth width variation */
    mid: number;
    /** 2000–4000 Hz — eye subtle pulse */
    highMid: number;
    /** 4000–8000 Hz — micro glances / blinks */
    presence: number;
    /** Overall RMS level (0–1) */
    overall: number;
    /** Raw frequency data for spectrum visualiser */
    frequencyData: Uint8Array | null;
}
interface UseAudioAnalysisOptions {
    /** FFT size (power of 2, 32–32768). Higher = more precision, more latency. @default 256 */
    fftSize?: number;
    /** Smoothing time constant (0–1). Higher = smoother, less responsive. @default 0.6 */
    smoothingTimeConstant?: number;
    /** Start analysis automatically when source is connected. @default true */
    autoStart?: boolean;
}
/**
 * Analyse audio and extract per-band levels for avatar reactivity.
 * Supports microphone, `<audio>/<video>` elements, File/Blob, and external AnalyserNodes.
 */
declare function useAudioAnalysis(options?: UseAudioAnalysisOptions): {
    levels: AudioLevels;
    isAnalyzing: boolean;
    error: string | null;
    connectMicrophone: () => Promise<boolean>;
    connectElement: (element: HTMLAudioElement | HTMLVideoElement) => boolean;
    connectFile: (file: File | Blob) => Promise<AudioBufferSourceNode | null>;
    connectExternalAnalyser: (externalAnalyser: AnalyserNode) => true;
    disconnect: () => void;
    startAnalysis: () => void;
    stopAnalysis: () => void;
};

/** Imperative handle exposed via forwardRef */
interface AvatarHandle {
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
/** A data-feed entry that maps a state snapshot to emotion */
interface InteractionFeed {
    /** Emotion derived from this entry */
    emotion: Partial<EmotionState>;
    /** Optional audio levels for this frame */
    audio?: Partial<AudioLevels>;
    /** Timestamp in ms (Date.now()) */
    timestamp?: number;
}
/** Adapter function signature — converts arbitrary data into an InteractionFeed array */
type AdapterFn<T> = (data: T) => InteractionFeed[];
/** Live state snapshot exposed to parent via onStateChange */
interface AvatarState {
    emotion: EmotionState;
    isSpeaking: boolean;
    variant: FaceVariant;
}
interface AvatarProps {
    /** Current emotion state */
    emotion?: EmotionState;
    /** Additional class name on the wrapper div */
    className?: string;
    /** Whether the avatar is in a speaking state (enables voice animation) */
    speaking?: boolean;
    /**
     * Simple 0–1 voice level (legacy).
     * @deprecated Use `audioLevels` for richer reactivity.
     */
    voiceLevel?: number;
    /** Multi-band audio levels from `useAudioAnalysis` */
    audioLevels?: AudioLevels;
    /** Face variant — controls eye/mouth geometry and colour */
    variant?: FaceVariant;
    /**
     * Custom accent colour — overrides the variant default.
     * Accepts any CSS colour string.
     */
    color?: string;
    /**
     * @deprecated Use `color` instead.
     */
    accentColor?: string;
    /**
     * Logical height of the rendered SVG in px. Width is derived from the
     * fixed 520×280 viewBox aspect ratio.
     * @default 260
     */
    size?: number;
    /** Whether pointer interactions (cursor follow, boop, long-press) are active. @default true */
    interactive?: boolean;
    /** Called when the user clicks/taps an eye */
    onEyeClick?: (eye: "left" | "right") => void;
    /** Called when the user clicks/taps the mouth */
    onMouthClick?: () => void;
    /** Called when the long-press deep-emotion gesture fires */
    onLongPress?: () => void;
    /** Fires whenever internal avatar state changes */
    onStateChange?: (state: AvatarState) => void;
    /** Feed adapter output directly into the avatar for data-driven emotion */
    interactions?: InteractionFeed[];
}

/**
 * @dot/avatar — animated SVG face with multi-variant geometry, emotion
 * expressions, audio reactivity, and pointer interactions.
 *
 * Wrap in `"use client"` in Next.js / RSC environments.
 */
declare const Avatar: react.ForwardRefExoticComponent<AvatarProps & react.RefAttributes<AvatarHandle>>;

interface UseVoiceSynthesisOptions {
    /**
     * URL of your TTS endpoint.
     * Expects POST with `{ text: string; voiceId?: string }` JSON body
     * and returns raw audio bytes.
     * @default "/api/tts"
     */
    ttsEndpoint?: string;
    onAudioStart?: () => void;
    onAudioEnd?: () => void;
}
/**
 * Fetches synthesised speech from a configurable TTS endpoint, plays it
 * through the Web Audio API, and exposes an AnalyserNode for hooking into
 * `useAudioAnalysis`.
 */
declare function useVoiceSynthesis(options?: UseVoiceSynthesisOptions): {
    speak: (text: string, voiceId?: string) => Promise<AnalyserNode | null>;
    stop: () => void;
    isSpeaking: boolean;
    /** Expose analyser so callers can wire it into `useAudioAnalysis.connectExternalAnalyser` */
    analyserRef: react.MutableRefObject<AnalyserNode | null>;
};

declare const VARIANT_COLORS: Record<FaceVariant, string>;
declare const VARIANT_GLOW: Record<FaceVariant, string>;
/**
 * Apply avatar theme to a DOM element (or `document.documentElement` if none
 * is provided). Sets `--face-color`, `--face-glow`, and `--face-bg-tint` CSS
 * custom properties.
 *
 * SSR-safe: skips if `document` is not available.
 */
declare function applyAgentTheme(variant: FaceVariant, accentColor?: string, target?: HTMLElement): void;
/** Returns SVG rendering hints per variant */
declare function getMouthStyle(variant: FaceVariant): {
    strokeLinecap: "round" | "square" | "butt";
    shapeRendering: "auto" | "crispEdges" | "geometricPrecision";
};

interface LegacyEyesProps {
    leftRef: RefObject<SVGElement>;
    rightRef: RefObject<SVGElement>;
    color?: string;
    variant: FaceVariant;
    onWink: (eye: "left" | "right") => void;
    onHoverStart: (eye: "left" | "right") => void;
    onHoverEnd: (eye: "left" | "right") => void;
    eyeClass?: string;
}
/**
 * Legacy eye renderer — routes all three variants to a shared geometry.
 * tron  → <rect>
 * analogue → <ellipse> with pencil filter
 * minimal  → solid <ellipse>
 */
declare function Eyes({ leftRef, rightRef, variant, onWink, onHoverStart, onHoverEnd, eyeClass, }: LegacyEyesProps): react_jsx_runtime.JSX.Element;

interface MouthProps {
    mouthRef: RefObject<SVGPathElement>;
    groupRef: RefObject<SVGGElement>;
    spectrumGroupRef: RefObject<SVGGElement>;
    spectrumBarsRef: MutableRefObject<SVGRectElement[]>;
    onClick: () => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    variant?: FaceVariant;
}
declare function Mouth({ mouthRef, groupRef, spectrumGroupRef, spectrumBarsRef, onClick, onHoverStart, onHoverEnd, variant, }: MouthProps): react_jsx_runtime.JSX.Element;

declare function Ears(): null;

export { type AdapterFn, type AudioLevels, Avatar, type AvatarHandle, type AvatarProps, type AvatarState, Ears, type EmotionState, Eyes, type FaceVariant, type InteractionFeed, Mouth, VARIANT_COLORS, VARIANT_GLOW, applyAgentTheme, getMouthStyle, useAudioAnalysis, useVoiceSynthesis };
