"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo, AnimatePresence } from "motion/react";
import Avatar from "./components/Avatar";
import { ChatWindow } from "./components/ChatWindow";
import {
	Mic,
	Settings,
	History,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
	const [activePreset, setActivePreset] = useState<string | null>("neutral");
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [showSwipeHints, setShowSwipeHints] = useState(true);

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

	// Auto-hide hints after 5 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSwipeHints(false);
		}, 5000);
		return () => clearTimeout(timer);
	}, []);

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
		setActivePreset(key as string);
	};

	// Cursor → Emotion mapping
	const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (typeof window === "undefined") return;
		const { innerWidth, innerHeight } = window;
		const centerX = innerWidth / 2;
		const centerY = innerHeight / 2;

		const clientX = e.clientX;
		const clientY = e.clientY;

		const mx = clientX - centerX;
		const my = clientY - centerY;
		const nx = Math.max(-1, Math.min(1, mx / (innerWidth * 0.25))); // -1..1
		const ny = Math.max(-1, Math.min(1, my / (innerHeight * 0.25))); // -1..1

		const r = Math.min(1, Math.hypot(nx, ny));
		const deadZone = 0.18;
		const intensity =
			r <= deadZone ? 0 : smooth01((r - deadZone) / (1 - deadZone));

		const joyBase = smooth01(-ny);
		const sadnessBase = smooth01(ny);
		const curiosityBase = smooth01(Math.abs(nx));
		const angerBase =
			smooth01(Math.max(0, Math.abs(nx) - 0.55) / 0.45) * 0.65;
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
		targetEmotionRef.current = baseEmotionRef.current;
	};

	const cyclePreset = (direction: number) => {
		const keys = Object.keys(presets);
		const currentIndex = keys.indexOf(activePreset || "neutral");
		let nextIndex = currentIndex + direction;
		if (nextIndex >= keys.length) nextIndex = 0;
		if (nextIndex < 0) nextIndex = keys.length - 1;
		applyPreset(keys[nextIndex] as keyof typeof presets);

		// Hide hints if user interacts
		if (showSwipeHints) setShowSwipeHints(false);
	};

	const handleDragEnd = (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo
	) => {
		const threshold = 50;
		if (info.offset.x < -threshold) {
			// Swipe Left -> Next
			cyclePreset(1);
		} else if (info.offset.x > threshold) {
			// Swipe Right -> Prev
			cyclePreset(-1);
		}
	};

	return (
		<div
			className="min-h-dvh w-screen bg-background text-foreground flex items-center justify-center overflow-hidden relative selection:bg-primary selection:text-primary-foreground font-sans transition-colors duration-700"
			onMouseMove={handlePointerMove}
			onMouseLeave={handlePointerLeave}
		>
			{/* Washi Paper Texture Overlay */}
			<div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-multiply dark:mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

			{/* Header: Japanese Bureaucratic */}
			<div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50 select-none">
				<div className="flex items-center gap-4 opacity-80">
					<div className="w-3 h-3 rounded-full bg-primary animate-pulse-slow" />
					<h1 className="text-2xl font-medium tracking-widest text-foreground uppercase font-[family-name:var(--font-cherry-bomb-one)]">
						ココロ
					</h1>
				</div>

				<button
					onClick={toggleTheme}
					className="group flex items-center gap-3 px-5 py-2.5 bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground rounded-full transition-all duration-500 hover:scale-105 active:scale-95 backdrop-blur-sm border border-transparent hover:border-border/50"
				>
					<span className="text-xs font-medium tracking-wide group-hover:text-primary transition-colors hidden md:inline-block">
						{isDark ? "墨 (Sumi)" : "和紙 (Washi)"}
					</span>
					<div
						className={`w-2 h-2 rounded-full transition-colors duration-500 ${
							isDark ? "bg-white" : "bg-black"
						}`}
					/>
				</button>
			</div>

			<div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-visible">
				<motion.div
					className="relative cursor-grab active:cursor-grabbing touch-none w-screen max-w-none md:max-w-[800px] lg:max-w-[1000px] px-0 pointer-events-auto"
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.2}
					onDragEnd={handleDragEnd}
				>
					{/* Swipe Hints Overlay */}
					<AnimatePresence>
						{showSwipeHints && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 1 }}
								className="absolute inset-0 flex items-center justify-between px-4 md:px-8 pointer-events-none z-50"
							>
								<motion.div
									initial={{ x: 10, opacity: 0 }}
									animate={{ x: 0, opacity: 0.5 }}
									transition={{
										repeat: Infinity,
										repeatType: "reverse",
										duration: 1.5,
									}}
									className="flex items-center gap-2"
								>
									<ChevronLeft className="w-8 h-8 text-muted-foreground" />
									<span className="text-xs font-mono tracking-widest uppercase text-muted-foreground hidden md:block">
										Prev Mood
									</span>
								</motion.div>

								<motion.div
									initial={{ x: -10, opacity: 0 }}
									animate={{ x: 0, opacity: 0.5 }}
									transition={{
										repeat: Infinity,
										repeatType: "reverse",
										duration: 1.5,
									}}
									className="flex items-center gap-2"
								>
									<span className="text-xs font-mono tracking-widest uppercase text-muted-foreground hidden md:block">
										Next Mood
									</span>
									<ChevronRight className="w-8 h-8 text-muted-foreground" />
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>

					<Avatar
						emotion={currentEmotion}
						voiceEnabled={voiceEnabled}
					/>
				</motion.div>
			</div>

			{/* Bottom Controls: Marshmallow & Bento */}
			<div className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center items-center gap-4 md:gap-8 z-50">
				{/* History Toggle */}
				<Button
					variant="secondary"
					className="h-14 w-14 rounded-[1.25rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-95 bg-white/80 dark:bg-white/5 border border-white/20 backdrop-blur-md"
					onClick={() => setIsHistoryOpen(!isHistoryOpen)}
				>
					<History className="h-5 w-5 text-muted-foreground" />
				</Button>

				{/* Voice Toggle: Soft Switch */}
				<div className="relative">
					{(() => {
						const scale = 1 + voiceLevel * 0.1;
						const activeStyle = voiceEnabled
							? {
									transform: `scale(${scale})`,
									backgroundColor: "var(--primary)",
									color: "var(--primary-foreground)",
							  }
							: undefined;

						return (
							<Button
								variant="secondary"
								className={`h-20 w-20 rounded-[1.75rem] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 active:scale-95 border border-white/20 flex items-center justify-center ${
									voiceEnabled
										? ""
										: "bg-white/80 dark:bg-white/5 text-muted-foreground backdrop-blur-md"
								}`}
								style={activeStyle}
								onClick={() => setVoiceEnabled((v) => !v)}
							>
								<Mic className="h-7 w-7" />
							</Button>
						);
					})()}
				</div>

				{/* Settings */}
				<Button
					variant="secondary"
					className="h-14 w-14 rounded-[1.25rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-95 bg-white/80 dark:bg-white/5 border border-white/20 backdrop-blur-md"
				>
					<Settings className="h-5 w-5 text-muted-foreground" />
				</Button>
			</div>

			{/* Mood Info - Bottom Left */}
			<div className="absolute bottom-8 left-8 z-50 select-none opacity-60">
				<span className="text-[10px] text-muted-foreground tracking-widest font-mono uppercase">
					MOOD // {activePreset || "NEUTRAL"}
				</span>
			</div>

			<ChatWindow
				isOpen={isHistoryOpen}
				onClose={() => setIsHistoryOpen(false)}
			/>
		</div>
	);
}
