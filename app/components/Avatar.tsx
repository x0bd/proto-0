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
	voiceEnabled?: boolean;
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
	voiceEnabled = false,
}: AvatarProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const leftEyeRef = useRef<SVGEllipseElement>(null);
	const rightEyeRef = useRef<SVGEllipseElement>(null);
	const mouthRef = useRef<SVGPathElement>(null);
	const mouthGroupRef = useRef<SVGGElement>(null);
	const svgBoxRef = useRef<SVGSVGElement | null>(null);
	// Voice simulation (no mic) + optional spectrum group (kept hidden)
	const spectrumGroupRef = useRef<SVGGElement>(null);
	const spectrumBarsRef = useRef<SVGRectElement[]>([]);
	const simTickerRef = useRef<((time: number) => void) | null>(null);
	const simTimeRef = useRef<number>(0);
	const simAmpRef = useRef<number>(0);
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
	}>({ rx: 32, ry: 18, cy: 105, tilt: 0 });
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
					cy: 105 + eyeY,
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
					cy: 105 + eyeY,
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
			cy: 105 + eyeY,
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
				svgOrigin: "260 175",
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

	// Enhanced cursor/touch tracking with playful movements
	function handlePointerMove(
		e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
	) {
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
		}; // face pivot row (SVG vertical center)

		// Handle both mouse and touch events
		const clientX = "clientX" in e ? e.clientX : e.touches[0]?.clientX || 0;
		const clientY = "clientY" in e ? e.clientY : e.touches[0]?.clientY || 0;

		const mx = clientX - faceCenter.x;
		const my = clientY - faceCenter.y;
		const nx = Math.max(-1, Math.min(1, mx / (rect.width * 0.3)));
		const ny = Math.max(-1, Math.min(1, my / (rect.height * 0.3)));

		// More dramatic eye follow with playful bounce
		const target = latestEyeTargetsRef.current;
		const eyeTiltDelta = nx * 12; // increased from 8
		const eyeYDelta = ny * 8; // increased from 6
		const eyeScale = 1 + Math.abs(nx) * 0.05; // subtle scale on extreme movements

		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				rotation: -target.tilt + -eyeTiltDelta,
				attr: { cy: target.cy + eyeYDelta },
				scale: eyeScale,
				duration: 0.3,
				ease: "back.out(1.2)",
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				rotation: target.tilt + eyeTiltDelta,
				attr: { cy: target.cy + eyeYDelta },
				scale: eyeScale,
				duration: 0.3,
				ease: "back.out(1.2)",
			});

		// More expressive mouth tilt with overshoot
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt + nx * 10,
				duration: 0.35,
				ease: "back.out(1.1)",
			});

		// Enhanced container movement with head lean
		gsap.to(containerRef.current, {
			x: nx * 8,
			y: ny * 6,
			rotation: nx * 2, // head tilt
			duration: 0.3,
			ease: "power2.out",
		});
	}

	function handlePointerLeave() {
		// return to latest emotion-driven targets with gentle bounce
		const t = latestEyeTargetsRef.current;
		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				rotation: -t.tilt,
				attr: { cy: t.cy },
				scale: 1,
				duration: 0.4,
				ease: "back.out(1.1)",
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				rotation: t.tilt,
				attr: { cy: t.cy },
				scale: 1,
				duration: 0.4,
				ease: "back.out(1.1)",
			});
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt,
				duration: 0.4,
				ease: "back.out(1.1)",
			});
		if (containerRef.current)
			gsap.to(containerRef.current, {
				x: 0,
				y: 0,
				rotation: 0,
				duration: 0.45,
				ease: "back.out(1.1)",
			});
	}

	// Playful interactions
	function performWink(eye: "left" | "right") {
		const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
		const target = latestEyeTargetsRef.current;

		if (eyeRef.current) {
			const tl = gsap.timeline();
			tl.to(eyeRef.current, {
				attr: { ry: 2 },
				scaleX: 0.7,
				duration: 0.1,
				ease: "power2.in",
			}).to(eyeRef.current, {
				attr: { ry: target.ry },
				scaleX: 1,
				duration: 0.15,
				ease: "back.out(2)",
			});
		}
	}

	function performSurprise() {
		const target = latestEyeTargetsRef.current;
		const tl = gsap.timeline();

		// Eyes wide with bounce
		tl.to([leftEyeRef.current, rightEyeRef.current], {
			attr: {
				rx: target.rx + 15,
				ry: target.ry + 10,
			},
			scale: 1.1,
			duration: 0.2,
			ease: "back.out(2)",
		}).to([leftEyeRef.current, rightEyeRef.current], {
			attr: {
				rx: target.rx,
				ry: target.ry,
			},
			scale: 1,
			duration: 0.3,
			ease: "elastic.out(1, 0.5)",
		});

		// Mouth opens in surprise
		if (mouthRef.current && mouthGroupRef.current) {
			const m = latestMouthRef.current;
			const half = (m.width + 20) / 2;
			const surpriseD = `M ${-half} 0 Q 0 15 ${half} 0`;

			tl.to(
				mouthRef.current,
				{
					attr: { d: surpriseD },
					duration: 0.2,
					ease: "back.out(2)",
				},
				0
			).to(mouthRef.current, {
				attr: {
					d: `M ${-m.width / 2} 0 Q 0 ${m.curve} ${m.width / 2} 0`,
				},
				duration: 0.3,
				ease: "elastic.out(1, 0.5)",
			});
		}
	}

	function performBoop() {
		if (containerRef.current) {
			gsap.timeline()
				.to(containerRef.current, {
					scale: 0.95,
					duration: 0.1,
					ease: "power2.in",
				})
				.to(containerRef.current, {
					scale: 1.05,
					duration: 0.15,
					ease: "back.out(3)",
				})
				.to(containerRef.current, {
					scale: 1,
					duration: 0.2,
					ease: "elastic.out(1, 0.3)",
				});
		}

		// Eyes blink quickly
		performBlink();
	}

	function performMouthClick() {
		if (mouthRef.current) {
			const m = latestMouthRef.current;
			const half = m.width / 2;
			const smileD = `M ${-half} 0 Q 0 ${m.curve - 20} ${half} 0`;

			gsap.timeline()
				.to(mouthRef.current, {
					attr: { d: smileD },
					duration: 0.15,
					ease: "back.out(2)",
				})
				.to(mouthRef.current, {
					attr: { d: `M ${-half} 0 Q 0 ${m.curve} ${half} 0` },
					duration: 0.25,
					ease: "elastic.out(1, 0.4)",
				});
		}
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

	// Voice simulation setup / teardown (no mic)
	useEffect(() => {
		// Always hide spectrum bars (we render only the mouth line animation)
		if (spectrumGroupRef.current)
			gsap.set(spectrumGroupRef.current, { opacity: 0 });

		if (!voiceEnabled) {
			// Stop voice sim ticker
			if (simTickerRef.current) {
				gsap.ticker.remove(simTickerRef.current);
				simTickerRef.current = null;
			}
			// Restore mouth visibility and reset to emotion baseline immediately
			if (mouthRef.current) {
				const m = latestMouthRef.current;
				const half = m.width / 2;
				const d = `M ${-half} 0 Q 0 ${m.curve} ${half} 0`;
				gsap.set(mouthRef.current, { opacity: 1, attr: { d } });
			}
			if (mouthGroupRef.current) {
				gsap.to(mouthGroupRef.current, {
					rotation: latestMouthRef.current.tilt,
					duration: 0.25,
					ease: "power2.out",
				});
			}
			// (Re)start idle wave for subtle motion
			if (idleMouthTweenRef.current) {
				idleMouthTweenRef.current.kill();
				idleMouthTweenRef.current = null;
			}
			startIdleMouthWave();
			return;
		}

		// Pause idle wave during simulated voice
		if (idleMouthTweenRef.current) {
			idleMouthTweenRef.current.kill();
			idleMouthTweenRef.current = null;
		}
		if (mouthRef.current) gsap.set(mouthRef.current, { opacity: 1 });

		// Smooth, layered sine simulation
		simTimeRef.current = 0;
		simAmpRef.current = 0;
		const ticker = () => {
			simTimeRef.current += 0.016; // ~60fps
			const t = simTimeRef.current;
			// Layered sines for rich, smooth motion
			const base = 10; // base amplitude
			const amp =
				base *
				(0.55 * Math.sin(t * 6.2) +
					0.35 * Math.sin(t * 9.1 + 0.7) +
					0.2 * Math.sin(t * 13.4 + 1.9));
			simAmpRef.current = amp; // -base..+base

			// Update mouth path around latest emotion curve/width
			const m = latestMouthRef.current;
			const half = m.width / 2;
			const controlYLocal = m.curve + simAmpRef.current;
			const d = `M ${-half} 0 Q 0 ${controlYLocal} ${half} 0`;
			if (mouthRef.current) gsap.set(mouthRef.current, { attr: { d } });
		};
		simTickerRef.current = ticker;
		gsap.ticker.add(ticker);

		return () => {
			if (simTickerRef.current) {
				gsap.ticker.remove(simTickerRef.current);
				simTickerRef.current = null;
			}
		};
	}, [voiceEnabled]);

	return (
		<div className={`flex items-center justify-center w-full ${className}`}>
			<div
				ref={containerRef}
				className="relative group cursor-pointer w-full"
				onMouseMove={handlePointerMove}
				onMouseLeave={handlePointerLeave}
				onTouchMove={handlePointerMove}
				onTouchEnd={handlePointerLeave}
				onClick={performBoop}
				onDoubleClick={performSurprise}
			>
				{/* Enhanced playful hover glow */}
				<div className="absolute -inset-8 bg-black/5 dark:bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
				<div className="absolute -inset-4 bg-black/2 dark:bg-white/2 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

				<svg
					viewBox="0 0 520 280"
					className="relative w-full h-auto min-w-[280px]"
				>
					{/* Left Eye - 90px from center (260 - 90 = 170) */}
					<ellipse
						ref={leftEyeRef}
						cx="170"
						cy="105"
						rx="32"
						ry="18"
						fill="currentColor"
						className="text-black dark:text-white cursor-pointer transition-opacity hover:opacity-80"
						onClick={(e) => {
							e.stopPropagation();
							performWink("left");
						}}
						onMouseEnter={() => {
							// More dramatic hover effect
							if (leftEyeRef.current)
								gsap.to(leftEyeRef.current, {
									attr: {
										ry: Math.max(
											3,
											latestEyeTargetsRef.current.ry + 6
										),
										rx: Math.max(
											4,
											latestEyeTargetsRef.current.rx + 3
										),
									},
									scale: 1.05,
									duration: 0.2,
									ease: "back.out(1.5)",
								});
						}}
						onMouseLeave={() => {
							if (leftEyeRef.current)
								gsap.to(leftEyeRef.current, {
									attr: {
										ry: latestEyeTargetsRef.current.ry,
										rx: latestEyeTargetsRef.current.rx,
									},
									scale: 1,
									duration: 0.25,
									ease: "power2.out",
								});
						}}
					/>

					{/* Right Eye - 90px from center (260 + 90 = 350) */}
					<ellipse
						ref={rightEyeRef}
						cx="350"
						cy="105"
						rx="32"
						ry="18"
						fill="currentColor"
						className="text-black dark:text-white cursor-pointer transition-opacity hover:opacity-80"
						onClick={(e) => {
							e.stopPropagation();
							performWink("right");
						}}
						onMouseEnter={() => {
							// More dramatic hover effect
							if (rightEyeRef.current)
								gsap.to(rightEyeRef.current, {
									attr: {
										ry: Math.max(
											3,
											latestEyeTargetsRef.current.ry + 6
										),
										rx: Math.max(
											4,
											latestEyeTargetsRef.current.rx + 3
										),
									},
									scale: 1.05,
									duration: 0.2,
									ease: "back.out(1.5)",
								});
						}}
						onMouseLeave={() => {
							if (rightEyeRef.current)
								gsap.to(rightEyeRef.current, {
									attr: {
										ry: latestEyeTargetsRef.current.ry,
										rx: latestEyeTargetsRef.current.rx,
									},
									scale: 1,
									duration: 0.25,
									ease: "power2.out",
								});
						}}
					/>

					{/* Mouth - Perfectly centered & symmetric (drawn in local space) */}
					<g ref={mouthGroupRef} transform="translate(260,175)">
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
								performMouthClick();
							}}
							onMouseEnter={() => {
								// Subtle hover wiggle
								if (mouthGroupRef.current) {
									gsap.to(mouthGroupRef.current, {
										scale: 1.05,
										rotation: `+=${gsap.utils.random(
											-2,
											2
										)}`,
										duration: 0.2,
										ease: "back.out(1.5)",
									});
								}
							}}
							onMouseLeave={() => {
								if (mouthGroupRef.current) {
									gsap.to(mouthGroupRef.current, {
										scale: 1,
										rotation: latestMouthRef.current.tilt,
										duration: 0.3,
										ease: "power2.out",
									});
								}
							}}
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

					{/* Voice Spectrum */}
					<g
						ref={spectrumGroupRef}
						opacity={0}
						transform="translate(260, 175)"
					>
						{Array.from({ length: 9 }).map((_, i) => (
							<rect
								key={i}
								x={-10}
								y={0}
								width={20}
								height={30}
								fill="currentColor"
								className="text-black dark:text-white"
							/>
						))}
					</g>
				</svg>
			</div>
		</div>
	);
}
