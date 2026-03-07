// Face sub-component types

export type FaceVariant = "minimal" | "tron" | "analogue";

export interface EmotionState {
  joy: number;
  sadness: number;
  surprise: number;
  anger: number;
  curiosity: number;
}

export interface FaceProps {
  emotion?: EmotionState;
  voiceEnabled?: boolean;
  variant?: FaceVariant;
  color?: string;
}
