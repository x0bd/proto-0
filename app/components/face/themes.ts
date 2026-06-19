import { FaceVariant } from "./types";

/**
 * Per-variant face stroke/fill color.
 * Used to tint the SVG avatar currentColor.
 */
export const VARIANT_COLORS: Record<FaceVariant, string> = {
	minimal: "#BAFF29", // Brand lime
	tron: "#BAFF29", // Brand lime
	analogue: "#BAFF29", // Brand lime
};

/**
 * Glow colors per variant (for shadows and glows).
 */
export const VARIANT_GLOW: Record<FaceVariant, string> = {
	minimal: "rgba(186, 255, 41, 0.4)",
	tron: "rgba(186, 255, 41, 0.4)",
	analogue: "rgba(186, 255, 41, 0.4)",
};

/**
 * Convert a hex color to an rgba string at a given alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return `rgba(186, 255, 41, ${alpha})`;
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
	const color = accentColor || VARIANT_COLORS[variant] || "#BAFF29";
	const glow = accentColor
		? hexToRgba(accentColor, 0.4)
		: VARIANT_GLOW[variant] || "rgba(186, 255, 41, 0.35)";
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
