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
 * Apply face color and glow CSS variables to document root.
 */
export function applyAgentTheme(variant: FaceVariant): void {
	const color = VARIANT_COLORS[variant] || "#7C3AED";
	const glow = VARIANT_GLOW[variant] || "rgba(124, 58, 237, 0.35)";
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
