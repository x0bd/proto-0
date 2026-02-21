/**
 * Eye component configuration for each variant.
 * Defines the geometry and structure of eyes.
 */

import { RefObject } from "react";
import { FaceVariant } from "../types";

export interface EyeRefs {
	leftRef: RefObject<any>;
	rightRef: RefObject<any>;
	// New: pupil refs for tracking
	leftPupilRef?: RefObject<any>;
	rightPupilRef?: RefObject<any>;
	// Extra refs for variants with 3+ eyes
	topRef?: RefObject<any>;
	topPupilRef?: RefObject<any>;
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
