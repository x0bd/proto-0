import type { RefObject } from "react";
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
	leftRef: RefObject<SVGElement>;
	rightRef: RefObject<SVGElement>;
	topRef?: RefObject<SVGElement>;
	color?: string;
	variant: FaceVariant;
	onWink: (eye: "left" | "right" | "top") => void;
	onHoverStart: (eye: "left" | "right" | "top") => void;
	onHoverEnd: (eye: "left" | "right" | "top") => void;
	eyeClass?: string;
}

/**
 * Per-variant geometry used by `animateEye` to calculate offsets.
 * Values here must match the SVG attributes in each eye renderer.
 */
export const EYE_GEOMETRIES: Record<FaceVariant, EyeGeometry> = {
	minimal: { leftCx: 170, rightCx: 350, leftCy: 105, rightCy: 105, rx: 32, ry: 18 },
	tron:    { leftCx: 138, rightCx: 382, leftCy: 87,  rightCy: 87,  rx: 32, ry: 18 },
	analogue:{ leftCx: 170, rightCx: 350, leftCy: 105, rightCy: 105, rx: 32, ry: 18 },
};
