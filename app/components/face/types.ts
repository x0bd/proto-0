export type FaceVariant = "minimal" | "tron" | "analogue" | "robot";

export interface FaceProps {
	emotion: EmotionState;
	voiceEnabled?: boolean;
	color?: string;
}

export interface EmotionState {
	joy: number;
	sadness: number;
	surprise: number;
	anger: number;
	curiosity: number;
}
