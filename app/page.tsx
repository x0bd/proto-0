
"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Avatar from "./components/Avatar";
import { ChatWindow } from "./components/ChatWindow";
import {
	Mic,
	Settings,
	SlidersHorizontal,
	Smile,
	Frown,
	Zap,
	Flame,
	Search,
	Meh,
} from "lucide-react";
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
	const [activePreset, setActivePreset] = useState<string | null>("neutral");

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
		setActivePreset(key as string);
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
					<span className="text-xs font-medium tracking-wide group-hover:text-primary transition-colors">
						{isDark ? "墨 (Sumi)" : "和紙 (Washi)"}
					</span>
					<div
						className={`w-2 h-2 rounded-full transition-colors duration-500 ${
							isDark ? "bg-white" : "bg-black"
						}`}
					/>
				</button>
			</div>

			{/* Centered face: Soft & Floating */}
			<div className="absolute inset-0 z-10 flex items-center justify-center">
				<div className="relative">
					{/* Soft Aura */}
					<div className="absolute inset-[-100px] bg-primary/5 rounded-[3rem] blur-3xl pointer-events-none animate-pulse-slower" />
					<Avatar emotion={currentEmotion} voiceEnabled={voiceEnabled} />
				</div>
			</div>

			{/* Bottom Controls: Marshmallow & Bento */}
			<div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8 z-50">
				{/* Mood Bento (Drawer) */}
				{/* Mood Bento (Drawer) */}
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="secondary"
							className="h-14 w-14 rounded-[1.25rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-95 bg-white/80 dark:bg-white/5 border border-white/20 backdrop-blur-md"
						>
							<SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
						</Button>
					</SheetTrigger>
					<SheetContent
						side="bottom"
						className="h-[450px] rounded-t-[2.5rem] border-t-0 bg-background/95 backdrop-blur-xl p-8 shadow-2xl"
					>
						<div className="max-w-md mx-auto h-full flex flex-col relative">


							<SheetHeader className="mb-8 text-center space-y-2">
								<SheetTitle className="text-xl font-medium text-foreground tracking-wide flex items-center justify-center gap-2">
									<span className="text-primary">●</span> 感情 (Mood) Bento
								</SheetTitle>
								<SheetDescription className="text-muted-foreground text-xs tracking-widest uppercase">
									Select Neural Configuration
								</SheetDescription>
							</SheetHeader>
							
							<div className="grid grid-cols-3 gap-4 flex-1">
								{(
									[
										{ id: "neutral", label: "平常", sub: "Neutral", icon: Meh },
										{ id: "joy", label: "喜び", sub: "Joy", icon: Smile },
										{ id: "sad", label: "悲しみ", sub: "Sadness", icon: Frown },
										{ id: "surprised", label: "驚き", sub: "Surprise", icon: Zap },
										{ id: "angry", label: "怒り", sub: "Anger", icon: Flame },
										{ id: "curious", label: "好奇心", sub: "Curious", icon: Search },
									] as const
								).map((item) => {
									const isActive = activePreset === item.id;
									const Icon = item.icon;
									
									return (
										<Button
											key={item.id}
											variant="outline"
											className={`h-full flex flex-col gap-2 rounded-[1.5rem] border-border/50 transition-all duration-300 hover:scale-105 active:scale-95 ${
												isActive 
													? "bg-primary/10 border-primary text-primary" 
													: "hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
											}`}
											onClick={() => applyPreset(item.id as any)}
										>
											<Icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
											<div className="flex flex-col items-center gap-0.5">
												<span className="text-sm font-medium">{item.label}</span>
												<span className="text-[9px] opacity-60 uppercase tracking-wider">{item.sub}</span>
											</div>
										</Button>
									);
								})}
							</div>
						</div>
					</SheetContent>
				</Sheet>

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

		{/* Version Info - Bottom Left */}
		<div className="absolute bottom-8 left-8 z-50 select-none opacity-60">
			<span className="text-[10px] text-muted-foreground tracking-widest font-mono">
				VER. 0.9.2 // 正常 (NORMAL)
			</span>
		</div>

		{/* Floating Chat Window */}
		<ChatWindow />
		</div>
	);
}
