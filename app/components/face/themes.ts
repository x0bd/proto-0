import { FaceVariant } from "./types";

/**
 * Per-variant face stroke/fill color.
 * Used to tint the SVG avatar currentColor.
 */
export const VARIANT_COLORS: Record<FaceVariant, string> = {
	minimal: "#FF6B6B", // Coral red
	tron: "#06B6D4", // Electric cyan
	analogue: "#FBBF24", // Warm amber
};

/**
 * Glow colors per variant (for shadows and glows).
 */
export const VARIANT_GLOW: Record<FaceVariant, string> = {
	minimal: "rgba(255, 107, 107, 0.4)",
	tron: "rgba(6, 182, 212, 0.5)",
	analogue: "rgba(251, 191, 36, 0.4)",
};

/**
 * Convert a hex color to an rgba string at a given alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return `rgba(124, 58, 237, ${alpha})`;
	return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${alpha})`;
}

/**
 * Apply face color and glow CSS variables to document root.
 * If a custom accentColor is provided it overrides the variant default.
 */
export function applyAgentTheme(
	variant: FaceVariant,
	accentColor?: string,
): void {
	const color = accentColor || VARIANT_COLORS[variant] || "#7C3AED";
	const glow = accentColor
		? hexToRgba(accentColor, 0.4)
		: VARIANT_GLOW[variant] || "rgba(124, 58, 237, 0.35)";
	const root = document.documentElement;

	root.style.setProperty("--face-color", color);
	root.style.setProperty("--face-glow", glow);
	root.style.setProperty("--face-bg-tint", glow.replace(/[^,]+\)$/, "0.04)"));
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
			return { strokeLinecap: "square", shapeRendering: "crispEdges" };
		default:
			return { strokeLinecap: "round", shapeRendering: "auto" };
	}
}
