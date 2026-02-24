import { RefObject, MutableRefObject } from "react";
import { FaceVariant } from "./types";
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

	if (variant === "robot") {
		// Robot: 5 capsule bars as the mouth — bars ARE the expression
		const barConfigs = [
			{ cx: -44, w: 12, h: 38 },
			{ cx: -22, w: 14, h: 52 },
			{ cx: 0, w: 16, h: 65 },
			{ cx: 22, w: 14, h: 52 },
			{ cx: 44, w: 12, h: 38 },
		];

		return (
			<g ref={groupRef} transform="translate(260,175)">
				{/* Hidden path for ref compatibility */}
				<path
					ref={mouthRef}
					d="M -33 0 Q 0 0 33 0"
					fill="none"
					stroke="none"
					opacity="0"
				/>
				{/* 5 capsule bars — always visible */}
				<g ref={spectrumGroupRef} opacity="1">
					{barConfigs.map((bar, i) => (
						<rect
							key={i}
							ref={(el) => {
								if (el) spectrumBarsRef.current[i] = el;
							}}
							x={bar.cx - bar.w / 2}
							y={-5}
							width={bar.w}
							height={bar.h}
							rx={bar.w / 2}
							fill="currentColor"
							className="cursor-pointer transition-colors duration-300"
							style={{ transformOrigin: `${bar.cx}px -5px` }}
							onClick={(e) => {
								e.stopPropagation();
								onClick();
							}}
							onMouseEnter={onHoverStart}
							onMouseLeave={onHoverEnd}
						/>
					))}
				</g>
			</g>
		);
	}

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
				style={undefined}
				className={`cursor-pointer transition-opacity hover:opacity-80 transition-colors duration-300 ${
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
						className="origin-bottom transition-colors duration-300"
						style={{ transformOrigin: "center bottom" }}
					/>
				))}
			</g>
		</g>
	);
}
