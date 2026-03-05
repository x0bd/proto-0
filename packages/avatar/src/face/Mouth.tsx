import { RefObject, MutableRefObject } from "react";
import type { FaceVariant } from "./types";
import { getMouthStyle } from "./themes";

interface MouthProps {
	mouthRef: RefObject<SVGPathElement>;
	groupRef: RefObject<SVGGElement>;
	spectrumGroupRef: RefObject<SVGGElement>;
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
	const style = getMouthStyle(variant);

	return (
		<g ref={groupRef} transform="translate(260,175)">
			<path
				ref={mouthRef}
				d="M -33 0 Q 0 0 33 0"
				fill="none"
				stroke="currentColor"
				strokeWidth={
					variant === "tron"
						? "4"
						: variant === "analogue"
							? "3"
							: "4"
				}
				strokeLinecap={style.strokeLinecap}
				shapeRendering={style.shapeRendering}
				filter={variant === "analogue" ? "url(#pencil)" : undefined}
				style={{ cursor: "pointer" }}
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}
				onMouseEnter={onHoverStart}
				onMouseLeave={onHoverEnd}
			/>
			{/* Voice spectrum bars — kept hidden; animated by Avatar when speaking */}
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
						style={{ transformOrigin: "center bottom" }}
					/>
				))}
			</g>
		</g>
	);
}
