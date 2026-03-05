"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

import { Eyes } from "./face/eyes/index";
import { Mouth } from "./face/Mouth";
import { Ears } from "./face/Ears";
import { FaceVariant } from "./face/types";
import { applyAgentTheme, VARIANT_COLORS } from "./face/themes";
import { EYE_GEOMETRIES } from "./face/eyes/config";
import type { AudioLevels } from "@/hooks/useAudioAnalysis";

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
	/** @deprecated Use audioLevels instead */
	voiceLevel?: number;
	/** Multi-band audio levels from useAudioAnalysis hook */
	audioLevels?: AudioLevels;
	variant?: FaceVariant;
	/** Custom accent color — overrides variant default */
	accentColor?: string;
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
	voiceLevel = 0,
	audioLevels,
	variant = "minimal",
	accentColor,
}: AvatarProps) {
	// Resolve display color: custom accent overrides variant default
	const displayColor = accentColor || VARIANT_COLORS[variant];
	// Helper for mouth geometry
	const generateMouthPath = (width: number, curve: number) => {
		const half = width / 2;

		switch (variant) {
			case "tron": {
				// Tron: Stepped angular path
				const y = curve / 2;
				return `M ${-half} 0 L ${-half / 2} 0 L ${-half / 2} ${y} L ${half / 2} ${y} L ${half / 2} 0 L ${half} 0`;
			}
			default:
				// Standard curve (minimal, analogue)
				return `M ${-half} 0 Q 0 ${curve} ${half} 0`;
		}
	};

	const containerRef = useRef<HTMLDivElement>(null);
	// Generic SVGElement refs to support Ellipse (Minimal) or Rect (Tron)
	const leftEyeRef = useRef<SVGElement>(null);
	const rightEyeRef = useRef<SVGElement>(null);
	// New: Pupil refs for tracking (agent variants only)
	const leftPupilRef = useRef<SVGGElement>(null);
	const rightPupilRef = useRef<SVGGElement>(null);
	// Extra refs for Myst (3 eyes)
	const topEyeRef = useRef<SVGElement>(null);
	const topPupilRef = useRef<SVGGElement>(null);
	// Pupil tracking state (normalized -1 to 1)
	const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
	// Is avatar currently "active" (speaking/listening)
	const [isActive, setIsActive] = useState(false);

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

	// Analogue specific refs
	const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
	const boilTickerRef = useRef<((time: number) => void) | null>(null);

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
			// Tron: sharper, shorter, more mechanical
			if (variant === "tron") {
				if (typeof pattern === "number") {
					navigator.vibrate(Math.min(pattern, 10));
				} else {
					navigator.vibrate(pattern.map((p) => Math.min(p, 10)));
				}
			} else {
				navigator.vibrate(pattern);
			}
		}
	};

	// Apply Agent Theme when variant or accent color changes
	useEffect(() => {
		applyAgentTheme(variant, accentColor);
	}, [variant, accentColor]);

	// Listen for audio activity/speech state
	useEffect(() => {
		if (audioLevels && audioLevels.overall > 0.1) {
			setIsActive(true);
		} else {
			const timeout = setTimeout(() => setIsActive(false), 500);
			return () => clearTimeout(timeout);
		}
	}, [audioLevels]);

	function startBreathing() {
		if (containerRef.current) {
			// Kill any existing breathing/glitch
			if (breathingTL.current) breathingTL.current.kill();

			if (variant === "tron") {
				// Glitch Idle: Random jumps instead of smooth breathing
				const glitchLoop = () => {
					// Random delay between glitches
					const delay = gsap.utils.random(0.5, 2.5);

					breathingTL.current = gsap.timeline({
						onComplete: glitchLoop,
					});

					// 1. Tiny position shift
					breathingTL.current
						.to(containerRef.current, {
							x: gsap.utils.random(-2, 2),
							y: gsap.utils.random(-2, 2),
							duration: 0, // instant
						})
						// 2. Hold
						.to(containerRef.current, {
							duration: 0.1,
						})
						// 3. Reset
						.to(containerRef.current, {
							x: 0,
							y: 0,
							duration: 0,
						})
						// 4. Wait
						.to(containerRef.current, {
							duration: delay,
						});
				};
				glitchLoop();
			} else if (variant === "analogue") {
				breathingTL.current = gsap.timeline({ repeat: -1, yoyo: true });
				breathingTL.current.to(containerRef.current, {
					rotation: 1,
					duration: 4,
					ease: "sine.inOut",
				});
			} else {
				// Standard Organic Breathing
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
	}

	// Voice Reactivity: Multi-band audio-driven animation
	useEffect(() => {
		if (!mouthRef.current) return;

		// Determine effective audio levels
		// Priority: audioLevels > voiceLevel (legacy fallback)
		const hasAudioLevels = audioLevels && audioLevels.overall > 0.01;
		const hasVoiceLevel = voiceEnabled && voiceLevel > 0.01;
		const isSpeaking = hasAudioLevels || hasVoiceLevel;

		if (!isSpeaking) return; // Let emotion-driven animation take over

		const base = latestMouthRef.current;

		// Calculate target values from audio bands
		let targetCurve = base.curve;
		let targetWidth = base.width;
		let mouthJitter = 0;

		if (hasAudioLevels) {
			// Multi-band mouth modulation
			const { bass, lowMid, mid, highMid } = audioLevels;

			// Primary opening from low-mid (vowels, speech fundamentals)
			targetCurve += lowMid * 55 + bass * 15;

			// Width variation from mid (consonants, formants)
			targetWidth += mid * 12 - lowMid * 8;

			// Subtle rotation jitter from high-mid (adds organic feel)
			mouthJitter = (highMid - 0.3) * 3;
		} else {
			// Legacy fallback: simple voiceLevel modulation
			targetCurve += voiceLevel * 60;
		}

		const pathData = generateMouthPath(targetWidth, targetCurve);

		// Fast tween for responsiveness
		gsap.to(mouthRef.current, {
			attr: { d: pathData },
			duration: 0.04,
			ease: "none",
			overwrite: "auto",
		});

		// Apply jitter to mouth group if we have multi-band data
		if (
			mouthGroupRef.current &&
			hasAudioLevels &&
			Math.abs(mouthJitter) > 0.1
		) {
			gsap.to(mouthGroupRef.current, {
				rotation: base.tilt + mouthJitter,
				duration: 0.06,
				ease: "none",
				overwrite: "auto",
			});
		}
	}, [voiceLevel, voiceEnabled, audioLevels, generateMouthPath]);

	// Eye Reactivity: Subtle pulse from bass, micro-glances from presence
	useEffect(() => {
		if (!audioLevels || audioLevels.overall < 0.05) return;
		if (!leftEyeRef.current || !rightEyeRef.current) return;

		const { bass, highMid, presence } = audioLevels;
		const target = latestEyeTargetsRef.current;

		// Subtle scale pulse from bass (0.98 - 1.02 range)
		const scalePulse = 1 + (bass - 0.3) * 0.03;

		// Very subtle vertical movement from high frequencies
		const yPulse = highMid * 1.5;

		// Apply to both eyes
		[
			{ ref: leftEyeRef, cx: 200, tiltSign: -1 },
			{ ref: rightEyeRef, cx: 320, tiltSign: 1 },
		].forEach(({ ref, cx, tiltSign }) => {
			if (!ref.current) return;

			animateEye(
				ref.current,
				{
					rx: target.rx,
					ry: target.ry,
					cy: target.cy - yPulse,
					tilt: target.tilt * tiltSign,
					scale: scalePulse,
				},
				0.05,
				"none",
				0,
				cx,
			);
		});

		// Trigger micro-glance on presence spikes (randomly)
		if (presence > 0.6 && Math.random() < 0.02) {
			performGlance();
		}
	}, [audioLevels]);

	// Container Reactivity: Bass-modulated breathing depth
	useEffect(() => {
		if (!audioLevels || !containerRef.current) return;
		if (audioLevels.overall < 0.1) return;

		const { bass } = audioLevels;

		// Subtle scale modulation from bass
		const scaleOffset = bass * 0.008;

		gsap.to(containerRef.current, {
			scale: 1 + scaleOffset,
			duration: 0.08,
			ease: "none",
			overwrite: "auto",
		});
	}, [audioLevels]);

	// Animation Helper to bridge Ellipse (Minimal) vs Rect (Tron) geometry
	// Animation Helper to bridge different eye geometries
	function animateEye(
		target: SVGElement | null,
		params: {
			rx: number;
			ry: number;
			cy: number;
			tilt?: number; // rotation
			scale?: number;
			xOffset?: number; // Additional x offset (for looking around)
		},
		duration: number,
		ease: string = "power2.out",
		delay: number = 0,
		cxOrigin: number, // Legacy param, still useful for some logic
	) {
		if (!target) return;

		const { rx, ry, cy, tilt = 0, scale = 1, xOffset = 0 } = params;

		// Determine easing
		let finalEase = ease;
		if (variant === "tron" && ease.startsWith("power")) {
			finalEase = "steps(5)";
		} else if (variant === "analogue" && ease.startsWith("power")) {
			finalEase = "steps(12)";
		}

		const tagName = target.tagName.toLowerCase();

		if (tagName === "rect") {
			// Tron uses <rect>
			gsap.to(target, {
				attr: {
					width: rx * 2,
					height: ry * 2,
					x: cxOrigin - rx + xOffset,
					y: cy - ry,
					rx: 4,
					ry: 4,
				},
				rotation: tilt,
				scale: scale,
				duration: duration,
				ease: finalEase,
				delay: delay,
				transformOrigin: "center center",
			});
		} else if (tagName === "path") {
			// Flux uses <path> (Triangle)
			// Calculate deltaY from the variant's base cy
			// We need to look up the base Cy for this variant to know how much to translate
			const geom = EYE_GEOMETRIES[variant] || EYE_GEOMETRIES["minimal"];
			// Assuming left/right/top distinction can be inferred or we just use leftCy as approx base for vertical movement
			// If we really need precision, we'd need to know WHICH eye this is.
			// Currently animateEye doesn't know.
			// But usually eyes move together vertically.
			// Let's use leftCy as the "zero" point.
			const baseCy = geom?.leftCy ?? 105;

			const deltaY = cy - baseCy;
			const deltaX = xOffset || 0; // xOffset is usually 0 unless glancing

			gsap.to(target, {
				y: deltaY,
				x: deltaX,
				rotation: tilt,
				scale: scale,
				duration: duration,
				ease: finalEase,
				delay: delay,
				transformOrigin: "center center",
			});
		} else if (tagName === "circle") {
			// Echo, Myst use <circle>
			const r = (rx + ry) / 2;

			gsap.to(target, {
				attr: {
					r: r,
					cy: cy,
					cx: cxOrigin + xOffset,
				},
				rotation: tilt,
				scale: scale,
				duration: duration,
				ease: finalEase,
				delay: delay,
				transformOrigin: "center center",
			});
		} else {
			// Default <ellipse> (Minimal, Analogue)
			gsap.to(target, {
				attr: {
					rx: rx,
					ry: ry,
					cy: cy,
					// cx is static on element, we only animate if cx needs to change (glance)
					// xOffset handles additional shift
					cx: cxOrigin + xOffset,
				},
				rotation: tilt,
				scale: scale,
				duration: duration,
				ease: finalEase,
				delay: delay,
				transformOrigin: "center center",
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
		// Reuse animateEye logic or manual? animateEye is cleaner but we need to handle both arrays.
		// For simplicity/performance in this specific effect, we might inline logic or loop.

		[leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
			const cx = i === 0 ? 200 : 320;
			// We want to scale UP 1.15 and increase dimensions
			// animateEye handles "scale" prop.
			animateEye(
				eye,
				{
					rx: target.rx + 8,
					ry: target.ry + 8,
					cy: 105, // Approximation, assuming deep emotion centers eyes
					scale: 1.15,
				},
				0.4,
				"back.out(1.5)",
				0,
				cx,
			);
		});
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

		[leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
			const cx = i === 0 ? 200 : 320;
			animateEye(
				eye,
				{
					rx: target.rx,
					ry: target.ry,
					cy: target.cy, // Use stored cy
					scale: 1,
				},
				0.3,
				"power2.out",
				0,
				cx,
			);
		});
	}

	function handleEyeHover(eye: "left" | "right" | "top") {
		if (eye === "top") {
			if (topEyeRef.current) {
				animateEye(
					topEyeRef.current,
					{ ...latestEyeTargetsRef.current, scale: 1.1 },
					0.2,
					"back.out(1.5)",
					0,
					260,
				);
			}
			return;
		}
		const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
		const cx = eye === "left" ? 200 : 320;
		const target = latestEyeTargetsRef.current;

		animateEye(
			eyeRef.current,
			{
				rx: Math.max(4, target.rx + 3),
				ry: Math.max(3, target.ry + 6),
				cy: target.cy,
				scale: 1.05,
				tilt: eye === "left" ? -target.tilt : target.tilt,
			},
			0.2,
			"back.out(1.5)",
			0,
			cx,
		);
	}

	function handleEyeHoverEnd(eye: "left" | "right" | "top") {
		if (eye === "top") {
			if (topEyeRef.current) {
				animateEye(
					topEyeRef.current,
					{ ...latestEyeTargetsRef.current, scale: 1 },
					0.25,
					"power2.out",
					0,
					260,
				);
			}
			return;
		}
		const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
		const cx = eye === "left" ? 200 : 320;
		const target = latestEyeTargetsRef.current;

		animateEye(
			eyeRef.current,
			{
				rx: target.rx,
				ry: target.ry,
				cy: target.cy,
				scale: 1,
				tilt: eye === "left" ? -target.tilt : target.tilt,
			},
			0.25,
			"power2.out",
			0,
			cx,
		);
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
		animateEye(
			leftEyeRef.current,
			{
				rx: Math.max(4, eyeWidth),
				ry: Math.max(2, eyeHeight),
				cy: 105 + eyeY,
				tilt: -eyeTilt,
			},
			0.75,
			"power2.out",
			0,
			200,
		);

		// Animate right eye with slight delay
		animateEye(
			rightEyeRef.current,
			{
				rx: Math.max(4, eyeWidth),
				ry: Math.max(2, eyeHeight),
				cy: 105 + eyeY,
				tilt: eyeTilt,
			},
			0.75,
			"power2.out",
			stagger,
			320,
		);

		// Save latest eye targets for idle (blink/glance)
		latestEyeTargetsRef.current = {
			rx: Math.max(4, eyeWidth),
			ry: Math.max(2, eyeHeight),
			cy: 105 + eyeY,
			tilt: eyeTilt,
		};

		// Animate mouth with perfect facial symmetry (drawn around local origin)
		if (mouthRef.current) {
			const pathData = generateMouthPath(mouthWidth, mouthCurve);
			gsap.to(mouthRef.current, {
				attr: { d: pathData },
				duration: 0.8,
				ease: "power2.out",
				delay: stagger * 2,
			});
		}

		// Rotate the mouth group strictly around the face center
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

		const blinkDur = variant === "tron" ? 0.05 : 0.08;
		const ryClosed = variant === "tron" ? 0.5 : 2;

		// Close eyes
		[leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
			const cx = i === 0 ? 200 : 320;
			animateEye(
				eye,
				{
					rx: target.rx,
					ry: ryClosed,
					cy: target.cy,
					tilt: i === 0 ? -target.tilt : target.tilt,
				},
				blinkDur,
				variant === "tron" ? "steps(2)" : "power1.in",
				0,
				cx,
			);
		});

		// Reopen eyes (delayed)
		const reopenDelay = blinkDur + (variant === "tron" ? 0.05 : 0);
		[leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
			const cx = i === 0 ? 200 : 320;
			animateEye(
				eye,
				{
					rx: target.rx,
					ry: target.ry,
					cy: target.cy,
					tilt: i === 0 ? -target.tilt : target.tilt,
				},
				0.12,
				variant === "tron" ? "steps(3)" : "power2.out",
				reopenDelay,
				cx,
			);
		});
	}

	function performGlance() {
		const deltaTilt = gsap.utils.random(-2, 2);
		const deltaY = gsap.utils.random(-1.5, 1.5);

		// For glance, we need yoyo. animateEye doesn't support yoyo/repeat easily.
		// But glance is subtle x/y/rotation.
		// If variant==tron, "attr: { cy }" mapping to "y" matters.
		// Let's manually handle glance logic branching since it uses yoyo/repeat.

		const eyes = [
			{ ref: leftEyeRef, cx: 200, baseRot: 0 }, // baseRot ignored as we do relative
			{ ref: rightEyeRef, cx: 320, baseRot: 0 },
		];

		eyes.forEach(({ ref, cx }, i) => {
			if (!ref.current) return;
			const rotationDelta = i === 0 ? deltaTilt : -deltaTilt;

			if (variant === "tron") {
				gsap.to(ref.current, {
					rotation: `+=${rotationDelta}`,
					attr: { y: `+=${deltaY}` }, // y is top-edge, moving it works
					duration: 0.1, // Faster glance
					yoyo: true,
					repeat: 1,
					ease: "steps(3)",
				});
			} else {
				gsap.to(ref.current, {
					rotation: `+=${rotationDelta}`,
					attr: { cy: `+=${deltaY}` },
					duration: 0.35,
					yoyo: true,
					repeat: 1,
					ease: "sine.inOut",
				});
			}
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
				const controlYLocal = m.curve + state.offset;
				const d = generateMouthPath(m.width, controlYLocal);
				if (mouthRef.current)
					gsap.set(mouthRef.current, { attr: { d } });
			},
		});
	}

	// Enhanced cursor/touch tracking with playful movements
	function handlePointerMove(
		e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
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
			// Standard eyes
			const leftY = target.cy + eyeYDelta;
			const rightY = target.cy + eyeYDelta;

			animateEye(
				leftEyeRef.current,
				{
					rx: target.rx,
					ry: target.ry,
					cy: leftY,
					tilt: -target.tilt - eyeTiltDelta,
					scale: eyeScale,
				},
				0.4,
				"power3.out",
				0,
				200,
			);

			animateEye(
				rightEyeRef.current,
				{
					rx: target.rx,
					ry: target.ry,
					cy: rightY,
					tilt: target.tilt + eyeTiltDelta,
					scale: eyeScale,
				},
				0.4,
				"power3.out",
				0,
				320,
			);
		}

		// Mouth tilt with pointer follow
		if (mouthGroupRef.current) {
			const pointerTilt = nx * 10;
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt + pointerTilt,
				duration: 0.45,
				ease: "power3.out",
			});
		}

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

		animateEye(
			leftEyeRef.current,
			{
				rx: t.rx,
				ry: t.ry,
				cy: t.cy,
				tilt: -t.tilt,
				scale: 1,
			},
			0.6,
			"power3.out",
			0,
			200,
		);

		animateEye(
			rightEyeRef.current,
			{
				rx: t.rx,
				ry: t.ry,
				cy: t.cy,
				tilt: t.tilt,
				scale: 1,
			},
			0.6,
			"power3.out",
			0,
			320,
		);

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
	function performWink(eye: "left" | "right" | "top") {
		triggerHaptic(10); // Light tick

		if (eye === "top") {
			// Basic blink for top eye if it exists
			if (topEyeRef.current) {
				const target = latestEyeTargetsRef.current;
				animateEye(
					topEyeRef.current,
					{ ...target, scale: 0.1 },
					0.1,
					"power2.in",
					0,
					260,
				);
				animateEye(
					topEyeRef.current,
					{ ...target, scale: 1 },
					0.15,
					"back.out(2)",
					0.1,
					260,
				);
			}
			return;
		}

		const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
		const target = latestEyeTargetsRef.current;
		const cx = eye === "left" ? 200 : 320;

		// We need sequence. animateEye doesn't return tween (yet), so we chain via delay or callbacks.
		// Simple delay approach:

		// Close
		animateEye(
			eyeRef.current,
			{
				rx: target.rx, // width usually stays same for wink or maybe stretches?
				ry: 2, // closed
				cy: target.cy,
				tilt: eye === "left" ? -target.tilt : target.tilt,
				scale: 0.7, // squeeze horizontally? No, scaleX/Y
			},
			0.1,
			variant === "tron" ? "steps(2)" : "power2.in",
			0,
			cx,
		);
		// Note: scale: 0.7 passed to animateEye applies to both X and Y if number.
		// Original code had scaleX: 0.7. animateEye takes `scale` as number.
		// To match exactly, we'd need scaleX support in animateEye.
		// For now, uniform scale 0.9 is fine, or we can improve animateEye later.

		// Open
		animateEye(
			eyeRef.current,
			{
				rx: target.rx,
				ry: target.ry,
				cy: target.cy,
				tilt: eye === "left" ? -target.tilt : target.tilt,
				scale: 1,
			},
			0.15,
			variant === "tron" ? "steps(3)" : "back.out(2)",
			0.1, // delay
			cx,
		);
	}

	function performSurprise() {
		triggerHaptic([40, 50, 20]); // Double pulse
		const target = latestEyeTargetsRef.current;

		// Eyes wide with bounce
		const eyesToAnimate: Array<{ ref: SVGElement | null; cx: number }> = [
			{ ref: leftEyeRef.current, cx: 200 },
			{ ref: rightEyeRef.current, cx: 320 },
		];

		eyesToAnimate.forEach(({ ref, cx }) => {
			if (!ref) return;
			// Expand
			animateEye(
				ref,
				{
					rx: target.rx + 15,
					ry: target.ry + 10,
					cy: target.cy,
					scale: 1.1,
				},
				0.2,
				"back.out(2)",
				0,
				cx,
			);

			// Return
			animateEye(
				ref,
				{
					rx: target.rx,
					ry: target.ry,
					cy: target.cy,
					scale: 1,
				},
				0.3,
				"elastic.out(1, 0.5)",
				0.2, // delay
				cx,
			);
		});

		// Mouth opens in surprise
		if (mouthRef.current && mouthGroupRef.current) {
			const m = latestMouthRef.current;
			const surpriseD = generateMouthPath(m.width + 20, 15);
			gsap.timeline()
				.to(
					mouthRef.current,
					{
						attr: { d: surpriseD },
						duration: 0.2,
						ease: "back.out(2)",
					},
					0,
				)
				.to(
					mouthRef.current,
					{
						attr: {
							d: generateMouthPath(m.width, m.curve),
						},
						duration: 0.4,
						ease: "power2.out",
					},
					0.5,
				);

			// Tilt entire mouth slightly up
			gsap.to(mouthGroupRef.current, {
				y: -5,
				duration: 0.2,
				yoyo: true,
				repeat: 1,
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
			const smileD = generateMouthPath(m.width, m.curve - 20);

			gsap.timeline()
				.to(mouthRef.current, {
					attr: { d: smileD },
					duration: 0.15,
					ease: "back.out(2)",
				})
				.to(mouthRef.current, {
					attr: { d: generateMouthPath(m.width, m.curve) },
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

		// Ensure spectrum bars are always hidden
		if (spectrumGroupRef.current) {
			gsap.set(spectrumGroupRef.current, { opacity: 0 });
		}

		// Analogue Line Boil Loop
		if (variant === "analogue") {
			const boilTicker = () => {
				// Update turbulence seed every few frames (12fps approx)
				if (turbulenceRef.current) {
					// Just randomize baseFrequency slightly or seed if supported
					// feTurbulence doesn't have a simple 'seed' attr we can animate easily without re-render in React usually,
					// but we can manipulate DOM directly.
					// Actually 'seed' is an attribute.
					const newSeed = Math.floor(Math.random() * 100);
					turbulenceRef.current.setAttribute(
						"seed",
						newSeed.toString(),
					);
				}
			};
			// Run at reduced rate?
			// GSAP ticker runs at raf. We can throttle.
			let frameCount = 0;
			const throttledTicker = () => {
				frameCount++;
				if (frameCount % 5 === 0) {
					// ~12fps
					boilTicker();
				}
			};
			boilTickerRef.current = throttledTicker;
			gsap.ticker.add(throttledTicker);
		}

		return () => {
			breathingTL.current?.kill();
			blinkTimerRef.current?.kill();
			glanceTimerRef.current?.kill();
			idleMouthTweenRef.current?.kill();
			if (boilTickerRef.current) {
				gsap.ticker.remove(boilTickerRef.current);
				boilTickerRef.current = null;
			}
		};
	}, [variant]);

	useEffect(() => {
		animateEmotion(emotion);
	}, [emotion]);

	// Voice simulation setup / teardown (no mic)
	useEffect(() => {
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
				const d = generateMouthPath(m.width, m.curve);
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
			const controlYLocal = m.curve + simAmpRef.current;
			const d = generateMouthPath(m.width, controlYLocal);
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
	}, [voiceEnabled, variant]);

	return (
		<div className={`flex items-center justify-center w-full ${className}`}>
			<div
				ref={containerRef}
				className="relative group cursor-pointer w-full"
				style={{ color: displayColor }}
				onMouseMove={handlePointerMove}
				onMouseLeave={handlePointerLeave}
				onMouseDown={handlePointerDown}
				onMouseUp={handlePointerUp}
				onTouchStart={handlePointerDown}
				onTouchEnd={handlePointerUp}
				onTouchCancel={handlePointerCancel}
				onTouchMove={handlePointerMove}
			>
				<svg
					ref={svgBoxRef}
					viewBox="80 26 360 250"
					className="w-full h-auto overflow-visible"
					style={{
						// Ensure touch actions don't scroll page while interacting
						touchAction: "none",
					}}
				>
					{/* Definitions for Filters */}
					<defs>
						{variant === "analogue" && (
							<filter id="pencil">
								<feTurbulence
									ref={turbulenceRef}
									type="fractalNoise"
									baseFrequency="0.03"
									numOctaves="3"
									seed="0"
									result="noise"
								/>
								<feDisplacementMap
									in="SourceGraphic"
									in2="noise"
									scale="3"
									xChannelSelector="R"
									yChannelSelector="G"
								/>
							</filter>
						)}
					</defs>

					<Ears variant={variant} emotion={emotion} />
					<Eyes
						variant={variant}
						leftRef={leftEyeRef}
						rightRef={rightEyeRef}
						leftPupilRef={leftPupilRef}
						rightPupilRef={rightPupilRef}
						topRef={topEyeRef}
						topPupilRef={topPupilRef}
						pupilOffset={pupilOffset}
						isActive={isActive}
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
						variant={variant}
					/>
				</svg>
			</div>
		</div>
	);
}
