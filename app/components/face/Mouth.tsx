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
		// Robot: 7 slim uniform capsule bars — bottom-anchored, grow upward
		const BAR_W = 9;
		const BAR_BOTTOM = 20; // local y of bottom anchor
		const STRIDE = 22; // px between bar centers
		const baseHeights = [38, 52, 64, 72, 64, 52, 38];
		const barConfigs = Array.from({ length: 7 }, (_, i) => {
			const d = i - 3; // -3..3
			const h = baseHeights[i];
			return { cx: d * STRIDE, w: BAR_W, h, y: BAR_BOTTOM - h };
		});

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
				{/* 7 slim capsule bars — always visible, bottom-anchored */}
				<g ref={spectrumGroupRef} opacity="1">
					{barConfigs.map((bar, i) => (
						<rect
							key={i}
							ref={(el) => {
								if (el) spectrumBarsRef.current[i] = el;
							}}
							x={bar.cx - bar.w / 2}
							y={bar.y}
							width={bar.w}
							height={bar.h}
							rx={bar.w / 2}
							fill="currentColor"
							className="cursor-pointer transition-colors duration-300"
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
