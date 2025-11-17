"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Avatar from "./components/Avatar";
import { Mic, SlidersHorizontal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

interface EmotionState {
	joy: number;
	sadness: number;
	surprise: number;
	anger: number;
	curiosity: number;
}

const NEUTRAL_EMOTION: EmotionState = {
	joy: 0.3,
	sadness: 0,
	surprise: 0,
	anger: 0,
	curiosity: 0.2,
};

function clamp01(v: number) {
	return Math.min(1, Math.max(0, v));
}

function smooth01(t: number) {
	const x = clamp01(t);
	return x * x * (3 - 2 * x);
}

function lerpEmotion(
	a: EmotionState,
	b: EmotionState,
	alpha: number
): EmotionState {
	const t = clamp01(alpha);
	return {
		joy: a.joy + (b.joy - a.joy) * t,
		sadness: a.sadness + (b.sadness - a.sadness) * t,
		surprise: a.surprise + (b.surprise - a.surprise) * t,
		anger: a.anger + (b.anger - a.anger) * t,
		curiosity: a.curiosity + (b.curiosity - a.curiosity) * t,
	};
}

export default function Home() {
	const [currentEmotion, setCurrentEmotion] =
		useState<EmotionState>(NEUTRAL_EMOTION);
	const [baseEmotion, setBaseEmotion] =
		useState<EmotionState>(NEUTRAL_EMOTION);

	const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
	const [voiceLevel, setVoiceLevel] = useState<number>(0);

	// Cursor → Emotion mapping target (lives in a ref for smooth RAF-based interpolation)
	const targetEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const baseEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);

	const [isDark, setIsDark] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const root = document.documentElement;
		const prefersDark =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		return root.classList.contains("dark") || prefersDark;
	});

	useEffect(() => {
		// Sync class with state on mount and whenever it changes
		const root = document.documentElement;
		root.classList.toggle("dark", isDark);
	}, [isDark]);

	const toggleTheme = () => {
		const root = document.documentElement;
		const next = !isDark;
		root.classList.toggle("dark", next);
		setIsDark(next);
	};

	// Keep baseEmotionRef in sync with state
	useEffect(() => {
		baseEmotionRef.current = baseEmotion;
	}, [baseEmotion]);

	// Smoothly interpolate currentEmotion toward targetEmotionRef
	useEffect(() => {
		let frameId: number;
		const step = () => {
			setCurrentEmotion((prev) => {
				const next = lerpEmotion(prev, targetEmotionRef.current, 0.08);

				// Emotion memory: gently pull the long-term base mood toward
				// whatever Kokoro has actually been feeling recently.
				const memoryLerp = 0.015; // smaller = longer "memory"
				const newBase = lerpEmotion(
					baseEmotionRef.current,
					next,
					memoryLerp
				);
				baseEmotionRef.current = newBase;
				// Keep React state in sync so presets/tweaks reflect the evolving mood.
				setBaseEmotion(newBase);

				return next;
			});
			frameId = requestAnimationFrame(step);
		};
		frameId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frameId);
	}, []);

	// Simulated voice "loudness" driving the mic breath halo.
	// Later we can replace this with real mic amplitude while keeping the same visual mapping.
	useEffect(() => {
		if (!voiceEnabled) {
			setVoiceLevel(0);
			return;
		}

		let frameId: number;
		const start = performance.now();

		const loop = (time: number) => {
			const t = (time - start) / 1000;
			const composite =
				0.55 * Math.sin(t * 6.2) +
				0.35 * Math.sin(t * 9.1 + 0.7) +
				0.2 * Math.sin(t * 13.4 + 1.9);
			const level = Math.min(1, Math.max(0, 0.5 + 0.5 * composite));
			setVoiceLevel(level);
			frameId = requestAnimationFrame(loop);
		};

		frameId = requestAnimationFrame(loop);

		return () => cancelAnimationFrame(frameId);
	}, [voiceEnabled]);

	const presets: Record<string, EmotionState> = {
		neutral: {
			joy: 0.3,
			sadness: 0,
			surprise: 0,
			anger: 0,
			curiosity: 0.2,
		},
		joy: { joy: 1, sadness: 0, surprise: 0.1, anger: 0, curiosity: 0.2 },
		sad: { joy: 0, sadness: 1, surprise: 0, anger: 0, curiosity: 0.1 },
		surprised: {
			joy: 0.2,
			sadness: 0,
			surprise: 1,
			anger: 0,
			curiosity: 0.3,
		},
		angry: { joy: 0, sadness: 0.1, surprise: 0.1, anger: 1, curiosity: 0 },
		curious: {
			joy: 0.2,
			sadness: 0,
			surprise: 0.2,
			anger: 0,
			curiosity: 1,
		},
	};

	const applyPreset = (key: keyof typeof presets) => {
		const preset = presets[key];
		setBaseEmotion(preset);
		baseEmotionRef.current = preset;
		targetEmotionRef.current = preset;
		setCurrentEmotion(preset);
	};

	// Cursor → Emotion mapping (viewport-based approximation; face is centered)
	const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (typeof window === "undefined") return;
		const { innerWidth, innerHeight } = window;
		const centerX = innerWidth / 2;
		const centerY = innerHeight / 2;

		const clientX = e.clientX;
		const clientY = e.clientY;

		// Normalize around the face center with a soft radius
		const mx = clientX - centerX;
		const my = clientY - centerY;
		const nx = Math.max(-1, Math.min(1, mx / (innerWidth * 0.25))); // -1..1
		const ny = Math.max(-1, Math.min(1, my / (innerHeight * 0.25))); // -1..1

		// Radial intensity with a calm "dead zone" near the center
		const r = Math.min(1, Math.hypot(nx, ny));
		const deadZone = 0.18;
		const intensity =
			r <= deadZone ? 0 : smooth01((r - deadZone) / (1 - deadZone));

		// Map to raw emotion targets
		const joyBase = smooth01(-ny); // cursor above center → joy
		const sadnessBase = smooth01(ny); // below center → sadness
		const curiosityBase = smooth01(Math.abs(nx)); // horizontal distance → curiosity
		// Anger appears only at very far horizontal extremes and is capped for elegance
		const angerBase =
			smooth01(Math.max(0, Math.abs(nx) - 0.55) / 0.45) * 0.65;
		// Mild surprise from vertical distance, never fully dominating
		const surpriseBase = smooth01(Math.abs(ny) * 0.6) * 0.7;

		const joy = joyBase * intensity;
		const sadness = sadnessBase * intensity;
		const curiosity = curiosityBase * intensity;
		const anger = angerBase * intensity;
		const surprise = surpriseBase * intensity;

		const pointerTarget: EmotionState = {
			joy,
			sadness,
			surprise,
			anger,
			curiosity,
		};

		// Blend pointer-driven emotion with baseMood so presets still matter
		const weightPointer = 0.6;
		const weightBase = 1 - weightPointer;
		const base = baseEmotionRef.current;

		const blendedTarget: EmotionState = {
			joy: base.joy * weightBase + pointerTarget.joy * weightPointer,
			sadness:
				base.sadness * weightBase +
				pointerTarget.sadness * weightPointer,
			surprise:
				base.surprise * weightBase +
				pointerTarget.surprise * weightPointer,
			anger:
				base.anger * weightBase + pointerTarget.anger * weightPointer,
			curiosity:
				base.curiosity * weightBase +
				pointerTarget.curiosity * weightPointer,
		};

		targetEmotionRef.current = blendedTarget;
	};

	const handlePointerLeave = () => {
		// When cursor leaves, drift back toward the baseEmotion
		targetEmotionRef.current = baseEmotionRef.current;
	};

	return (
		<div
			className="min-h-dvh w-screen bg-white dark:bg-black flex items-center justify-center overflow-hidden relative"
			onMouseMove={handlePointerMove}
			onMouseLeave={handlePointerLeave}
		>
			{/* Top-left label */}
			<div className="absolute top-6 left-6 select-none">
				<span className="text-2xl cherry-bomb-one-regular text-black/70 dark:text-white/70">
					kokoro
				</span>
			</div>

			{/* Top-right theme toggle dot */}
			<button
				onClick={toggleTheme}
				aria-label="Toggle theme"
				className="absolute top-6 right-6 h-5 w-5 rounded-full border border-black/15 dark:border-white/20 shadow-sm transition-colors z-50"
				style={{ backgroundColor: isDark ? "#ffffff" : "#000000" }}
			/>
			{/* Centered face */}
			<div className="absolute inset-0 z-0 flex items-center justify-center">
				<Avatar emotion={currentEmotion} voiceEnabled={voiceEnabled} />
			</div>

			{/* Voice toggle */}
			<div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40">
				{(() => {
					// Map voiceLevel (0..1) to a subtle but expressive halo + scale
					const scale = 1 + voiceLevel * 0.12;
					const ring = voiceLevel * (isDark ? 18 : 14);
					const yOffset = 10 + voiceLevel * 6;
					const blur = 26 + voiceLevel * 18;
					const ringAlpha = isDark ? 0.24 : 0.18;
					const innerAlpha = isDark ? 0.95 : 0.78;

					const activeStyle = voiceEnabled
						? {
								transform: `scale(${scale})`,
								boxShadow: `0 0 0 ${ring}px rgba(0,0,0,${ringAlpha}), 0 ${yOffset}px ${blur}px rgba(0,0,0,${innerAlpha})`,
						  }
						: undefined;

					return (
						<Button
							variant="ghost"
							className={`h-12 w-12 rounded-full p-0 flex items-center justify-center border border-black/10 dark:border-white/15 ${
								voiceEnabled
									? "voice-toggle-active"
									: "bg-white/70 dark:bg-black/70 text-black/70 dark:text-white/70"
							}`}
							style={activeStyle}
							onClick={() => setVoiceEnabled((v) => !v)}
							aria-label="Toggle voice mode"
							title="Toggle voice mode"
						>
							<Mic className="h-5 w-5" />
						</Button>
					);
				})()}
			</div>
			{/* Bottom-left Tweaks trigger (high z-index to avoid overlay issues) */}
			<div className="absolute bottom-6 md:bottom-8 left-6 z-50">
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							className="h-8 w-8 rounded-full p-0 text-black/70 dark:text-white/70"
							aria-label="Open tweaks"
							title="Open tweaks"
						>
							<SlidersHorizontal className="h-4 w-4" />
						</Button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className="font-mono w-[320px] sm:w-[360px]"
					>
						<SheetHeader>
							<SheetTitle>Tweaks</SheetTitle>
							<SheetDescription>Emotion presets</SheetDescription>
						</SheetHeader>
						<div className="mt-4 grid grid-cols-2 gap-2">
							{(
								[
									"neutral",
									"joy",
									"sad",
									"surprised",
									"angry",
									"curious",
								] as const
							).map((k) => (
								<Button
									key={k}
									variant="outline"
									className="justify-center"
									onClick={() => applyPreset(k)}
								>
									{k.toUpperCase()}
								</Button>
							))}
						</div>
					</SheetContent>
				</Sheet>
			</div>
			{/* Bottom-right Settings button (placeholder) */}
			<div className="absolute bottom-6 md:bottom-8 right-6 z-50">
				<Button
					variant="ghost"
					className="h-8 w-8 rounded-full p-0 text-black/70 dark:text-white/70"
					aria-label="Settings"
					title="Settings"
				>
					<Settings className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
