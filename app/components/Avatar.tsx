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
	const containerRef = useRef<HTMLDivElement>(null);
	const leftEyeRef = useRef<SVGEllipseElement>(null);
	const rightEyeRef = useRef<SVGEllipseElement>(null);
	const mouthRef = useRef<SVGPathElement>(null);
	const mouthGroupRef = useRef<SVGGElement>(null);
	const breathingTL = useRef<gsap.core.Timeline>();

	function startBreathing() {
		if (containerRef.current) {
			breathingTL.current = gsap.timeline({ repeat: -1 });
			breathingTL.current
				.to(containerRef.current, {
					scale: 1.015,
					duration: 2.4,
					ease: "sine.inOut",
				})
				.to(containerRef.current, {
					scale: 1,
					duration: 2.8,
					ease: "sine.inOut",
				});
		}
	}

	function animateEmotion(state: EmotionState) {
		const { joy, sadness, surprise, anger, curiosity } = state;

		// Enhanced emotion calculations with smoother curves
		const alertness = surprise + curiosity * 0.7 + joy * 0.3;
		const intensity = Math.max(joy, sadness, surprise, anger, curiosity);

		// Eye dynamics - more nuanced
		const baseEyeWidth = 32;
		const baseEyeHeight = 18;

		const eyeWidth =
			baseEyeWidth +
			surprise * 15 -
			anger * 12 -
			sadness * 8 +
			Math.sin(intensity * Math.PI) * 3;

		const eyeHeight =
			baseEyeHeight +
			surprise * 12 -
			(sadness * 14 + anger * 10) +
			joy * Math.sin(joy * Math.PI) * 4;

		const eyeTilt =
			curiosity * 14 - anger * 12 + joy * 3 * Math.sin(joy * Math.PI * 2);

		const eyeY =
			sadness * 12 -
			surprise * 6 +
			anger * 4 +
			Math.cos(intensity * Math.PI) * 2;

		// Mouth dynamics - more expressive curves
		const baseCurve = 0;
		const joyMultiplier = 35 * Math.sin(joy * Math.PI * 0.8);
		const sadnessMultiplier = -45 * Math.pow(sadness, 1.2);
		const angerMultiplier = -25 * Math.pow(anger, 0.8);

		const mouthCurve =
			baseCurve + joyMultiplier + sadnessMultiplier + angerMultiplier;

		const mouthTilt =
			curiosity * 10 - anger * 8 + Math.sin(curiosity * Math.PI) * 4;

		const mouthWidth =
			65 + surprise * 25 - sadness * 20 - anger * 15 + alertness * 8;

		// Staggered, premium animations
		const stagger = 0.08;

		// Animate left eye with slight delay
		if (leftEyeRef.current) {
			gsap.to(leftEyeRef.current, {
				attr: {
					rx: Math.max(4, eyeWidth),
					ry: Math.max(2, eyeHeight),
					cy: 140 + eyeY,
				},
				rotation: -eyeTilt,
				duration: 0.75,
				ease: "power2.out",
				transformOrigin: "center center",
				delay: 0,
			});
		}

		// Animate right eye with slight delay
		if (rightEyeRef.current) {
			gsap.to(rightEyeRef.current, {
				attr: {
					rx: Math.max(4, eyeWidth),
					ry: Math.max(2, eyeHeight),
					cy: 140 + eyeY,
				},
				rotation: eyeTilt,
				duration: 0.75,
				ease: "power2.out",
				transformOrigin: "center center",
				delay: stagger,
			});
		}

		// Animate mouth with perfect facial symmetry (drawn around local origin)
		if (mouthRef.current) {
			const half = mouthWidth / 2;
			const controlYLocal = mouthCurve; // local space (0,0) is mouth center
			const pathData = `M ${-half} 0 Q 0 ${controlYLocal} ${half} 0`;
			gsap.to(mouthRef.current, {
				attr: { d: pathData },
				duration: 0.8,
				ease: "power2.out",
				delay: stagger * 2,
			});
		}

		// Rotate the mouth group strictly around the face center using svgOrigin
		if (mouthGroupRef.current) {
			gsap.to(mouthGroupRef.current, {
				rotation: mouthTilt,
				duration: 0.8,
				ease: "power2.out",
				svgOrigin: "260 210",
				delay: stagger * 2,
			});
		}
	}

	// Effects placed after function declarations to satisfy linter ordering
	useEffect(() => {
		startBreathing();
		return () => {
			breathingTL.current?.kill();
		};
	}, []);

	useEffect(() => {
		animateEmotion(emotion);
	}, [emotion]);

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<div ref={containerRef} className="relative group">
				{/* Ultra-subtle hover glow */}
				<div className="absolute -inset-6 bg-black/3 dark:bg-white/3 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

				<svg
					width="520"
					height="280"
					viewBox="0 0 520 280"
					className="relative"
				>
					{/* Left Eye - 90px from center (260 - 90 = 170) */}
					<ellipse
						ref={leftEyeRef}
						cx="170"
						cy="140"
						rx="32"
						ry="18"
						fill="currentColor"
						className="text-black dark:text-white"
					/>

					{/* Right Eye - 90px from center (260 + 90 = 350) */}
					<ellipse
						ref={rightEyeRef}
						cx="350"
						cy="140"
						rx="32"
						ry="18"
						fill="currentColor"
						className="text-black dark:text-white"
					/>

					{/* Mouth - Perfectly centered & symmetric (drawn in local space) */}
					<g ref={mouthGroupRef} transform="translate(260,210)">
						<path
							ref={mouthRef}
							d="M -33 0 Q 0 0 33 0"
							fill="none"
							stroke="currentColor"
							strokeWidth="4"
							strokeLinecap="round"
							className="text-black dark:text-white"
						/>
					</g>
				</svg>
			</div>
		</div>
	);
}
