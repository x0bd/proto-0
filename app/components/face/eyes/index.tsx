/**
 * Eyes Component
 * Routes to the correct eye component based on variant
 */

import { RefObject } from "react";
import { FaceVariant } from "../types";
import { EyeCallbacks, EyeRefs } from "./config";

// Legacy eyes implementation
import { Eyes as LegacyEyes } from "@/app/components/face/Eyes";

// Re-export types
export * from "./config";

interface EyesDispatcherProps extends EyeRefs, EyeCallbacks {
	variant: FaceVariant;
}

/**
 * Eyes component - renders the correct eye style per variant
 */
export function Eyes({
	variant,
	leftRef,
	rightRef,
	onWink,
	onHoverStart,
	onHoverEnd,
}: EyesDispatcherProps) {
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
