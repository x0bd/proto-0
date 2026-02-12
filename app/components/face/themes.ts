import { AgentTheme, FaceVariant, AgentFaceVariant } from "./types";

/**
 * Theme definitions for each agent variant.
 * These control colors, glows, and pupil gradients.
 * 
 * UPDATE: All agents now use a strict Monochrome / Minimal aesthetic.
 * No colored glows, no gradients.
 */
export const AGENT_THEMES: Record<AgentFaceVariant, AgentTheme> = {
  myst: {
    base: "#ffffff",
    text: "#000000",
    accent: "#000000",
    glow: "rgba(0,0,0,0)", // No glow
    eyeWhite: "#ffffff",
    pupilStart: "#000000",
    pupilEnd: "#000000",
    darkMode: false,
  },
  flux: {
    base: "#ffffff",
    text: "#000000",
    accent: "#000000",
    glow: "rgba(0,0,0,0)",
    eyeWhite: "#ffffff",
    pupilStart: "#000000",
    pupilEnd: "#000000",
    darkMode: false,
  },
  echo: {
    base: "#000000",
    text: "#ffffff",
    accent: "#ffffff",
    glow: "rgba(255,255,255,0.1)", // Very subtle white glow for visibility on dark
    eyeWhite: "#000000", // Inverted for echo
    pupilStart: "#ffffff",
    pupilEnd: "#ffffff",
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
  
  // For legacy variants, we default to standard standard CSS vars
  // or we can set neutral defaults
  const root = document.documentElement;
  
  if (!theme) {
    // Reset to defaults
    root.style.removeProperty("--avatar-base");
    root.style.removeProperty("--avatar-text");
    root.style.removeProperty("--avatar-accent");
    root.style.removeProperty("--avatar-glow");
    root.style.removeProperty("--avatar-eye-white");
    root.style.removeProperty("--avatar-pupil-start");
    root.style.removeProperty("--avatar-pupil-end");
    return;
  }

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
