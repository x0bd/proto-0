import { RefObject, MutableRefObject } from "react";
import { FaceVariant } from "./types";

interface MouthProps {
	mouthRef: RefObject<SVGPathElement | null>;
	groupRef: RefObject<SVGGElement | null>;
	spectrumGroupRef: RefObject<SVGGElement | null>;
	spectrumBarsRef: MutableRefObject<SVGRectElement[]>;
	onClick: () => void;
	onHoverStart: () => void;
	onHoverEnd: () => void;
	variant?: FaceVariant;
}

export function Mouth({
	mouthRef,
	groupRef,
	spectrumGroupRef,
	spectrumBarsRef,
	onClick,
	onHoverStart,
	onHoverEnd,
	variant = "minimal",
}: MouthProps) {
	return (
		<g ref={groupRef} transform="translate(260,175)">
			<path
				ref={mouthRef}
				d="M -33 0 Q 0 0 33 0"
				fill="none"
				stroke="currentColor"
				strokeWidth={variant === "tron" ? "4" : variant === "analogue" ? "3" : "4"}
				strokeLinecap={variant === "tron" ? "square" : "round"}
				shapeRendering={variant === "tron" ? "crispEdges" : "auto"}
				filter={variant === "analogue" ? "url(#pencil)" : undefined}
				className={`text-black dark:text-white cursor-pointer transition-opacity hover:opacity-80 ${
					variant === "tron"
						? "drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]"
						: ""
				}`}
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}
				onMouseEnter={onHoverStart}
				onMouseLeave={onHoverEnd}
			/>
			{/* Voice spectrum bars (hidden until voiceEnabled) */}
			<g ref={spectrumGroupRef} opacity="0">
				{Array.from({ length: 9 }).map((_, i) => (
					<rect
						key={i}
						ref={(el) => {
							if (el) spectrumBarsRef.current[i] = el;
						}}
						x={-88 + i * 22}
						y={-18}
						width="8"
						height="30"
						rx={variant === "tron" ? "0" : "4"}
						fill="currentColor"
						className="text-black dark:text-white origin-bottom"
						style={{ transformOrigin: "center bottom" }}
					/>
				))}
			</g>
		</g>
	);
}
