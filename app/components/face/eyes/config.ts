/**
 * Eye component configuration for each variant.
 * Defines the geometry and structure of eyes.
 */

import { RefObject } from "react";
import { FaceVariant } from "../types";

export interface EyeRefs {
	leftRef: RefObject<SVGElement>;
	rightRef: RefObject<SVGElement>;
	leftPupilRef?: RefObject<SVGElement>;
	rightPupilRef?: RefObject<SVGElement>;
	topRef?: RefObject<SVGElement>;
	topPupilRef?: RefObject<SVGElement>;
}

export interface EyeCallbacks {
	onWink: (eye: "left" | "right" | "top") => void;
	onHoverStart: (eye: "left" | "right" | "top") => void;
	onHoverEnd: (eye: "left" | "right" | "top") => void;
}

export interface EyeProps extends EyeRefs, EyeCallbacks {
	variant: FaceVariant;
	// Pupil position for tracking (normalized -1 to 1)
	pupilOffset?: { x: number; y: number };
	// Is avatar currently listening/speaking
	isActive?: boolean;
}

// Eye geometry constants per variant
export interface EyeGeometry {
	// Left eye
	leftCx: number;
	leftCy: number;
	leftRx: number;
	leftRy: number;
	// Right eye
	rightCx: number;
	rightCy: number;
	rightRx: number;
	rightRy: number;
	// Pupil radius (if applicable)
	pupilRadius?: number;
	// Top eye (for Myst)
	topCx?: number;
	topCy?: number;
	topR?: number;
}

export const EYE_GEOMETRIES: Partial<Record<FaceVariant, EyeGeometry>> = {};
