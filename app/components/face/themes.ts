import { AgentTheme, FaceVariant, AgentFaceVariant } from "./types";

/**
 * Theme definitions for each agent variant.
 * These control colors, glows, and pupil gradients.
 */
export const AGENT_THEMES: Record<AgentFaceVariant, AgentTheme> = {
  lumina: {
    base: "#F5F5F7",
    text: "#1F2937",
    accent: "#F59E0B",
    glow: "#fbbf24",
    eyeWhite: "#ffffff",
    pupilStart: "#1F2937",
    pupilEnd: "#111827",
    darkMode: false,
  },
  volo: {
    base: "#ECFEFF",
    text: "#0E7490",
    accent: "#06B6D4",
    glow: "#22d3ee",
    eyeWhite: "#ffffff",
    pupilStart: "#164E63",
    pupilEnd: "#0c2d3a",
    darkMode: false,
  },
  myst: {
    base: "#FAF5FF",
    text: "#6B21A8",
    accent: "#C026D3",
    glow: "#d8b4fe",
    eyeWhite: "#fefcff",
    pupilStart: "#581C87",
    pupilEnd: "#3b0764",
    darkMode: false,
  },
  zane: {
    base: "#FFF1F2",
    text: "#9F1239",
    accent: "#E11D48",
    glow: "#fb7185",
    eyeWhite: "#ffffff",
    pupilStart: "#881337",
    pupilEnd: "#4c0519",
    darkMode: false,
  },
  flux: {
    base: "#EEF2FF",
    text: "#3730A3",
    accent: "#6366F1",
    glow: "#818cf8",
    eyeWhite: "#ffffff",
    pupilStart: "#312E81",
    pupilEnd: "#1e1b4b",
    darkMode: false,
  },
  echo: {
    base: "#09090b",
    text: "#F4F4F5",
    accent: "#64748B",
    glow: "#94a3b8",
    eyeWhite: "#18181b",
    pupilStart: "#cbd5e1",
    pupilEnd: "#94a3b8",
    darkMode: true,
  },
};

/**
 * Get theme for a variant. Returns undefined for legacy variants.
 */
export function getAgentTheme(variant: FaceVariant): AgentTheme | undefined {
  if (variant in AGENT_THEMES) {
    return AGENT_THEMES[variant as AgentFaceVariant];
  }
  return undefined;
}

/**
 * Apply agent theme CSS variables to document root.
 * Call this when variant changes to update glow colors etc.
 */
export function applyAgentTheme(variant: FaceVariant): void {
  const theme = getAgentTheme(variant);
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty("--avatar-base", theme.base);
  root.style.setProperty("--avatar-text", theme.text);
  root.style.setProperty("--avatar-accent", theme.accent);
  root.style.setProperty("--avatar-glow", theme.glow);
  root.style.setProperty("--avatar-eye-white", theme.eyeWhite);
  root.style.setProperty("--avatar-pupil-start", theme.pupilStart);
  root.style.setProperty("--avatar-pupil-end", theme.pupilEnd);
}

/**
 * Get mouth path style based on variant.
 * Each agent has a unique mouth aesthetic.
 */
export function getMouthStyle(variant: FaceVariant): {
  strokeLinecap: "round" | "square";
  shapeRendering: "auto" | "crispEdges";
} {
  switch (variant) {
    case "tron":
    case "flux":
      return { strokeLinecap: "square", shapeRendering: "crispEdges" };
    default:
      return { strokeLinecap: "round", shapeRendering: "auto" };
  }
}
