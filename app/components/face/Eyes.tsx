import { RefObject } from "react";

interface EyesProps {
	leftRef: RefObject<SVGEllipseElement | null>;
	rightRef: RefObject<SVGEllipseElement | null>;
	onWink: (eye: "left" | "right") => void;
	onHoverStart: (eye: "left" | "right") => void;
	onHoverEnd: (eye: "left" | "right") => void;
	variant?: "minimal" | "tron" | "kawaii" | "analogue";
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

	return (
		<>
			{/* Left Eye - 90px from center (260 - 90 = 170) */}
			<ellipse
				ref={leftRef}
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

			{/* Right Eye - 90px from center (260 + 90 = 350) */}
			<ellipse
				ref={rightRef}
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
