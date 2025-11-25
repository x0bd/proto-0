import { RefObject } from "react";
import { FaceVariant } from "./types";

interface EyesProps {
	leftRef: RefObject<SVGElement | null>;
	rightRef: RefObject<SVGElement | null>;
	onWink: (eye: "left" | "right") => void;
	onHoverStart: (eye: "left" | "right") => void;
	onHoverEnd: (eye: "left" | "right") => void;
	variant?: FaceVariant;
}

export function Eyes({
	leftRef,
	rightRef,
	onWink,
	onHoverStart,
	onHoverEnd,
	variant = "minimal",
}: EyesProps) {
	// Shared classes
	const eyeClass =
		"text-black dark:text-white cursor-pointer transition-opacity hover:opacity-80";
	// Tron specific classes (cyan/magenta glow handled via drop-shadow in parent or just color)
	// For now, simple color switch or keeping currentColor

	if (variant === "tron") {
		return (
			<>
				{/* Tron Eyes: Rects. 
                     Note: Avatar.tsx calculates positions based on cx/cy. 
                     We use x/y here, but the animation engine will need to update x/y/width/height.
                     Initial values match the default ellipse (rx=32 -> width=64, ry=18 -> height=36).
                     cx=170 -> x=170-32=138
                     cx=350 -> x=350-32=318
                     cy=105 -> y=105-18=87
                 */}
				<rect
					ref={leftRef as RefObject<SVGRectElement>}
					x="138"
					y="87"
					width="64"
					height="36"
					rx="4"
					ry="4"
					fill="currentColor"
					className={eyeClass}
					onClick={(e) => {
						e.stopPropagation();
						onWink("left");
					}}
					onMouseEnter={() => onHoverStart("left")}
					onMouseLeave={() => onHoverEnd("left")}
				/>
				<rect
					ref={rightRef as RefObject<SVGRectElement>}
					x="318"
					y="87"
					width="64"
					height="36"
					rx="4"
					ry="4"
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
		<>
			<ellipse
				ref={leftRef as RefObject<SVGEllipseElement>}
				cx="170"
				cy="105"
				rx="32"
				ry="18"
				fill="currentColor"
				className={eyeClass}
				onClick={(e) => {
					e.stopPropagation();
					onWink("left");
				}}
				onMouseEnter={() => onHoverStart("left")}
				onMouseLeave={() => onHoverEnd("left")}
			/>

			<ellipse
				ref={rightRef as RefObject<SVGEllipseElement>}
				cx="350"
				cy="105"
				rx="32"
				ry="18"
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
