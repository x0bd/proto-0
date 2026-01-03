"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type React from "react";
import { motion, type PanInfo, AnimatePresence } from "motion/react";
import Avatar from "./components/Avatar";
import { ChatWindow } from "./components/ChatWindow";
import { CustomizationModal } from "./components/CustomizationModal";
import {
	Mic,
	Settings,
	History,
    MoreHorizontal
} from "lucide-react";
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

const NEUTRAL_EMOTION: EmotionState = {
	joy: 0.3,
	sadness: 0,
	surprise: 0,
	anger: 0,
	curiosity: 0.2,
};

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

export default function Home() {
	// --- State Logic ---
	const [currentEmotion, setCurrentEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [baseEmotion, setBaseEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [activePreset, setActivePreset] = useState<string | null>("neutral");
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
    const [controlsVisible, setControlsVisible] = useState(false);

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
    
    // Emotion Logic
	const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (typeof window === "undefined") return;
        setControlsVisible(true);
		const { innerWidth, innerHeight } = window;
		const centerX = innerWidth / 2;
		const centerY = innerHeight / 2;
		const nx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (innerWidth * 0.25)));
		const ny = Math.max(-1, Math.min(1, (e.clientY - centerY) / (innerHeight * 0.25)));
		const r = Math.min(1, Math.hypot(nx, ny));
		const deadZone = 0.18;
		const intensity = r <= deadZone ? 0 : smooth01((r - deadZone) / (1 - deadZone));
		
		const pointerTarget: EmotionState = { 
            joy: smooth01(-ny) * intensity, 
            sadness: smooth01(ny) * intensity, 
            surprise: smooth01(Math.abs(ny) * 0.6) * 0.7 * intensity, 
            anger: smooth01(Math.max(0, Math.abs(nx) - 0.55) / 0.45) * 0.65 * intensity, 
            curiosity: smooth01(Math.abs(nx)) * intensity 
        };

		const weightPointer = 0.6;
		const weightBase = 1 - weightPointer;
		const base = baseEmotionRef.current;
        
		targetEmotionRef.current = {
			joy: base.joy * weightBase + pointerTarget.joy * weightPointer,
			sadness: base.sadness * weightBase + pointerTarget.sadness * weightPointer,
			surprise: base.surprise * weightBase + pointerTarget.surprise * weightPointer,
			anger: base.anger * weightBase + pointerTarget.anger * weightPointer,
			curiosity: base.curiosity * weightBase + pointerTarget.curiosity * weightPointer,
		};
	};

	const handlePointerLeave = () => { 
        targetEmotionRef.current = baseEmotionRef.current; 
        setControlsVisible(false);
    };

	return (
		<div
			className="min-h-dvh w-screen bg-background text-foreground flex items-center justify-center overflow-hidden relative font-sans transition-colors duration-700"
			onMouseMove={handlePointerMove}
			onMouseLeave={handlePointerLeave}
		>
            {/* The Wall (Background) - No texture, just matte finish */}
            <div className="absolute inset-0 bg-background transition-colors duration-1000" />
            
            {/* Ambient Shadow (The "Device" presence) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-[80vw] h-[80vh] bg-foreground/5 rounded-full blur-[100px] opacity-50" />
            </div>

			{/* MAIN CONTENT AREA */}
			<div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
				<motion.div
					className="relative cursor-default touch-none w-full max-w-[600px] aspect-square flex items-center justify-center pointer-events-auto"
				>
                    {/* The "Inset" Circle/Container - Subtle depth like a speaker grill or recessed display */}
                    <div className="absolute inset-0 rounded-[48px] border border-foreground/5 inset-player opacity-50 scale-90 md:scale-100 transition-all duration-1000" />
                    
					<Avatar
						emotion={currentEmotion}
						voiceEnabled={voiceEnabled}
						variant={faceVariant}
					/>
				</motion.div>
			</div>
            
            {/* Floating Dock - Appears on Hover/Activity */}
            <AnimatePresence>
                {controlsVisible && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-8 z-50 flex items-center gap-2 p-2 rounded-full bg-background/80 backdrop-blur-xl border border-foreground/5 shadow-zen"
                    >
                         {/* Theme */}
                         <button 
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                         >
                             <div className="w-3 h-3 rounded-full bg-current opacity-80" />
                         </button>

                         <div className="w-px h-4 bg-foreground/10" />

                         {/* Mic */}
                         <button 
                            onClick={() => setVoiceEnabled(v => !v)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${voiceEnabled ? "text-foreground bg-foreground/5" : "text-muted-foreground hover:bg-foreground/5"}`}
                         >
                             <Mic className="w-4 h-4" />
                         </button>

                         {/* History */}
                         <button 
                            onClick={() => setIsHistoryOpen(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                         >
                             <History className="w-4 h-4" />
                         </button>

                          {/* Settings */}
                         <button 
                            onClick={() => setIsCustomizationOpen(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                         >
                             <Settings className="w-4 h-4" />
                         </button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Minimal Status Indicator (Top Right) */}
            <div className="absolute top-8 right-8 z-40 opacity-30 hover:opacity-100 transition-opacity cursor-default">
                 <div className="flex items-center gap-2">
                     <span className={`w-1.5 h-1.5 rounded-full ${voiceEnabled ? (voiceLevel > 0.1 ? "bg-green-500" : "bg-foreground") : "bg-muted-foreground"} transition-colors`} />
                     <span className="text-[10px] font-medium tracking-wide">
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
