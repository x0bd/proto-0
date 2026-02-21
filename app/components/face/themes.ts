import { AgentTheme, FaceVariant, AgentFaceVariant } from "./types";

/**
 * Per-variant face stroke/fill color.
 * Used to tint the SVG avatar currentColor.
 */
export const VARIANT_COLORS: Record<FaceVariant, string> = {
	minimal: "#FF6B6B", // Coral red
	tron: "#06B6D4", // Electric cyan
	analogue: "#FBBF24", // Warm amber
	myst: "#A78BFA", // Soft lavender
	flux: "#60A5FA", // Sky blue
	echo: "#FB923C", // Warm orange
};

/**
 * Glow colors per variant (for shadows and glows).
 */
export const VARIANT_GLOW: Record<FaceVariant, string> = {
	minimal: "rgba(255, 107, 107, 0.4)",
	tron: "rgba(6, 182, 212, 0.5)",
	analogue: "rgba(251, 191, 36, 0.4)",
	myst: "rgba(167, 139, 250, 0.45)",
	flux: "rgba(96, 165, 250, 0.45)",
	echo: "rgba(251, 146, 60, 0.4)",
};

/**
 * Theme definitions for each agent variant — vibrant, playful.
 */
export const AGENT_THEMES: Record<AgentFaceVariant, AgentTheme> = {
	myst: {
		base: "#F5F0FF",
		text: "#7C3AED",
		accent: "#6D28D9",
		glow: "rgba(139, 92, 246, 0.45)",
		eyeWhite: "#EDE9FE",
		pupilStart: "#8B5CF6",
		pupilEnd: "#5B21B6",
		darkMode: false,
	},
	flux: {
		base: "#EFF6FF",
		text: "#2563EB",
		accent: "#1D4ED8",
		glow: "rgba(59, 130, 246, 0.45)",
		eyeWhite: "#DBEAFE",
		pupilStart: "#3B82F6",
		pupilEnd: "#1E40AF",
		darkMode: false,
	},
	echo: {
		base: "#FFF7ED",
		text: "#EA580C",
		accent: "#C2410C",
		glow: "rgba(251, 146, 60, 0.45)",
		eyeWhite: "#FFEDD5",
		pupilStart: "#FB923C",
		pupilEnd: "#C2410C",
		darkMode: false,
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
 * Also sets --face-color and --face-glow for SVG currentColor tinting.
 */
export function applyAgentTheme(variant: FaceVariant): void {
	const theme = getAgentTheme(variant);
	const color = VARIANT_COLORS[variant] || "#7C3AED";
	const glow = VARIANT_GLOW[variant] || "rgba(124, 58, 237, 0.35)";
	const root = document.documentElement;

	// Always set face color and glow for any variant
	root.style.setProperty("--face-color", color);
	root.style.setProperty("--face-glow", glow);
	root.style.setProperty("--face-bg-tint", glow.replace(/[^,]+\)$/, "0.04)"));

	if (!theme) {
		// Legacy variant: clear agent-specific vars
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
