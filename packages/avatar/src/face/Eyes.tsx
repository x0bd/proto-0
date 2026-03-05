import React, { RefObject } from "react";
import type { FaceVariant } from "../types";

interface LegacyEyesProps {
	leftRef: RefObject<SVGElement>;
	rightRef: RefObject<SVGElement>;
	color?: string;
	variant: FaceVariant;
	onWink: (eye: "left" | "right") => void;
	onHoverStart: (eye: "left" | "right") => void;
	onHoverEnd: (eye: "left" | "right") => void;
	eyeClass?: string;
}

/**
 * Legacy eye renderer — routes all three variants to a shared geometry.
 * tron  → <rect>
 * analogue → <ellipse> with pencil filter
 * minimal  → solid <ellipse>
 */
export function Eyes({
	leftRef,
	rightRef,
	variant,
	onWink,
	onHoverStart,
	onHoverEnd,
	eyeClass = "",
}: LegacyEyesProps) {
	if (variant === "tron") {
		return (
			<>
				<rect
					ref={leftRef as RefObject<SVGRectElement>}
					x="106"
					y="69"
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
					x="350"
					y="69"
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

	if (variant === "analogue") {
		return (
			<>
				<ellipse
					ref={leftRef as RefObject<SVGEllipseElement>}
					cx="170"
					cy="105"
					rx="32"
					ry="18"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					filter="url(#pencil)"
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
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					filter="url(#pencil)"
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

	// minimal (default)
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
