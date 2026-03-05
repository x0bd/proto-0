import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useCallback,
} from "react";
import { gsap } from "gsap";

import { Eyes } from "./face/eyes/index";
import { Mouth } from "./face/Mouth";
import { Ears } from "./face/Ears";
import type { EmotionState } from "./face/types";
import { applyAgentTheme, VARIANT_COLORS } from "./face/themes";
import { EYE_GEOMETRIES } from "./face/eyes/config";
import type { AudioLevels } from "./hooks/useAudioAnalysis";
import type { AvatarHandle, AvatarProps } from "./types";

export type { AvatarHandle, AvatarProps };

const DEFAULT_EMOTION: EmotionState = {
	joy: 0.3,
	sadness: 0,
	surprise: 0.1,
	anger: 0,
	curiosity: 0.2,
};

/**
 * @dot/avatar — animated SVG face with multi-variant geometry, emotion
 * expressions, audio reactivity, and pointer interactions.
 *
 * Wrap in `"use client"` in Next.js / RSC environments.
 */
export const Avatar = forwardRef<AvatarHandle, AvatarProps>(function Avatar(
	{
		emotion = DEFAULT_EMOTION,
		className = "",
		speaking = false,
		voiceLevel = 0,
		audioLevels,
		variant = "minimal",
		color,
		// backward-compat alias
		accentColor,
		size = 260,
		interactive = true,
		onEyeClick,
		onMouthClick,
		onLongPress,
		onStateChange,
		interactions,
	},
	ref,
) {
	// Resolve display color
	const displayColor = color ?? accentColor ?? VARIANT_COLORS[variant];

	// ── Mouth path helper ──────────────────────────────────────────────────
	const generateMouthPath = useCallback(
		(width: number, curve: number): string => {
			const half = width / 2;
			switch (variant) {
				case "tron": {
					const y = curve / 2;
					return `M ${-half} 0 L ${-half / 2} 0 L ${-half / 2} ${y} L ${half / 2} ${y} L ${half / 2} 0 L ${half} 0`;
				}
				default:
					return `M ${-half} 0 Q 0 ${curve} ${half} 0`;
			}
		},
		[variant],
	);

	// ── Refs ───────────────────────────────────────────────────────────────
	const containerRef = useRef<HTMLDivElement>(null);
	const leftEyeRef = useRef<SVGElement>(null);
	const rightEyeRef = useRef<SVGElement>(null);
	const topEyeRef = useRef<SVGElement>(null);
	const mouthRef = useRef<SVGPathElement>(null);
	const mouthGroupRef = useRef<SVGGElement>(null);
	const svgBoxRef = useRef<SVGSVGElement | null>(null);
	const spectrumGroupRef = useRef<SVGGElement>(null);
	const spectrumBarsRef = useRef<SVGRectElement[]>([]);
	const breathingTL = useRef<gsap.core.Timeline>();
	const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
	const boilTickerRef = useRef<((time: number) => void) | null>(null);
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const isLongPressActiveRef = useRef(false);
	const deepEmotionTweenRef = useRef<gsap.core.Tween | null>(null);
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

	// ── Haptic helper ──────────────────────────────────────────────────────
	function triggerHaptic(pattern: number | number[]) {
		if (typeof navigator !== "undefined" && navigator.vibrate) {
			navigator.vibrate(pattern);
		}
	}

	// ── Breathing animation ────────────────────────────────────────────────
	function startBreathing() {
		breathingTL.current?.kill();
		breathingTL.current = gsap.timeline({ repeat: -1 });

		if (variant === "tron") {
			breathingTL.current.to(containerRef.current, {
				filter: "brightness(1.03) contrast(1.01)",
				duration: 1.8,
				yoyo: true,
				repeat: -1,
				ease: "steps(4)",
			});
		} else if (variant === "analogue") {
			if (turbulenceRef.current) {
				const ticker = (time: number) => {
					if (!turbulenceRef.current) return;
					const freq = 0.015 + Math.sin(time * 0.5) * 0.005;
					turbulenceRef.current.setAttribute(
						"baseFrequency",
						`${freq} ${freq * 1.5}`,
					);
				};
				boilTickerRef.current = ticker;
				gsap.ticker.add(ticker);
			}

			breathingTL.current
				.to(containerRef.current, {
					scale: 1.012,
					rotation: 0.3,
					duration: 3.2,
					ease: "sine.inOut",
				})
				.to(containerRef.current, {
					scale: 1,
					rotation: 0,
					duration: 3.5,
					ease: "sine.inOut",
				});
		} else {
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

	// ── Eye animation helper ───────────────────────────────────────────────
	function animateEye(
		target: SVGElement | null,
		params: {
			rx: number;
			ry: number;
			cy: number;
			tilt?: number;
			scale?: number;
			xOffset?: number;
		},
		duration: number,
		ease = "power2.out",
		delay = 0,
		cxOrigin: number,
	) {
		if (!target) return;

		const { rx, ry, cy, tilt = 0, scale = 1, xOffset = 0 } = params;

		let finalEase = ease;
		if (variant === "tron" && ease.startsWith("power"))
			finalEase = "steps(5)";
		else if (variant === "analogue" && ease.startsWith("power"))
			finalEase = "steps(12)";

		const tag = target.tagName.toLowerCase();

		if (tag === "rect") {
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
				scale,
				duration,
				ease: finalEase,
				delay,
				transformOrigin: "center center",
			});
		} else if (tag === "path") {
			const geom = EYE_GEOMETRIES[variant] ?? EYE_GEOMETRIES["minimal"];
			const baseCy = geom?.leftCy ?? 105;
			gsap.to(target, {
				y: cy - baseCy,
				x: xOffset,
				rotation: tilt,
				scale,
				duration,
				ease: finalEase,
				delay,
				transformOrigin: "center center",
			});
		} else if (tag === "circle") {
			const r = (rx + ry) / 2;
			gsap.to(target, {
				attr: { r, cy, cx: cxOrigin + xOffset },
				rotation: tilt,
				scale,
				duration,
				ease: finalEase,
				delay,
				transformOrigin: "center center",
			});
		} else {
			gsap.to(target, {
				attr: { rx, ry, cy, cx: cxOrigin + xOffset },
				rotation: tilt,
				scale,
				duration,
				ease: finalEase,
				delay,
				transformOrigin: "center center",
			});
		}
	}

	// ── Emotion animation ──────────────────────────────────────────────────
	function animateEmotion(state: EmotionState) {
		const { joy, sadness, surprise, anger, curiosity } = state;
		const alertness = surprise + curiosity * 0.7 + joy * 0.3;
		const intensity = Math.max(joy, sadness, surprise, anger, curiosity);

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

		const mouthCurve =
			35 * Math.sin(joy * Math.PI * 0.8) -
			45 * Math.pow(sadness, 1.2) -
			25 * Math.pow(anger, 0.8);
		const mouthTilt =
			curiosity * 10 - anger * 8 + Math.sin(curiosity * Math.PI) * 4;
		const mouthWidth =
			65 + surprise * 25 - sadness * 20 - anger * 15 + alertness * 8;

		const stagger = 0.08;

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

		latestEyeTargetsRef.current = {
			rx: Math.max(4, eyeWidth),
			ry: Math.max(2, eyeHeight),
			cy: 105 + eyeY,
			tilt: eyeTilt,
		};

		if (mouthRef.current) {
			gsap.to(mouthRef.current, {
				attr: { d: generateMouthPath(mouthWidth, mouthCurve) },
				duration: 0.8,
				ease: "power2.out",
				delay: stagger * 2,
			});
		}

		if (mouthGroupRef.current) {
			gsap.to(mouthGroupRef.current, {
				rotation: mouthTilt,
				duration: 0.8,
				ease: "power2.out",
				svgOrigin: "260 175",
				delay: stagger * 2,
			});
		}

		latestMouthRef.current = {
			width: mouthWidth,
			curve: mouthCurve,
			tilt: mouthTilt,
		};
	}

	// ── Blink ──────────────────────────────────────────────────────────────
	function performBlink() {
		const target = latestEyeTargetsRef.current;
		const blinkDur = variant === "tron" ? 0.05 : 0.08;
		const ryClosed = variant === "tron" ? 0.5 : 2;

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

	// ── Glance ─────────────────────────────────────────────────────────────
	function performGlance() {
		const deltaTilt = gsap.utils.random(-2, 2);
		const deltaY = gsap.utils.random(-1.5, 1.5);

		[leftEyeRef, rightEyeRef].forEach(({ current }, i) => {
			if (!current) return;
			const rotationDelta = i === 0 ? deltaTilt : -deltaTilt;

			if (variant === "tron") {
				gsap.to(current, {
					rotation: `+=${rotationDelta}`,
					attr: { y: `+=${deltaY}` },
					duration: 0.1,
					yoyo: true,
					repeat: 1,
					ease: "steps(3)",
				});
			} else {
				gsap.to(current, {
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

	// ── Idle mouth wave ────────────────────────────────────────────────────
	function startIdleMouthWave() {
		const state = { offset: 0 };
		idleMouthTweenRef.current = gsap.to(state, {
			offset: 4,
			duration: 2.2,
			repeat: -1,
			yoyo: true,
			ease: "sine.inOut",
			onUpdate: () => {
				const m = latestMouthRef.current;
				const d = generateMouthPath(m.width, m.curve + state.offset);
				if (mouthRef.current)
					gsap.set(mouthRef.current, { attr: { d } });
			},
		});
	}

	// ── Wink ───────────────────────────────────────────────────────────────
	function performWink(eye: "left" | "right" | "top") {
		triggerHaptic(10);

		if (eye === "top") {
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

		onEyeClick?.(eye);
		const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
		const target = latestEyeTargetsRef.current;
		const cx = eye === "left" ? 200 : 320;

		animateEye(
			eyeRef.current,
			{
				rx: target.rx,
				ry: 2,
				cy: target.cy,
				tilt: eye === "left" ? -target.tilt : target.tilt,
				scale: 0.7,
			},
			0.1,
			variant === "tron" ? "steps(2)" : "power2.in",
			0,
			cx,
		);
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
			0.1,
			cx,
		);
	}

	// ── Surprise ───────────────────────────────────────────────────────────
	function performSurprise() {
		triggerHaptic([40, 50, 20]);
		const target = latestEyeTargetsRef.current;

		[leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
			const cx = i === 0 ? 200 : 320;
			if (!eye) return;
			animateEye(
				eye,
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
			animateEye(
				eye,
				{ rx: target.rx, ry: target.ry, cy: target.cy, scale: 1 },
				0.3,
				"elastic.out(1, 0.5)",
				0.2,
				cx,
			);
		});

		if (mouthRef.current && mouthGroupRef.current) {
			const m = latestMouthRef.current;
			gsap.timeline()
				.to(
					mouthRef.current,
					{
						attr: { d: generateMouthPath(m.width + 20, 15) },
						duration: 0.2,
						ease: "back.out(2)",
					},
					0,
				)
				.to(
					mouthRef.current,
					{
						attr: { d: generateMouthPath(m.width, m.curve) },
						duration: 0.4,
						ease: "power2.out",
					},
					0.5,
				);
			gsap.to(mouthGroupRef.current, {
				y: -5,
				duration: 0.2,
				yoyo: true,
				repeat: 1,
			});
		}
	}

	// ── Boop ───────────────────────────────────────────────────────────────
	function performBoop() {
		triggerHaptic(15);
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
					ease: "elastic.out(1, 0.4)",
				});
		}
	}

	// ── Deep emotion (long press) ──────────────────────────────────────────
	function performDeepEmotion() {
		isLongPressActiveRef.current = true;
		triggerHaptic(50);
		onLongPress?.();

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

		const target = latestEyeTargetsRef.current;
		[leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
			const cx = i === 0 ? 200 : 320;
			animateEye(
				eye,
				{ rx: target.rx + 8, ry: target.ry + 8, cy: 105, scale: 1.15 },
				0.4,
				"back.out(1.5)",
				0,
				cx,
			);
		});
	}

	function stopDeepEmotion() {
		deepEmotionTweenRef.current?.kill();
		deepEmotionTweenRef.current = null;
		isLongPressActiveRef.current = false;

		if (containerRef.current) {
			gsap.to(containerRef.current, {
				x: 0,
				y: 0,
				duration: 0.2,
				ease: "power2.out",
			});
		}

		const target = latestEyeTargetsRef.current;
		[leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
			const cx = i === 0 ? 200 : 320;
			animateEye(
				eye,
				{ rx: target.rx, ry: target.ry, cy: target.cy, scale: 1 },
				0.3,
				"power2.out",
				0,
				cx,
			);
		});
	}

	// ── Eye hover ─────────────────────────────────────────────────────────
	function handleEyeHover(eye: "left" | "right" | "top") {
		if (eye === "top") {
			if (topEyeRef.current)
				animateEye(
					topEyeRef.current,
					{ ...latestEyeTargetsRef.current, scale: 1.1 },
					0.2,
					"back.out(1.5)",
					0,
					260,
				);
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
			if (topEyeRef.current)
				animateEye(
					topEyeRef.current,
					{ ...latestEyeTargetsRef.current, scale: 1 },
					0.25,
					"power2.out",
					0,
					260,
				);
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

	// ── Mouth hover ───────────────────────────────────────────────────────
	function handleMouthHover() {
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				scale: 1.05,
				rotation: `+=${gsap.utils.random(-2, 2)}`,
				duration: 0.2,
				ease: "back.out(1.5)",
			});
	}

	function handleMouthHoverEnd() {
		if (mouthGroupRef.current)
			gsap.to(mouthGroupRef.current, {
				scale: 1,
				rotation: latestMouthRef.current.tilt,
				duration: 0.3,
				ease: "power2.out",
			});
	}

	// ── Pointer interactions ───────────────────────────────────────────────
	function handlePointerDown() {
		if (!interactive) return;
		longPressTimerRef.current = setTimeout(() => performDeepEmotion(), 500);
	}

	function handlePointerUp() {
		if (!interactive) return;
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
		if (isLongPressActiveRef.current) {
			stopDeepEmotion();
		} else {
			performBoop();
		}
	}

	function handlePointerCancel() {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
		if (isLongPressActiveRef.current) stopDeepEmotion();
	}

	function handlePointerMove(
		e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
	) {
		if (!interactive || !containerRef.current) return;

		if (!svgBoxRef.current) {
			const el = containerRef.current.querySelector("svg");
			svgBoxRef.current = (el as SVGSVGElement) ?? null;
		}
		const svgEl = svgBoxRef.current;
		if (!svgEl) return;

		const rect = svgEl.getBoundingClientRect();
		const faceCenter = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height * (140 / 280),
		};

		const clientX =
			"clientX" in e ? e.clientX : (e.touches[0]?.clientX ?? 0);
		const clientY =
			"clientY" in e ? e.clientY : (e.touches[0]?.clientY ?? 0);

		const mx = clientX - faceCenter.x;
		const my = clientY - faceCenter.y;
		const nx = Math.max(-1, Math.min(1, mx / (rect.width * 0.3)));
		const ny = Math.max(-1, Math.min(1, my / (rect.height * 0.3)));
		const r = Math.hypot(nx, ny);

		const target = latestEyeTargetsRef.current;
		const eyeTiltDelta = nx * 12;
		const eyeYDelta = ny * 8;
		const eyeScale = 1 + Math.abs(nx) * 0.05;

		if (!isLongPressActiveRef.current) {
			animateEye(
				leftEyeRef.current,
				{
					rx: target.rx,
					ry: target.ry,
					cy: target.cy + eyeYDelta,
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
					cy: target.cy + eyeYDelta,
					tilt: target.tilt + eyeTiltDelta,
					scale: eyeScale,
				},
				0.4,
				"power3.out",
				0,
				320,
			);
		}

		if (mouthGroupRef.current) {
			gsap.to(mouthGroupRef.current, {
				rotation: latestMouthRef.current.tilt + nx * 10,
				duration: 0.45,
				ease: "power3.out",
			});
		}

		if (!isLongPressActiveRef.current) {
			const repulsionThreshold = 0.4;
			let repX = 0,
				repY = 0;
			if (r < repulsionThreshold && r > 0) {
				const force = (1 - r / repulsionThreshold) * 25;
				repX = -nx * force;
				repY = -ny * force;
			}
			gsap.to(containerRef.current, {
				x: nx * 8 + repX,
				y: ny * 6 + repY,
				rotation: nx * 2,
				duration: 0.5,
				ease: "power3.out",
			});
		}
	}

	function handlePointerLeave() {
		handlePointerCancel();
		const t = latestEyeTargetsRef.current;

		animateEye(
			leftEyeRef.current,
			{ rx: t.rx, ry: t.ry, cy: t.cy, tilt: -t.tilt, scale: 1 },
			0.6,
			"power3.out",
			0,
			200,
		);
		animateEye(
			rightEyeRef.current,
			{ rx: t.rx, ry: t.ry, cy: t.cy, tilt: t.tilt, scale: 1 },
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
				ease: "elastic.out(1, 0.5)",
			});
	}

	// ── Imperative handle ──────────────────────────────────────────────────
	useImperativeHandle(
		ref,
		() => ({
			setEmotion: (state: EmotionState) => animateEmotion(state),
			wink: (eye: "left" | "right") => performWink(eye),
			surprise: () => performSurprise(),
			boop: () => performBoop(),
			feedAudio: (levels: AudioLevels) => {
				// manual audio frame injection — mirrors the audioLevels prop path
				if (!mouthRef.current) return;
				const base = latestMouthRef.current;
				const { bass, lowMid, mid } = levels;
				const targetCurve = base.curve + lowMid * 55 + bass * 15;
				const targetWidth = base.width + mid * 12 - lowMid * 8;
				gsap.to(mouthRef.current, {
					attr: { d: generateMouthPath(targetWidth, targetCurve) },
					duration: 0.04,
					ease: "none",
					overwrite: "auto",
				});
			},
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[generateMouthPath],
	);

	// ── Effects ────────────────────────────────────────────────────────────

	// Apply theme CSS vars whenever variant or color changes
	useEffect(() => {
		applyAgentTheme(variant, displayColor);
	}, [variant, displayColor]);

	// Run emotion animation on prop change
	useEffect(() => {
		animateEmotion(emotion);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [emotion]);

	// Kickstart breathing + idle systems on mount / variant change
	useEffect(() => {
		startBreathing();
		startIdleMouthWave();

		// Blink loop
		const scheduleBlink = () => {
			const delay = gsap.utils.random(2.5, 6);
			blinkTimerRef.current = gsap.delayedCall(delay, () => {
				performBlink();
				scheduleBlink();
			});
		};
		scheduleBlink();

		// Glance loop
		const scheduleGlance = () => {
			const delay = gsap.utils.random(4, 12);
			glanceTimerRef.current = gsap.delayedCall(delay, () => {
				performGlance();
				scheduleGlance();
			});
		};
		scheduleGlance();

		return () => {
			breathingTL.current?.kill();
			blinkTimerRef.current?.kill();
			glanceTimerRef.current?.kill();
			idleMouthTweenRef.current?.kill();
			if (boilTickerRef.current)
				gsap.ticker.remove(boilTickerRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [variant]);

	// Voice / audio reactivity
	useEffect(() => {
		if (!mouthRef.current) return;

		const hasAudioLevels = audioLevels && audioLevels.overall > 0.01;
		const hasVoiceLevel = speaking && voiceLevel > 0.01;
		if (!hasAudioLevels && !hasVoiceLevel) return;

		const base = latestMouthRef.current;
		let targetCurve = base.curve;
		let targetWidth = base.width;
		let mouthJitter = 0;

		if (hasAudioLevels && audioLevels) {
			const { bass, lowMid, mid, highMid } = audioLevels;
			targetCurve += lowMid * 55 + bass * 15;
			targetWidth += mid * 12 - lowMid * 8;
			mouthJitter = (highMid - 0.3) * 3;
		} else {
			targetCurve += voiceLevel * 60;
		}

		gsap.to(mouthRef.current, {
			attr: { d: generateMouthPath(targetWidth, targetCurve) },
			duration: 0.04,
			ease: "none",
			overwrite: "auto",
		});

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
	}, [voiceLevel, speaking, audioLevels, generateMouthPath]);

	// Eye reactivity from audio
	useEffect(() => {
		if (!audioLevels || audioLevels.overall < 0.05) return;
		if (!leftEyeRef.current || !rightEyeRef.current) return;

		const { bass, highMid, presence } = audioLevels;
		const target = latestEyeTargetsRef.current;
		const scalePulse = 1 + (bass - 0.3) * 0.03;
		const yPulse = highMid * 1.5;

		[
			{ ref: leftEyeRef, cx: 200 },
			{ ref: rightEyeRef, cx: 320 },
		].forEach(({ ref, cx }) => {
			animateEye(
				ref.current,
				{
					rx: target.rx,
					ry: target.ry,
					cy: target.cy - yPulse,
					scale: scalePulse,
				},
				0.05,
				"none",
				0,
				cx,
			);
		});

		if (presence > 0.6 && Math.random() < 0.02) performGlance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [audioLevels]);

	// Container bass-modulated breathing depth
	useEffect(() => {
		if (!audioLevels || !containerRef.current) return;
		if (audioLevels.overall < 0.1) return;
		gsap.to(containerRef.current, {
			scale: 1 + audioLevels.bass * 0.008,
			duration: 0.08,
			ease: "none",
			overwrite: "auto",
		});
	}, [audioLevels]);

	// InteractionFeed — apply latest entry as emotion
	useEffect(() => {
		if (!interactions?.length) return;
		const latest = interactions[interactions.length - 1];
		if (latest.emotion) {
			animateEmotion({ ...DEFAULT_EMOTION, ...latest.emotion });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [interactions]);

	// Notify parent of state changes
	useEffect(() => {
		onStateChange?.({
			emotion,
			isSpeaking: !!(
				speaking ||
				(audioLevels && audioLevels.overall > 0.05)
			),
			variant,
		});
	}, [emotion, speaking, audioLevels, variant, onStateChange]);

	// ── Derived values for JSX ─────────────────────────────────────────────
	const aspectRatio = 520 / 280;
	const svgWidth = size * aspectRatio;
	const eyeClass = `transition-colors duration-300`;

	// ── JSX ────────────────────────────────────────────────────────────────
	return (
		<div
			ref={containerRef}
			className={className}
			style={{
				display: "inline-block",
				width: svgWidth,
				height: size,
				color: displayColor,
				cursor: interactive ? "pointer" : "default",
				userSelect: "none",
				WebkitUserSelect: "none",
			}}
			onMouseMove={handlePointerMove}
			onTouchMove={handlePointerMove}
			onMouseLeave={handlePointerLeave}
			onMouseDown={handlePointerDown}
			onTouchStart={handlePointerDown}
			onMouseUp={handlePointerUp}
			onTouchEnd={handlePointerUp}
		>
			<svg
				viewBox="80 26 360 250"
				width={svgWidth}
				height={size}
				xmlns="http://www.w3.org/2000/svg"
				style={{ overflow: "visible" }}
			>
				<defs>
					{/* Analogue pencil / sketch filter */}
					<filter
						id="pencil"
						x="-20%"
						y="-20%"
						width="140%"
						height="140%"
					>
						<feTurbulence
							ref={turbulenceRef}
							type="turbulence"
							baseFrequency="0.015 0.025"
							numOctaves="4"
							seed="2"
							result="noise"
						/>
						<feDisplacementMap
							in="SourceGraphic"
							in2="noise"
							scale="2.5"
							xChannelSelector="R"
							yChannelSelector="G"
						/>
					</filter>

					{/* Tron scanline pattern */}
					{variant === "tron" && (
						<pattern
							id="scanlines"
							x="0"
							y="0"
							width="1"
							height="3"
							patternUnits="userSpaceOnUse"
						>
							<rect
								width="1"
								height="1"
								fill="rgba(0,0,0,0.08)"
							/>
						</pattern>
					)}
				</defs>

				{/* ── Head ────────────────────────────────────────────────────── */}
				{variant === "tron" ? (
					<rect
						x="100"
						y="30"
						width="320"
						height="240"
						rx="12"
						ry="12"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						opacity="0.25"
					/>
				) : variant === "analogue" ? (
					<ellipse
						cx="260"
						cy="150"
						rx="170"
						ry="135"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						opacity="0.15"
						filter="url(#pencil)"
					/>
				) : (
					<ellipse
						cx="260"
						cy="150"
						rx="172"
						ry="138"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						opacity="0.12"
					/>
				)}

				{/* ── Ears ────────────────────────────────────────────────────── */}
				<Ears />

				{/* ── Eyes ────────────────────────────────────────────────────── */}
				<Eyes
					leftRef={leftEyeRef}
					rightRef={rightEyeRef}
					variant={variant}
					onWink={(eye) => {
						performWink(eye);
						onEyeClick?.(eye);
					}}
					onHoverStart={handleEyeHover}
					onHoverEnd={handleEyeHoverEnd}
					eyeClass={eyeClass}
				/>

				{/* ── Nose dot ────────────────────────────────────────────────── */}
				<circle
					cx="260"
					cy="148"
					r={variant === "tron" ? 2 : 3}
					fill="currentColor"
					opacity="0.4"
					shapeRendering={variant === "tron" ? "crispEdges" : "auto"}
				/>

				{/* ── Mouth ───────────────────────────────────────────────────── */}
				<Mouth
					mouthRef={mouthRef}
					groupRef={mouthGroupRef}
					spectrumGroupRef={spectrumGroupRef}
					spectrumBarsRef={spectrumBarsRef}
					variant={variant}
					onClick={() => {
						onMouthClick?.();
						handleMouthHover();
					}}
					onHoverStart={handleMouthHover}
					onHoverEnd={handleMouthHoverEnd}
				/>

				{/* Tron scanline overlay */}
				{variant === "tron" && (
					<rect
						x="80"
						y="26"
						width="360"
						height="250"
						fill="url(#scanlines)"
						pointerEvents="none"
						opacity="0.5"
					/>
				)}
			</svg>
		</div>
	);
});

Avatar.displayName = "Avatar";
