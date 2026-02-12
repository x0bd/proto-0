// Legacy variants (backward compatible)
export type LegacyFaceVariant = "minimal" | "tron" | "analogue";

// Agent-based variants with unique eye layouts and theming
export type AgentFaceVariant = 
  | "myst"     // Triangular (3 eyes) - The Visionary
  | "flux"     // Geometric triangles - The Architect
  | "echo";    // Minimal dots - The Essence

export type FaceVariant = LegacyFaceVariant | AgentFaceVariant;

// Helper to check if variant supports pupil tracking
export const supportsPupilTracking = (variant: FaceVariant): boolean => {
  return ["myst", "flux"].includes(variant);
};

// Helper to check if variant is legacy (no pupils)
export const isLegacyVariant = (variant: FaceVariant): boolean => {
  return ["minimal", "tron", "analogue"].includes(variant);
};

// Theme configuration for agent variants
export interface AgentTheme {
  base: string;        // Background color
  text: string;        // Primary text/stroke color
  accent: string;      // Highlight/accent color
  glow: string;        // Glow filter color
  eyeWhite: string;    // Sclera fill
  pupilStart: string;  // Gradient start
  pupilEnd: string;    // Gradient end
  darkMode: boolean;   // If true, apply dark mode styles
}

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
