import { RefObject, MutableRefObject } from "react";

interface MouthProps {
	mouthRef: RefObject<SVGPathElement | null>;
	groupRef: RefObject<SVGGElement | null>;
	spectrumGroupRef: RefObject<SVGGElement | null>;
	spectrumBarsRef: MutableRefObject<SVGRectElement[]>;
	onClick: () => void;
	onHoverStart: () => void;
	onHoverEnd: () => void;
	variant?: "minimal" | "tron" | "kawaii" | "analogue";
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
				strokeWidth="4"
				strokeLinecap="round"
				className="text-black dark:text-white cursor-pointer transition-opacity hover:opacity-80"
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
						rx="4"
						fill="currentColor"
						className="text-black dark:text-white origin-bottom"
						style={{ transformOrigin: "center bottom" }}
					/>
				))}
			</g>
		</g>
	);
}
