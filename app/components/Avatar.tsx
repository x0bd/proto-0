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

export default function Avatar({
	emotion = { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 },
	className = "",
}: AvatarProps) {
	const avatarRef = useRef<SVGSVGElement>(null);
	const leftEyeRef = useRef<SVGCircleElement>(null);
	const rightEyeRef = useRef<SVGCircleElement>(null);
	const spectralBarsRef = useRef<SVGGElement>(null);

	useEffect(() => {
		if (!avatarRef.current) return;

		// Set initial state
		gsap.set([leftEyeRef.current, rightEyeRef.current], {
			scale: 1,
			transformOrigin: "center",
		});

		// Animate based on emotion
		animateEmotion(emotion);
	}, []);

	useEffect(() => {
		animateEmotion(emotion);
	}, [emotion]);

	const animateEmotion = (emotion: EmotionState) => {
		if (!leftEyeRef.current || !rightEyeRef.current || !spectralBarsRef.current) return;

		const { joy, sadness, surprise, anger, curiosity } = emotion;

		// Eye animations - subtle and clean
		const eyeScale = 0.9 + (surprise * 0.4) + (joy * 0.2);
		const eyeOpacity = Math.max(0.4, 1 - (sadness * 0.6));

		gsap.to([leftEyeRef.current, rightEyeRef.current], {
			scale: eyeScale,
			opacity: eyeOpacity,
			duration: 0.6,
			ease: "power2.out",
		});

		// Curiosity eye tilt
		if (curiosity > 0.3) {
			gsap.to(leftEyeRef.current, {
				rotation: -10 * curiosity,
				duration: 0.8,
				ease: "power2.out",
			});
			gsap.to(rightEyeRef.current, {
				rotation: 10 * curiosity,
				duration: 0.8,
				ease: "power2.out",
			});
		} else {
			gsap.to([leftEyeRef.current, rightEyeRef.current], {
				rotation: 0,
				duration: 0.8,
				ease: "power2.out",
			});
		}

		// Spectral bars animation - clean and minimal
		const bars = spectralBarsRef.current.children;
		Array.from(bars).forEach((bar, index) => {
			let scaleY = 1;
			let y = 0;
			let opacity = 0.6;

			// Joy: subtle upward movement
			if (joy > 0.3) {
				scaleY = 1 + (joy * 0.5);
				y = -joy * 8;
				opacity = 0.6 + (joy * 0.4);
			}
			// Sadness: bars shrink and lower
			else if (sadness > 0.3) {
				scaleY = 1 - (sadness * 0.4);
				y = sadness * 8;
				opacity = 0.6 - (sadness * 0.3);
			}
			// Surprise: quick scale variations
			else if (surprise > 0.3) {
				scaleY = 1 + (Math.random() * surprise * 0.6);
			}
			// Anger: tension
			else if (anger > 0.3) {
				scaleY = 1 + (anger * 0.3);
				opacity = 0.6 + (Math.random() * anger * 0.4);
			}
			// Curiosity: gentle wave
			else if (curiosity > 0.3) {
				scaleY = 1 + (Math.sin(Date.now() * 0.002 + index) * 0.2 * curiosity);
			}

			gsap.to(bar, {
				scaleY: scaleY,
				y: y,
				opacity: opacity,
				duration: 0.6,
				ease: "power2.out",
				delay: index * 0.05,
			});
		});
	};

	return (
		<div className={`flex flex-col items-center ${className}`}>
			{/* Avatar Container */}
			<div className="relative p-8 border border-black/10 dark:border-white/10 rounded-lg bg-white/30 dark:bg-black/30 backdrop-blur-sm">
				<svg
					ref={avatarRef}
					width="240"
					height="160"
					viewBox="0 0 240 160"
					className="mx-auto"
				>
					{/* Eyes */}
					<circle
						ref={leftEyeRef}
						cx="60"
						cy="60"
						r="8"
						fill="currentColor"
						className="text-black dark:text-white transition-all duration-300"
					/>
					<circle
						ref={rightEyeRef}
						cx="180"
						cy="60"
						r="8"
						fill="currentColor"
						className="text-black dark:text-white transition-all duration-300"
					/>

					{/* Spectral bars (mouth) */}
					<g ref={spectralBarsRef} transform="translate(120, 120)">
						{Array.from({ length: 5 }).map((_, i) => (
							<rect
								key={i}
								x={-40 + (i * 20)}
								y={-8}
								width="3"
								height="16"
								rx="1.5"
								fill="currentColor"
								className="text-black dark:text-white origin-bottom transition-all duration-300"
								opacity="0.6"
							/>
						))}
					</g>
				</svg>
			</div>

			{/* Emotion Stats */}
			<div className="mt-6 grid grid-cols-5 gap-4 text-center">
				{Object.entries(emotion).map(([key, value]) => (
					<div key={key} className="flex flex-col items-center">
						<div className="w-8 h-1 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden mb-2">
							<div 
								className="h-full bg-black dark:bg-white rounded-full transition-all duration-500"
								style={{ width: `${value * 100}%` }}
							/>
						</div>
						<span className="text-xs font-mono text-black/60 dark:text-white/60 tracking-wider">
							{key === 'joy' && '喜'}
							{key === 'sadness' && '悲'}
							{key === 'surprise' && '驚'}
							{key === 'anger' && '怒'}
							{key === 'curiosity' && '奇'}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
