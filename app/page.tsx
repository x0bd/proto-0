"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo, AnimatePresence } from "motion/react";
import Avatar from "./components/Avatar";
import { ChatWindow } from "./components/ChatWindow";
import { CustomizationModal } from "./components/CustomizationModal";
import { useTheme } from "next-themes";
import { FaceVariant } from "./components/face/types";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

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
		<div className="flex h-dvh w-full overflow-hidden bg-background font-sans selection:bg-foreground selection:text-background">
            <AppSidebar 
                activePreset={activePreset}
                onPresetChange={applyPreset}
                voiceEnabled={voiceEnabled}
                onVoiceToggle={() => setVoiceEnabled(v => !v)}
                onHistoryClick={() => setIsHistoryOpen(true)}
                onSettingsClick={() => setIsCustomizationOpen(true)}
            />
            
            <SidebarInset className="relative flex flex-col items-center justify-center overflow-hidden bg-grain">
                <div
                    className="absolute inset-0 w-full h-full text-foreground flex flex-col items-center justify-center transition-colors duration-500"
                    style={themes[accentColor] || {}}
                    onMouseMove={handlePointerMove}
                    onMouseLeave={handlePointerLeave}
                >
                    {/* Breathing Aura - Behind Everything */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                         <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-foreground/5 blur-3xl animate-breathe" />
                    </div>

                    {/* Technical Header / Status Line (Top Left) */}
                    <div className="absolute top-6 left-6 z-50 flex items-start gap-6 text-sm font-mono text-foreground">
                        <SidebarTrigger className="-ml-2 mt-1" />
                        
                        {/* Tategaki (Vertical) Branding */}
                        <div className="flex flex-col gap-4 select-none opacity-80 hover:opacity-100 transition-opacity writing-vertical-rl py-2">
                             <div className="flex items-center gap-2">
                                <span 
                                    className="font-bold text-2xl tracking-widest leading-none"
                                    style={{ 
                                        fontFamily: 'var(--font-doto), sans-serif',
                                        fontWeight: 700,
                                        fontVariationSettings: '"ROND" 0'
                                    }}
                                >
                                    心
                                </span>
                                <span className="text-[10px] tracking-widest opacity-50">KOKORO</span>
                             </div>

                             {/* Vertical separator */}
                             <div className="w-px h-8 bg-border my-2" />

                             <div className="flex items-center gap-2 text-xs tracking-widest uppercase">
                                <span>{activePreset}</span>
                                {voiceEnabled && <span className="text-green-500">• ON</span>}
                             </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA - Swipeable Avatar */}
                    <motion.div
                        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center z-10"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="w-[95vw] md:w-[80vw] lg:w-[60vw] max-w-[800px] aspect-square flex items-center justify-center pointer-events-none drop-shadow-2xl">
                            <Avatar
                                emotion={currentEmotion}
                                voiceEnabled={voiceEnabled}
                                variant={faceVariant}
                            />
                        </div>
                    </motion.div>

                    {/* Hint Text - Bottom - Japanese/Cyberpunk style */}
                    <div className="absolute bottom-12 z-40 flex flex-col items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] opacity-30 select-none">
                         <span>Drag to Feel</span>
                         <span>感じるためにドラッグ</span>
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
            </SidebarInset>
		</div>
	);
}
