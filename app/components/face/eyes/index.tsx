/**
 * Eyes Component
 * Routes to the correct eye component based on variant
 */

import { RefObject } from "react";
import { EyeProps } from "./config";

// Legacy eyes implementation
import { Eyes as LegacyEyes } from "@/app/components/face/Eyes";

// Re-export types
export * from "./config";

/**
 * Eyes component - renders the correct eye style per variant
 */
export function Eyes({
	variant,
	leftRef,
	rightRef,
	leftPupilRef,
	rightPupilRef,
	onWink,
	onHoverStart,
	onHoverEnd,
	...rest
}: EyeProps) {
	if (variant === "robot") {
		const eyeClass =
			"cursor-pointer transition-opacity hover:opacity-80 transition-colors duration-300";
		return (
			<>
				{/* Left eye — solid precision dot */}
				<circle
					ref={leftRef as RefObject<SVGCircleElement>}
					cx="200"
					cy="105"
					r="16"
					fill="currentColor"
					className={eyeClass}
					onClick={(e) => {
						e.stopPropagation();
						onWink("left");
					}}
					onMouseEnter={() => onHoverStart("left")}
					onMouseLeave={() => onHoverEnd("left")}
				/>

				{/* Right eye — solid precision dot */}
				<circle
					ref={rightRef as RefObject<SVGCircleElement>}
					cx="320"
					cy="105"
					r="16"
					fill="currentColor"
					className={eyeClass}
					onClick={(e) => {
						e.stopPropagation();
						onWink("right");
					}}
					onMouseEnter={() => onHoverStart("right")}
					onMouseLeave={() => onHoverEnd("right")}
				/>
			</>
		);
	}

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
