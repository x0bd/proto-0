"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo } from "motion/react";
import Avatar from "./components/Avatar";
import { CustomizationModal } from "./components/CustomizationModal";
import { FloatingDock } from "@/components/floating-dock";
import { ConsoleOverlay } from "@/components/console-overlay";
import { SystemMenu } from "@/components/system-menu";
import { useTheme } from "next-themes";
import { FaceVariant } from "./components/face/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Helpers ---
interface EmotionState {
	joy: number;
	sadness: number;
	surprise: number;
	anger: number;
	curiosity: number;
}

const NEUTRAL_EMOTION: EmotionState = { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 };

function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }
function smooth01(t: number) { const x = clamp01(t); return x * x * (3 - 2 * x); }
function lerpEmotion(a: EmotionState, b: EmotionState, alpha: number): EmotionState {
	const t = clamp01(alpha);
	return {
		joy: a.joy + (b.joy - a.joy) * t,
		sadness: a.sadness + (b.sadness - a.sadness) * t,
		surprise: a.surprise + (b.surprise - a.surprise) * t,
		anger: a.anger + (b.anger - a.anger) * t,
		curiosity: a.curiosity + (b.curiosity - a.curiosity) * t,
	};
}

const presets: Record<string, EmotionState> = {
	neutral: { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 },
	joy: { joy: 1, sadness: 0, surprise: 0.1, anger: 0, curiosity: 0.2 },
	sad: { joy: 0, sadness: 1, surprise: 0, anger: 0, curiosity: 0.1 },
	surprised: { joy: 0.2, sadness: 0, surprise: 1, anger: 0, curiosity: 0.3 },
	angry: { joy: 0, sadness: 0.1, surprise: 0.1, anger: 1, curiosity: 0 },
	curious: { joy: 0.2, sadness: 0, surprise: 0.2, anger: 0, curiosity: 1 },
};
const presetKeys = Object.keys(presets);

const themes: Record<string, React.CSSProperties> = {
	neutral: {},
	rose: {
		"--primary": "oklch(0.7 0.14 0)",
		"--ring": "oklch(0.7 0.14 0)",
		"--accent": "oklch(0.7 0.14 0)",
	} as React.CSSProperties,
	cyan: {
		"--primary": "oklch(0.6 0.12 230)",
		"--ring": "oklch(0.6 0.12 230)",
		"--accent": "oklch(0.6 0.12 230)",
	} as React.CSSProperties,
};

export default function Home() {
	const [currentEmotion, setCurrentEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [baseEmotion, setBaseEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [activePreset, setActivePreset] = useState<string>("neutral");
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
	const [isConsoleOpen, setIsConsoleOpen] = useState(false);
	const [faceVariant, setFaceVariant] = useState<FaceVariant>("minimal");
	const [accentColor, setAccentColor] = useState<string>("neutral");
	const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
	const [voiceLevel, setVoiceLevel] = useState<number>(0);
	const targetEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const baseEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [controlsVisible, setControlsVisible] = useState(true);

	useEffect(() => { setMounted(true); }, []);
	useEffect(() => { baseEmotionRef.current = baseEmotion; }, [baseEmotion]);

	// Animation Loop
	useEffect(() => {
		let frameId: number;
		const step = () => {
			setCurrentEmotion((prev) => {
				const next = lerpEmotion(prev, targetEmotionRef.current, 0.08);
				const newBase = lerpEmotion(baseEmotionRef.current, next, 0.015);
				baseEmotionRef.current = newBase;
				setBaseEmotion(newBase);
				return next;
			});
			frameId = requestAnimationFrame(step);
		};
		frameId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frameId);
	}, []);

	// Voice Visualizer Loop
	useEffect(() => {
		if (!voiceEnabled) { setVoiceLevel(0); return; }
		let frameId: number;
		const start = performance.now();
		const loop = (time: number) => {
			const t = (time - start) / 1000;
			const composite = 0.55 * Math.sin(t * 6.2) + 0.35 * Math.sin(t * 9.1 + 0.7) + 0.2 * Math.sin(t * 13.4 + 1.9);
			const level = Math.min(1, Math.max(0, 0.5 + 0.5 * composite));
			setVoiceLevel(level);
			frameId = requestAnimationFrame(loop);
		};
		frameId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frameId);
	}, [voiceEnabled]);

	const applyPreset = (key: string) => {
		const preset = presets[key];
		if (!preset) return;
		setBaseEmotion(preset);
		baseEmotionRef.current = preset;
		targetEmotionRef.current = preset;
		setCurrentEmotion(preset);
		setActivePreset(key);
		if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
	};

	const cyclePreset = (direction: number) => {
		const currentIndex = presetKeys.indexOf(activePreset);
		let nextIndex = currentIndex + direction;
		if (nextIndex >= presetKeys.length) nextIndex = 0;
		if (nextIndex < 0) nextIndex = presetKeys.length - 1;
		applyPreset(presetKeys[nextIndex]);
	};

	const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
		const threshold = 50;
		if (info.offset.x < -threshold) cyclePreset(1);
		else if (info.offset.x > threshold) cyclePreset(-1);
	};

	const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (typeof window === "undefined") return;
		setControlsVisible(true);
		const { innerWidth, innerHeight } = window;
		const nx = Math.max(-1, Math.min(1, (e.clientX - innerWidth / 2) / (innerWidth * 0.25)));
		const ny = Math.max(-1, Math.min(1, (e.clientY - innerHeight / 2) / (innerHeight * 0.25)));
		const r = Math.min(1, Math.hypot(nx, ny));
		const deadZone = 0.18;
		const intensity = r <= deadZone ? 0 : smooth01((r - deadZone) / (1 - deadZone));

		const pointerTarget: EmotionState = {
			joy: smooth01(-ny) * intensity,
			sadness: smooth01(ny) * intensity,
			surprise: smooth01(Math.abs(ny) * 0.6) * 0.7 * intensity,
			anger: smooth01(Math.max(0, Math.abs(nx) - 0.55) / 0.45) * 0.65 * intensity,
			curiosity: smooth01(Math.abs(nx)) * intensity,
		};

		const weightPointer = 0.6;
		const base = baseEmotionRef.current;
		targetEmotionRef.current = {
			joy: base.joy * (1 - weightPointer) + pointerTarget.joy * weightPointer,
			sadness: base.sadness * (1 - weightPointer) + pointerTarget.sadness * weightPointer,
			surprise: base.surprise * (1 - weightPointer) + pointerTarget.surprise * weightPointer,
			anger: base.anger * (1 - weightPointer) + pointerTarget.anger * weightPointer,
			curiosity: base.curiosity * (1 - weightPointer) + pointerTarget.curiosity * weightPointer,
		};
	};

	const handlePointerLeave = () => {
		targetEmotionRef.current = baseEmotionRef.current;
	};

	return (
		<div className="flex h-dvh w-full overflow-hidden bg-background font-sans selection:bg-foreground selection:text-background relative">
			{/* BACKGROUND & ATMOSPHERE */}
			<div
				className="absolute inset-0 w-full h-full text-foreground flex flex-col items-center justify-center transition-colors duration-500 bg-grain"
				style={themes[accentColor] || {}}
				onMouseMove={handlePointerMove}
				onMouseLeave={handlePointerLeave}
			>
				{/* Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
				
				{/* Breathing Aura */}
				<div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
					<div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-foreground/5 blur-3xl animate-breathe" />
				</div>

				{/* HEADER UI */}
				<div className="absolute top-6 left-6 z-50 flex items-center gap-3 select-none">
					{/* Branding */}
					<div className="flex items-center gap-2.5 bg-card/40 backdrop-blur-xl border border-border/40 rounded-full px-4 py-2 shadow-premium glow-internal pointer-events-none">
						<span 
							className="font-bold text-lg leading-none"
							style={{ fontFamily: 'var(--font-doto)' }}
						>
							心
						</span>
						<span className="text-micro font-bold">KOKORO</span>
					</div>
					
					{/* Status Pill */}
					{activePreset !== 'neutral' && (
						<motion.div 
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className="flex items-center gap-2 text-micro bg-card/40 backdrop-blur-xl border border-border/40 rounded-full px-3 py-1.5 shadow-sm"
						>
							<div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span className="capitalize">{activePreset}</span>
						</motion.div>
					)}
				</div>

				<div className="absolute top-6 right-6 z-50 flex items-center gap-2">
					{/* Console Toggle */}
					<button
						onClick={() => setIsConsoleOpen(!isConsoleOpen)}
						className={cn(
							"size-9 rounded-full flex items-center justify-center transition-all duration-300 border border-transparent",
							isConsoleOpen 
								? "bg-foreground/10 text-foreground border-foreground/10 shadow-zen" 
								: "hover:bg-foreground/5 text-muted-foreground"
						)}
					>
						<Terminal className="size-4" />
					</button>

					{/* System Controls */}
					<SystemMenu 
						voiceEnabled={voiceEnabled}
						onVoiceToggle={() => setVoiceEnabled(v => !v)}
						onSettingsClick={() => setIsCustomizationOpen(true)}
					/>
				</div>

				{/* CENTER STAGE (Avatar) */}
				<motion.div
					className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center z-10"
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.15}
					onDragEnd={handleDragEnd}
				>
					<div className="w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-[700px] aspect-square flex items-center justify-center pointer-events-none drop-shadow-2xl">
						<Avatar
							emotion={currentEmotion}
							voiceEnabled={voiceEnabled}
							variant={faceVariant}
						/>
					</div>
				</motion.div>

				{/* BOTTOM UI (Floating Dock) */}
				<FloatingDock 
					activePreset={activePreset} 
					onPresetChange={applyPreset} 
				/>

				{/* OVERLAYS */}
				<ConsoleOverlay 
					isOpen={isConsoleOpen} 
					onClose={() => setIsConsoleOpen(false)}
					history={[
						{ role: "system", content: "Kokoro System Online" },
						{ role: "user", content: "Initialize emotion engine..." },
						{ role: "system", content: "Emotion engine active." },
						{ role: "kokoro", content: "Systems normal. Awaiting input." }
					]} 
				/>

				<CustomizationModal
					isOpen={isCustomizationOpen}
					onClose={() => setIsCustomizationOpen(false)}
					currentVariant={faceVariant}
					onVariantChange={setFaceVariant}
					accentColor={accentColor}
					onAccentChange={setAccentColor}
				/>
			</div>
		</div>
	);
}
