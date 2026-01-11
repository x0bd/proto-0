export type FaceVariant = "minimal" | "tron" | "analogue" | "neko";

export interface FaceProps {
	emotion: EmotionState;
	voiceEnabled?: boolean;
}

export interface EmotionState {
	joy: number;
	sadness: number;
	surprise: number;
	anger: number;
	curiosity: number;
}
