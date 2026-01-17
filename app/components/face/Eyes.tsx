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
		"cursor-pointer transition-opacity hover:opacity-80 transition-colors duration-300";
	// Tron specific classes
	const tronEyeClass =
		"cursor-pointer transition-opacity hover:opacity-80 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] transition-colors duration-300";

	if (variant === "tron") {
		return (
			<>
				<rect
					ref={leftRef as RefObject<SVGRectElement>}
					x="138"
					y="87"
					width="64"
					height="36"
					rx="4"
					ry="4"
					fill="currentColor"
					className={tronEyeClass}

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
					className={tronEyeClass}

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
