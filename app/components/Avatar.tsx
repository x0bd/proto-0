"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { Eyes } from "./face/Eyes";
import { Mouth } from "./face/Mouth";

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

	// Long press logic
	const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
	const isLongPressActiveRef = useRef(false);
	const deepEmotionTweenRef = useRef<gsap.core.Tween | null>(null);

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

	// Haptic helper
	const triggerHaptic = (pattern: number | number[]) => {
		if (typeof navigator !== "undefined" && navigator.vibrate) {
			navigator.vibrate(pattern);
		}
	};

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

	function performDeepEmotion() {
		isLongPressActiveRef.current = true;
		triggerHaptic(50); // Initial rumble start

		// Shake effect
		if (containerRef.current) {
			deepEmotionTweenRef.current = gsap.to(containerRef.current, {
				x: "+=2",
				y: "-=2",
				yoyo: true,
				repeat: -1,
				duration: 0.05,
				ease: "none",
			});
		}

		// Dilation effect
		const target = latestEyeTargetsRef.current;
		if (leftEyeRef.current && rightEyeRef.current) {
			gsap.to([leftEyeRef.current, rightEyeRef.current], {
				attr: {
					rx: target.rx + 8,
					ry: target.ry + 8,
				},
				scale: 1.15,
				duration: 0.4,
				ease: "back.out(1.5)",
			});
		}
	}

	function stopDeepEmotion() {
		if (deepEmotionTweenRef.current) {
			deepEmotionTweenRef.current.kill();
			deepEmotionTweenRef.current = null;
		}
		isLongPressActiveRef.current = false;

		// Reset shake
		if (containerRef.current) {
			gsap.to(containerRef.current, {
				x: 0,
				y: 0,
				duration: 0.2,
				ease: "power2.out",
			});
		}

		// Reset eyes
		const target = latestEyeTargetsRef.current;
		if (leftEyeRef.current && rightEyeRef.current) {
			gsap.to([leftEyeRef.current, rightEyeRef.current], {
				attr: {
					rx: target.rx,
					ry: target.ry,
				},
				scale: 1,
				duration: 0.3,
				ease: "power2.out",
			});
		}
	}

	function handleEyeHover(eye: "left" | "right") {
		const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
		if (eyeRef.current) {
			gsap.to(eyeRef.current, {
				attr: {
					ry: Math.max(3, latestEyeTargetsRef.current.ry + 6),
					rx: Math.max(4, latestEyeTargetsRef.current.rx + 3),
				},
				scale: 1.05,
				duration: 0.2,
				ease: "back.out(1.5)",
			});
		}
	}

	function handleEyeHoverEnd(eye: "left" | "right") {
		const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
		if (eyeRef.current) {
			gsap.to(eyeRef.current, {
				attr: {
					ry: latestEyeTargetsRef.current.ry,
					rx: latestEyeTargetsRef.current.rx,
				},
				scale: 1,
				duration: 0.25,
				ease: "power2.out",
			});
		}
	}

	function handleMouthHover() {
		if (mouthGroupRef.current) {
			gsap.to(mouthGroupRef.current, {
				scale: 1.05,
				rotation: `+=${gsap.utils.random(-2, 2)}`,
				duration: 0.2,
				ease: "back.out(1.5)",
			});
		}
	}

	function handleMouthHoverEnd() {
		if (mouthGroupRef.current) {
			gsap.to(mouthGroupRef.current, {
				scale: 1,
				rotation: latestMouthRef.current.tilt,
				duration: 0.3,
				ease: "power2.out",
			});
		}
	}

	function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
		// Start timer
		longPressTimerRef.current = setTimeout(() => {
			performDeepEmotion();
		}, 500);
	}

	function handlePointerUp(e: React.MouseEvent | React.TouchEvent) {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}

		if (isLongPressActiveRef.current) {
			stopDeepEmotion();
		} else {
			// It was a short tap -> Boop!
			performBoop();
		}
	}

	function handlePointerCancel() {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
		if (isLongPressActiveRef.current) {
			stopDeepEmotion();
		}
	}

	function animateEmotion(state: EmotionState) {
		// ... (No changes to logic, just skipping helper functions for brevity if untouched, but here we include full logic) ...
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
		const r = Math.hypot(nx, ny);

		// More dramatic eye follow with playful bounce
		const target = latestEyeTargetsRef.current;
		const eyeTiltDelta = nx * 12; // increased from 8
		const eyeYDelta = ny * 8; // increased from 6
		const eyeScale = 1 + Math.abs(nx) * 0.05; // subtle scale on extreme movements

		// Don't override scale if deep emotion is active
		if (!isLongPressActiveRef.current) {
			if (leftEyeRef.current) {
				const leftY = target.cy + eyeYDelta;
				gsap.to(leftEyeRef.current, {
					rotation: -target.tilt + -eyeTiltDelta,
					attr: { cy: leftY },
					scale: eyeScale,
					duration: 0.4, // Heavier inertia
					ease: "power3.out",
				});
			}
			if (rightEyeRef.current) {
				const rightY = target.cy + eyeYDelta;
				gsap.to(rightEyeRef.current, {
					rotation: target.tilt + eyeTiltDelta,
					attr: { cy: rightY },
					scale: eyeScale,
					duration: 0.4, // Heavier inertia
					ease: "power3.out",
				});
			}
		}

		// More expressive mouth tilt with overshoot
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt + nx * 10,
				duration: 0.45,
				ease: "power3.out",
			});

		// Enhanced container movement with head lean
		// Skip if shaking
		if (!isLongPressActiveRef.current) {
			// Collision/Repulsion logic: if cursor is too close to center, push face away
			const repulsionThreshold = 0.4; // normalized radius
			let repX = 0;
			let repY = 0;

			// r is already calculated as hypot(nx, ny)
			if (r < repulsionThreshold && r > 0) {
				// Stronger repulsion the closer you get
				const force = (1 - r / repulsionThreshold) * 25;
				repX = -nx * force;
				repY = -ny * force;
			}

			gsap.to(containerRef.current, {
				x: nx * 8 + repX,
				y: ny * 6 + repY,
				rotation: nx * 2, // head tilt
				duration: 0.5, // Increased for inertia
				ease: "power3.out", // Heavier feel (critically damped-ish)
			});
		}
	}

	function handlePointerLeave() {
		// Stop long press if user leaves area
		handlePointerCancel();

		// return to latest emotion-driven targets with gentle bounce
		const t = latestEyeTargetsRef.current;
		if (leftEyeRef.current)
			gsap.to(leftEyeRef.current, {
				rotation: -t.tilt,
				attr: { cy: t.cy },
				scale: 1,
				duration: 0.6,
				ease: "power3.out",
			});
		if (rightEyeRef.current)
			gsap.to(rightEyeRef.current, {
				rotation: t.tilt,
				attr: { cy: t.cy },
				scale: 1,
				duration: 0.6,
				ease: "power3.out",
			});
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt,
				duration: 0.6,
				ease: "power3.out",
			});
		if (containerRef.current)
			gsap.to(containerRef.current, {
				x: 0,
				y: 0,
				rotation: 0,
				duration: 1.2,
				ease: "elastic.out(1, 0.5)", // Gravity/Pendulum settle
			});
	}

	// Playful interactions
	function performWink(eye: "left" | "right") {
		triggerHaptic(10); // Light tick
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
		triggerHaptic([40, 50, 20]); // Double pulse
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
		triggerHaptic(15); // Sharp boop
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
		triggerHaptic(10); // Light tick
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
				onMouseDown={handlePointerDown}
				onMouseUp={handlePointerUp}
				onTouchStart={handlePointerDown}
				onTouchEnd={(e) => {
					handlePointerUp(e);
					handlePointerLeave();
				}}
				onTouchCancel={handlePointerCancel}
				// Remove onClick and onDoubleClick to prevent conflicts with custom handlers
				// We handle "boop" in handlePointerUp now
				// Double click logic for surprise is removed/superseded by long press or can be re-added if needed
			>
				<svg
					viewBox="0 0 520 280"
					className="relative w-full h-auto min-w-[280px] md:min-w-[auto] scale-[1.4] md:scale-100 origin-center"
				>
					<Eyes
						leftRef={leftEyeRef}
						rightRef={rightEyeRef}
						onWink={performWink}
						onHoverStart={handleEyeHover}
						onHoverEnd={handleEyeHoverEnd}
					/>

					<Mouth
						mouthRef={mouthRef}
						groupRef={mouthGroupRef}
						spectrumGroupRef={spectrumGroupRef}
						spectrumBarsRef={spectrumBarsRef}
						onClick={performMouthClick}
						onHoverStart={handleMouthHover}
						onHoverEnd={handleMouthHoverEnd}
					/>
				</svg>
			</div>
		</div>
	);
}
