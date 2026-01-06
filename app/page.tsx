"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo, AnimatePresence } from "motion/react";
import Avatar from "./components/Avatar";
import { ChatWindow } from "./components/ChatWindow";
import { CustomizationModal } from "./components/CustomizationModal";
import { Mic, Settings, History } from "lucide-react";
import { useTheme } from "next-themes";
import { FaceVariant } from "./components/face/types";

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
	neutral: {}, // Defaults from globals.css
	rose: {
		"--primary": "oklch(0.7 0.14 0)", // Deep Rose for readability
		"--ring": "oklch(0.7 0.14 0)",
        "--accent": "oklch(0.7 0.14 0)",
	} as React.CSSProperties,
	cyan: {
		"--primary": "oklch(0.6 0.12 230)", // Deep Cyan
		"--ring": "oklch(0.6 0.12 230)",
        "--accent": "oklch(0.6 0.12 230)",
	} as React.CSSProperties,
};

export default function Home() {
	const [currentEmotion, setCurrentEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [baseEmotion, setBaseEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [activePreset, setActivePreset] = useState<string>("neutral");
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
	const [faceVariant, setFaceVariant] = useState<FaceVariant>("minimal");
	const [accentColor, setAccentColor] = useState<string>("neutral");
	const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
	const [voiceLevel, setVoiceLevel] = useState<number>(0);
	const targetEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const baseEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [controlsVisible, setControlsVisible] = useState(true); // Always visible on mobile

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
		<div
			className="min-h-dvh w-screen bg-background text-foreground flex flex-col items-center justify-center overflow-hidden relative font-sans"
            style={themes[accentColor] || {}}
			onMouseMove={handlePointerMove}
			onMouseLeave={handlePointerLeave}
		>
			{/* MAIN CONTENT AREA - Swipeable Avatar, Absolutely Centered */}
			<motion.div
				className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center z-10"
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.15}
				onDragEnd={handleDragEnd}
			>
				{/* Avatar - Even Bigger */}
				<div className="w-[95vw] md:w-[80vw] lg:w-[60vw] max-w-[800px] aspect-square flex items-center justify-center">
					<Avatar
						emotion={currentEmotion}
						voiceEnabled={voiceEnabled}
						variant={faceVariant}
					/>
				</div>
			</motion.div>

			{/* Current Preset Indicator - Bottom Center, Always Visible */}
			<div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-40">
				<AnimatePresence mode="wait">
					<motion.div
						key={activePreset}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="px-5 py-2 rounded-full bg-foreground/5 backdrop-blur-md border border-foreground/5"
					>
						<span className="text-sm font-medium tracking-wide capitalize">
							{activePreset}
						</span>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Floating Dock - Bottom - Technical/Traf Style */}
			<div className="absolute bottom-6 md:bottom-8 z-50 flex items-center gap-1 p-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border shadow-zen">
				{/* Theme */}
				<button
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-95"
				>
					<div className="w-2.5 h-2.5 rounded-sm bg-current opacity-80" />
				</button>

				<div className="w-px h-4 bg-border mx-1" />

				{/* Mic */}
				<button
					onClick={() => setVoiceEnabled((v) => !v)}
					className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95 ${voiceEnabled ? "text-background bg-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
				>
					<Mic className="w-4 h-4" />
				</button>

				{/* History */}
				<button
					onClick={() => setIsHistoryOpen(true)}
					className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-95"
				>
					<History className="w-4 h-4" />
				</button>

				{/* Settings */}
				<button
					onClick={() => setIsCustomizationOpen(true)}
					className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-95"
				>
					<Settings className="w-4 h-4" />
				</button>
			</div>

			{/* Status Indicator (Top Right) */}
			<div className="absolute top-6 right-6 z-40 opacity-40 hover:opacity-100 transition-opacity">
				<div className="flex items-center gap-2">
					<span className={`w-1.5 h-1.5 rounded-full ${voiceEnabled ? (voiceLevel > 0.1 ? "bg-green-500" : "bg-foreground") : "bg-muted-foreground"} transition-colors`} />
					<span className="text-[10px] font-medium tracking-wide hidden md:inline">
						{voiceEnabled ? (voiceLevel > 0.1 ? "Listening" : "Ready") : "Standby"}
					</span>
				</div>
			</div>

			{/* MODALS */}
			<ChatWindow
				isOpen={isHistoryOpen}
				onClose={() => setIsHistoryOpen(false)}
				isListening={voiceEnabled}
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
	);
}
