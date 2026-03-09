// ─────────────────────────────────────────────
//  @xoboid/avatar — public API
// ─────────────────────────────────────────────

// Main component
export { Avatar } from "./Avatar";

// Types
export type {
	AvatarProps,
	AvatarHandle,
	AvatarState,
	EmotionState,
	AudioLevels,
	InteractionFeed,
	AdapterFn,
	FaceVariant,
} from "./types";

// Hooks
export { useAudioAnalysis } from "./hooks/useAudioAnalysis";
export { useVoiceSynthesis } from "./hooks/useVoiceSynthesis";

// Theme utilities
export {
	applyAgentTheme,
	VARIANT_COLORS,
	VARIANT_GLOW,
	getMouthStyle,
} from "./face/themes";

// Sub-components (for advanced customisation)
export { Eyes } from "./face/Eyes";
export { Mouth } from "./face/Mouth";
export { Ears } from "./face/Ears";
