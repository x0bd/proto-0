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

export const EYE_GEOMETRIES: Partial<Record<FaceVariant, EyeGeometry>> = {
  myst: {
    // Triangular layout
    leftCx: 145,
    leftCy: 125,
    leftRx: 22,
    leftRy: 22,
    rightCx: 375,
    rightCy: 125,
    rightRx: 22,
    rightRy: 22,
    topCx: 260,
    topCy: 65,
    topR: 22,
    pupilRadius: 10,
  },
  flux: {
    // Geometric triangles - approximated as circles for now
    leftCx: 170,
    leftCy: 100,
    leftRx: 28,
    leftRy: 28,
    rightCx: 350,
    rightCy: 100,
    rightRx: 28,
    rightRy: 28,
    pupilRadius: 10,
  },
  echo: {
    // Minimal dots
    leftCx: 190,
    leftCy: 105,
    leftRx: 12,
    leftRy: 12,
    rightCx: 330,
    rightCy: 105,
    rightRx: 12,
    rightRy: 12,
    // No pupils for echo - just dots
  },
};
