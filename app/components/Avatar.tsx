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
		if (
			!leftEyeRef.current ||
			!rightEyeRef.current ||
			!spectralBarsRef.current
		)
			return;

		const { joy, sadness, surprise, anger, curiosity } = emotion;

		// Eye animations - subtle and clean
		const eyeScale = 0.9 + surprise * 0.4 + joy * 0.2;
		const eyeOpacity = Math.max(0.4, 1 - sadness * 0.6);

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
				scaleY = 1 + joy * 0.5;
				y = -joy * 8;
				opacity = 0.6 + joy * 0.4;
			}
			// Sadness: bars shrink and lower
			else if (sadness > 0.3) {
				scaleY = 1 - sadness * 0.4;
				y = sadness * 8;
				opacity = 0.6 - sadness * 0.3;
			}
			// Surprise: quick scale variations
			else if (surprise > 0.3) {
				scaleY = 1 + Math.random() * surprise * 0.6;
			}
			// Anger: tension
			else if (anger > 0.3) {
				scaleY = 1 + anger * 0.3;
				opacity = 0.6 + Math.random() * anger * 0.4;
			}
			// Curiosity: gentle wave
			else if (curiosity > 0.3) {
				scaleY =
					1 + Math.sin(Date.now() * 0.002 + index) * 0.2 * curiosity;
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
		<div
			className={`flex flex-col items-center justify-center h-full ${className}`}
		>
			{/* Avatar Container - Apple-level Premium */}
			<div className="relative group">
				{/* Outer glow */}
				<div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-3xl blur-2xl scale-105 opacity-0 group-hover:opacity-100 transition-all duration-700" />
				
				{/* Main container */}
				<div className="relative p-20 border border-black/5 dark:border-white/5 rounded-3xl bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.08)] hover:shadow-[0_16px_64px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_64px_rgba(255,255,255,0.12)] transition-all duration-500">
					<svg
						ref={avatarRef}
						width="520"
						height="360"
						viewBox="0 0 520 360"
						className="mx-auto filter drop-shadow-sm"
					>
						{/* Subtle background circle */}
						<circle
							cx="260"
							cy="180"
							r="160"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							className="text-black/5 dark:text-white/5"
						/>

						{/* Eyes - THICC and Japanese */}
						<circle
							ref={leftEyeRef}
							cx="140"
							cy="140"
							r="32"
							fill="currentColor"
							className="text-black dark:text-white transition-all duration-500 filter drop-shadow-sm"
							style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
						/>
						<circle
							ref={rightEyeRef}
							cx="380"
							cy="140"
							r="32"
							fill="currentColor"
							className="text-black dark:text-white transition-all duration-500 filter drop-shadow-sm"
							style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
						/>

						{/* Spectral bars (mouth) - MUCH THICKER Japanese Style */}
						<g ref={spectralBarsRef} transform="translate(260, 260)">
							{Array.from({ length: 5 }).map((_, i) => (
								<rect
									key={i}
									x={-100 + i * 50}
									y={-20}
									width="12"
									height="40"
									rx="6"
									fill="currentColor"
									className="text-black dark:text-white origin-bottom transition-all duration-500"
									opacity="0.8"
									style={{ 
										filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
										transformOrigin: 'center bottom'
									}}
								/>
							))}
						</g>

						{/* Subtle accent marks - Japanese aesthetic */}
						<g opacity="0.3">
							<line x1="100" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white" />
							<line x1="400" y1="60" x2="420" y2="60" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white" />
						</g>
					</svg>
				</div>
			</div>

			{/* Emotion Stats - Apple-level Refinement */}
			<div className="mt-16 grid grid-cols-5 gap-10 text-center">
				{Object.entries(emotion).map(([key, value]) => (
					<div key={key} className="group flex flex-col items-center">
						{/* Progress bar with Apple-style animation */}
						<div className="relative w-20 h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-4 shadow-inner">
							<div
								className="h-full bg-gradient-to-r from-black to-black/80 dark:from-white dark:to-white/80 rounded-full transition-all duration-700 ease-out shadow-sm"
								style={{ 
									width: `${value * 100}%`,
									boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
								}}
							/>
							{/* Subtle highlight */}
							<div 
								className="absolute top-0 left-0 h-1 bg-white/30 dark:bg-black/30 rounded-full transition-all duration-700"
								style={{ width: `${value * 100}%` }}
							/>
						</div>

						{/* Japanese character with premium typography */}
						<div className="relative">
							<span className="text-xl font-medium text-black/80 dark:text-white/80 tracking-wider group-hover:scale-105 transition-transform duration-300 font-japanese">
								{key === "joy" && "喜び"}
								{key === "sadness" && "悲しみ"}
								{key === "surprise" && "驚き"}
								{key === "anger" && "怒り"}
								{key === "curiosity" && "好奇心"}
							</span>
						</div>
						
						{/* Percentage with subtle animation */}
						<span className="text-sm font-mono text-black/50 dark:text-white/50 mt-2 tabular-nums tracking-wider">
							{Math.round(value * 100).toString().padStart(2, '0')}%
						</span>
					</div>
				))}
			</div>

			{/* Subtle Japanese accent */}
			<div className="mt-12 opacity-30">
				<div className="flex items-center gap-2">
					<div className="w-8 h-px bg-black dark:bg-white" />
					<div className="w-2 h-2 bg-black dark:bg-white rounded-full" />
					<div className="w-8 h-px bg-black dark:bg-white" />
				</div>
			</div>
		</div>
	);
}
