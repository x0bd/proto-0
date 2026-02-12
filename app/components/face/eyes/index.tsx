/**
 * Eyes Component Dispatcher
 * Routes to the correct eye component based on variant
 */

import { RefObject } from "react";
import { FaceVariant, isLegacyVariant } from "../types";
import { EyeProps, EyeRefs, EyeCallbacks } from "./config";

// Legacy eyes (existing implementation)
import { Eyes as LegacyEyes } from "@/app/components/face/Eyes";

// Agent-based eyes
import { MystEyes } from "./MystEyes";
import { FluxEyes } from "./FluxEyes";
import { EchoEyes } from "./EchoEyes";

// Re-export types
export * from "./config";

interface EyesDispatcherProps extends EyeRefs, EyeCallbacks {
  variant: FaceVariant;
  pupilOffset?: { x: number; y: number };
  isActive?: boolean;
}

/**
 * Unified Eyes component that dispatches to variant-specific implementations
 */
export function Eyes({
  variant,
  leftRef,
  rightRef,
  leftPupilRef,
  rightPupilRef,
  topRef,
  topPupilRef,
  onWink,
  onHoverStart,
  onHoverEnd,
  pupilOffset = { x: 0, y: 0 },
  isActive = false,
}: EyesDispatcherProps) {
  // Legacy variants use the original Eyes component
  if (isLegacyVariant(variant)) {
    return (
      <LegacyEyes
        leftRef={leftRef}
        rightRef={rightRef}
        onWink={onWink as (eye: "left" | "right") => void}
        onHoverStart={onHoverStart as (eye: "left" | "right") => void}
        onHoverEnd={onHoverEnd as (eye: "left" | "right") => void}
        variant={variant as "minimal" | "tron" | "analogue"}
      />
    );
  }

  // Common props for new eye components
  const props: EyeProps = {
    leftRef,
    rightRef,
    leftPupilRef,
    rightPupilRef,
    topRef,
    topPupilRef,
    onWink,
    onHoverStart,
    onHoverEnd,
    variant,
    pupilOffset,
    isActive,
  };

  switch (variant) {
    case "myst":
      return <MystEyes {...props} />;
    case "flux":
      return <FluxEyes {...props} />;
    case "echo":
      return <EchoEyes {...props} />;
    default:
      // Fallback to legacy
      return (
        <LegacyEyes
          leftRef={leftRef}
          rightRef={rightRef}
          onWink={onWink as (eye: "left" | "right") => void}
          onHoverStart={onHoverStart as (eye: "left" | "right") => void}
          onHoverEnd={onHoverEnd as (eye: "left" | "right") => void}
          variant="minimal"
        />
      );
  }
}
