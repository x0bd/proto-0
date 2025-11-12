"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface EmotionState {
	joy: number;
	sadness: number;
	surprise: number;
	anger: number;
	curiosity: number;
}

interface AvatarProps {
	emotion?: EmotionState;
	className?: string;
}

const DEFAULT_EMOTION: EmotionState = {
	joy: 0.3,
	sadness: 0,
	surprise: 0.1,
	anger: 0,
	curiosity: 0.2,
};

export default function Avatar({
	emotion = DEFAULT_EMOTION,
	className = "",
}: AvatarProps) {
	const leftEyeRef = useRef<SVGEllipseElement>(null);
	const rightEyeRef = useRef<SVGEllipseElement>(null);
	const mouthRef = useRef<SVGPathElement>(null);

	useEffect(() => {
		animateEmotion(emotion);
	}, [emotion]);

	const animateEmotion = (state: EmotionState) => {
		const { joy, sadness, surprise, anger, curiosity } = state;

		// Eye calculations
		const eyeWidth = 28 + surprise * 12 - anger * 8;
		const eyeHeight = 16 + surprise * 8 - (sadness * 10 + joy * 4);
		const eyeTilt = curiosity * 12 - anger * 8;
		const eyeY = sadness * 8 - surprise * 4;

		// Mouth calculations
		const mouthCurve = joy * 30 - sadness * 40 - anger * 20;
		const mouthTilt = curiosity * 8 - anger * 6;
		const mouthWidth = 60 + surprise * 20 - sadness * 15;

		// Animate left eye
		if (leftEyeRef.current) {
			gsap.to(leftEyeRef.current, {
				attr: {
					rx: eyeWidth,
					ry: Math.max(2, eyeHeight),
					cy: 140 + eyeY,
				},
				rotation: -eyeTilt,
				duration: 0.6,
				ease: "power2.out",
				transformOrigin: "center center",
			});
		}

		// Animate right eye
		if (rightEyeRef.current) {
			gsap.to(rightEyeRef.current, {
				attr: {
					rx: eyeWidth,
					ry: Math.max(2, eyeHeight),
					cy: 140 + eyeY,
				},
				rotation: eyeTilt,
				duration: 0.6,
				ease: "power2.out",
				transformOrigin: "center center",
			});
		}

		// Animate mouth
		if (mouthRef.current) {
			const startX = 260 - mouthWidth / 2;
			const endX = 260 + mouthWidth / 2;
			const midY = 200 + mouthCurve;

			const pathData = `M ${startX} 200 Q 260 ${midY} ${endX} 200`;

			gsap.to(mouthRef.current, {
				attr: { d: pathData },
				rotation: mouthTilt,
				duration: 0.6,
				ease: "power2.out",
				transformOrigin: "260px 200px",
			});
		}
	};

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<div className="relative">
				{/* Subtle container glow */}
				<div className="absolute -inset-4 bg-black/5 dark:bg-white/5 rounded-full blur-2xl" />

				<svg
					width="520"
					height="300"
					viewBox="0 0 520 300"
					className="relative"
				>
					{/* Left Eye */}
					<ellipse
						ref={leftEyeRef}
						cx="180"
						cy="140"
						rx="28"
						ry="16"
						fill="currentColor"
						className="text-black dark:text-white"
					/>

					{/* Right Eye */}
					<ellipse
						ref={rightEyeRef}
						cx="340"
						cy="140"
						rx="28"
						ry="16"
						fill="currentColor"
						className="text-black dark:text-white"
					/>

					{/* Mouth */}
					<path
						ref={mouthRef}
						d="M 230 200 Q 260 200 290 200"
						fill="none"
						stroke="currentColor"
						strokeWidth="4"
						strokeLinecap="round"
						className="text-black dark:text-white"
					/>
				</svg>
			</div>
		</div>
	);
}
