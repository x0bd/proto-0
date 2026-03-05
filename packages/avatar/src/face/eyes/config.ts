import type { FaceVariant } from "../types";

/** Geometry descriptor for a single eye variant */
export interface EyeGeometry {
	leftCx: number;
	rightCx: number;
	leftCy: number;
	rightCy: number;
	rx: number;
	ry: number;
}

/** Props accepted by every eye sub-component */
export interface EyeProps {
	leftRef: React.RefObject<SVGElement>;
	rightRef: React.RefObject<SVGElement>;
	topRef?: React.RefObject<SVGElement>;
	color?: string;
	variant: FaceVariant;
	onWink: (eye: "left" | "right" | "top") => void;
	onHoverStart: (eye: "left" | "right" | "top") => void;
	onHoverEnd: (eye: "left" | "right" | "top") => void;
	eyeClass?: string;
}

/**
 * Optional per-variant geometry overrides.
 * Leave empty to use the default geometry baked into each eye component.
 */
export const EYE_GEOMETRIES: Partial<Record<FaceVariant, EyeGeometry>> = {};
