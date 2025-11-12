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
	const svgBoxRef = useRef<SVGSVGElement | null>(null);
	const breathingTL = useRef<gsap.core.Timeline>();

	// Idle systems
	const blinkTimerRef = useRef<gsap.core.Tween | null>(null);
	const glanceTimerRef = useRef<gsap.core.Tween | null>(null);
	const idleMouthTweenRef = useRef<gsap.core.Tween | null>(null);
	const latestEyeTargetsRef = useRef<{
		rx: number;
		ry: number;
		cy: number;
		tilt: number;
	}>({ rx: 32, ry: 18, cy: 140, tilt: 0 });
	const latestMouthRef = useRef<{
		width: number;
		curve: number;
		tilt: number;
	}>({ width: 65, curve: 0, tilt: 0 });

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

		// Save latest eye targets for idle (blink/glance)
		latestEyeTargetsRef.current = {
			rx: Math.max(4, eyeWidth),
			ry: Math.max(2, eyeHeight),
			cy: 140 + eyeY,
			tilt: eyeTilt,
		};

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

		// Save latest mouth targets for idle wave
		latestMouthRef.current = {
			width: mouthWidth,
			curve: mouthCurve,
			tilt: mouthTilt,
		};
	}

	function performBlink() {
		const target = latestEyeTargetsRef.current;
		const blinkDur = 0.08;
		const ryClosed = 2;
		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				attr: { ry: ryClosed },
				duration: blinkDur,
				ease: "power1.in",
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				attr: { ry: ryClosed },
				duration: blinkDur,
				ease: "power1.in",
			});
		// reopen
		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				attr: { ry: target.ry },
				duration: 0.12,
				ease: "power2.out",
				delay: blinkDur,
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				attr: { ry: target.ry },
				duration: 0.12,
				ease: "power2.out",
				delay: blinkDur,
			});
	}

	function performGlance() {
		const deltaTilt = gsap.utils.random(-2, 2);
		const deltaY = gsap.utils.random(-1.5, 1.5);
		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				rotation: `+=${deltaTilt}`,
				attr: { cy: `+=${deltaY}` },
				duration: 0.35,
				yoyo: true,
				repeat: 1,
				ease: "sine.inOut",
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				rotation: `+=${-deltaTilt}`,
				attr: { cy: `+=${deltaY}` },
				duration: 0.35,
				yoyo: true,
				repeat: 1,
				ease: "sine.inOut",
			});
	}

	function startIdleMouthWave() {
		// Small wave around the current mouth curve, kept symmetric
		const state = { offset: 0 };
		idleMouthTweenRef.current = gsap.to(state, {
			offset: 4,
			duration: 2.2,
			repeat: -1,
			yoyo: true,
			ease: "sine.inOut",
			onUpdate: () => {
				const m = latestMouthRef.current;
				const half = m.width / 2;
				const controlYLocal = m.curve + state.offset;
				const d = `M ${-half} 0 Q 0 ${controlYLocal} ${half} 0`;
				if (mouthRef.current)
					gsap.set(mouthRef.current, { attr: { d } });
			},
		});
	}

	// Cursor tracking (eyes/mouth/face follow)
	function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
		if (!containerRef.current) return;
		// find the svg element once
		if (!svgBoxRef.current) {
			const el = containerRef.current.querySelector("svg");
			svgBoxRef.current = (el as SVGSVGElement) || null;
		}
		const svgEl = svgBoxRef.current;
		if (!svgEl) return;
		const rect = svgEl.getBoundingClientRect();
		const faceCenter = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height * (140 / 280),
		}; // eyes center row
		const mx = e.clientX - faceCenter.x;
		const my = e.clientY - faceCenter.y;
		const nx = Math.max(-1, Math.min(1, mx / (rect.width * 0.25)));
		const ny = Math.max(-1, Math.min(1, my / (rect.height * 0.25)));

		// eye follow: subtle tilt and vertical shift around latest targets
		const target = latestEyeTargetsRef.current;
		const eyeTiltDelta = nx * 8; // deg
		const eyeYDelta = ny * 6; // px
		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				rotation: -target.tilt + -eyeTiltDelta,
				attr: { cy: target.cy + eyeYDelta },
				duration: 0.2,
				ease: "linear",
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				rotation: target.tilt + eyeTiltDelta,
				attr: { cy: target.cy + eyeYDelta },
				duration: 0.2,
				ease: "linear",
			});

		// mouth subtle tilt follow
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt + nx * 6,
				duration: 0.25,
				ease: "linear",
			});

		// container micro parallax
		gsap.to(containerRef.current, {
			x: nx * 6,
			y: ny * 4,
			duration: 0.25,
			ease: "sine.out",
		});
	}

	function handlePointerLeave() {
		// return to latest emotion-driven targets
		const t = latestEyeTargetsRef.current;
		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				rotation: -t.tilt,
				attr: { cy: t.cy },
				duration: 0.3,
				ease: "power2.out",
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				rotation: t.tilt,
				attr: { cy: t.cy },
				duration: 0.3,
				ease: "power2.out",
			});
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt,
				duration: 0.3,
				ease: "power2.out",
			});
		if (containerRef.current)
			gsap.to(containerRef.current, {
				x: 0,
				y: 0,
				duration: 0.35,
				ease: "power2.out",
			});
	}

	// Effects placed after function declarations to satisfy linter ordering
	useEffect(() => {
		startBreathing();
		// inline starters to avoid deps warning
		const startBlink = () => {
			const delay = gsap.utils.random(2.8, 6.2);
			blinkTimerRef.current = gsap.delayedCall(delay, () => {
				performBlink();
				startBlink();
			});
		};
		startBlink();
		const startGlance = () => {
			const delay = gsap.utils.random(3.5, 7.5);
			glanceTimerRef.current = gsap.delayedCall(delay, () => {
				performGlance();
				startGlance();
			});
		};
		startGlance();
		startIdleMouthWave();
		return () => {
			breathingTL.current?.kill();
			blinkTimerRef.current?.kill();
			glanceTimerRef.current?.kill();
			idleMouthTweenRef.current?.kill();
		};
	}, []);

	useEffect(() => {
		animateEmotion(emotion);
	}, [emotion]);

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<div
				ref={containerRef}
				className="relative group"
				onMouseMove={handlePointerMove}
				onMouseLeave={handlePointerLeave}
			>
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
						onMouseEnter={() => {
							// widen slightly on hover
							if (leftEyeRef.current)
								gsap.to(leftEyeRef.current, {
									attr: {
										ry: Math.max(
											3,
											latestEyeTargetsRef.current.ry + 4
										),
									},
									duration: 0.15,
									ease: "power2.out",
								});
						}}
						onMouseLeave={() => {
							if (leftEyeRef.current)
								gsap.to(leftEyeRef.current, {
									attr: {
										ry: latestEyeTargetsRef.current.ry,
									},
									duration: 0.2,
									ease: "power2.out",
								});
						}}
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
						onMouseEnter={() => {
							if (rightEyeRef.current)
								gsap.to(rightEyeRef.current, {
									attr: {
										ry: Math.max(
											3,
											latestEyeTargetsRef.current.ry + 4
										),
									},
									duration: 0.15,
									ease: "power2.out",
								});
						}}
						onMouseLeave={() => {
							if (rightEyeRef.current)
								gsap.to(rightEyeRef.current, {
									attr: {
										ry: latestEyeTargetsRef.current.ry,
									},
									duration: 0.2,
									ease: "power2.out",
								});
						}}
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
