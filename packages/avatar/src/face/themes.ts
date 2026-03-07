import type { FaceVariant } from "./types";

// ── Per-variant default colors ────────────────
export const VARIANT_COLORS: Record<FaceVariant, string> = {
  minimal: "#FF6B6B",
  tron: "#06B6D4",
  analogue: "#FBBF24",
};

// ── Per-variant glow strings ──────────────────
export const VARIANT_GLOW: Record<FaceVariant, string> = {
  minimal: "rgba(255, 107, 107, 0.6)",
  tron: "rgba(6, 182, 212, 0.7)",
  analogue: "rgba(251, 191, 36, 0.6)",
};

/**
 * Convert a hex color to an rgba() string.
 */
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(255, 107, 107, ${alpha})`;
  return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${alpha})`;
}

/**
 * Apply avatar theme to a DOM element (or `document.documentElement` if none
 * is provided). Sets `--face-color`, `--face-glow`, and `--face-bg-tint` CSS
 * custom properties.
 *
 * SSR-safe: skips if `document` is not available.
 */
export function applyAgentTheme(
  variant: FaceVariant,
  accentColor?: string,
  target?: HTMLElement,
): void {
  if (typeof document === "undefined") return;

  const root = target ?? document.documentElement;
  const color = accentColor ?? VARIANT_COLORS[variant];
  const glow = accentColor
    ? hexToRgba(accentColor, 0.6)
    : VARIANT_GLOW[variant];
  const bgTint = accentColor
    ? hexToRgba(accentColor, 0.04)
    : variant === "tron"
      ? "rgba(0, 200, 255, 0.03)"
      : variant === "analogue"
        ? "rgba(251, 191, 36, 0.04)"
        : "rgba(255, 107, 107, 0.04)";

  root.style.setProperty("--face-color", color);
  root.style.setProperty("--face-glow", glow);
  root.style.setProperty("--face-bg-tint", bgTint);
}

/** Returns SVG rendering hints per variant */
export function getMouthStyle(variant: FaceVariant): {
  strokeLinecap: "round" | "square" | "butt";
  shapeRendering: "auto" | "crispEdges" | "geometricPrecision";
} {
  switch (variant) {
    case "tron":
      return { strokeLinecap: "square", shapeRendering: "crispEdges" };
    case "analogue":
      return { strokeLinecap: "round", shapeRendering: "geometricPrecision" };
    default:
      return { strokeLinecap: "round", shapeRendering: "auto" };
  }
}
