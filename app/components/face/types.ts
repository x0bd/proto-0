export type FaceVariant = "minimal" | "tron" | "analogue";

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
