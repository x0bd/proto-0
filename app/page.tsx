"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo } from "motion/react";
import Avatar from "./components/Avatar";
import { CustomizationModal, type AIConfig } from "./components/CustomizationModal";
import { MemoryBank } from "./components/MemoryBank";
import { FloatingDock } from "@/components/floating-dock";
import { ConsoleOverlay } from "@/components/console-overlay";
import { SystemMenu } from "@/components/system-menu";
import { useTheme } from "next-themes";
import { IoTerminalOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { FaceVariant, EmotionState } from "./components/face/types";

const NEUTRAL_EMOTION: EmotionState = { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 };

const DEFAULT_AI_CONFIG: AIConfig = {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: "",
    model: "gemini-2.0-flash-exp",
};

const INITIAL_HISTORY: { role: string; content: string }[] = [];

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
	const [isMemoryOpen, setIsMemoryOpen] = useState(false);
	const [isConsoleOpen, setIsConsoleOpen] = useState(false);
	const [isStudioOpen, setIsStudioOpen] = useState(false);
	const [isDotThinking, setIsDotThinking] = useState(false);
	const avatarStageRef = useRef<HTMLDivElement>(null);
	const [faceVariant, setFaceVariant] = useState<FaceVariant>("minimal");
	const [accentColor, setAccentColor] = useState<string>("neutral");
	const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
	const [voiceLevel, setVoiceLevel] = useState<number>(0);
    const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
	const targetEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const baseEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
    const [history, setHistory] = useState<{ role: string; content: string }[]>(INITIAL_HISTORY);
	
	useEffect(() => { 
        setMounted(true); 
        // Load AI Config from localStorage
        const savedConfig = localStorage.getItem("dot_ai_config_v2");
        if (savedConfig) {
            try {
                setAiConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error("Failed to parse AI config", e);
            }
        }
    }, []);

    // Save AI Config to localStorage whenever it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("dot_ai_config_v2", JSON.stringify(aiConfig));
        }
    }, [aiConfig, mounted]);

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
				
				{/* HEADER UI */}
				<div className="absolute top-8 left-8 z-50 flex items-center gap-3 select-none">
					{/* Branding */}
					<div className="flex items-center gap-2.5 glass-card rounded-full px-5 h-12 opacity-60 hover:opacity-100 transition-opacity border border-white/10">
						<span 
							className="logo-font font-bold text-sm leading-none tracking-[0.3em]"
						>
							DOT
						</span>
					</div>
				</div>

				<div className="absolute top-8 right-8 z-50 flex items-center gap-2">
					{/* Console Toggle */}
					<button
						onClick={() => setIsConsoleOpen(!isConsoleOpen)}
						className={cn(
							"size-9 rounded-full flex items-center justify-center transition-all duration-300 border border-transparent click-tactic",
							isConsoleOpen 
								? "bg-foreground text-background shadow-lg" 
								: "hover:bg-foreground/5 text-muted-foreground"
						)}
					>
						<IoTerminalOutline className="size-4" strokeWidth={isConsoleOpen ? 2 : 1.5} />
					</button>

					{/* System Controls */}
					<SystemMenu 
						voiceEnabled={voiceEnabled}
						onVoiceToggle={() => setVoiceEnabled(v => !v)}
						onSettingsClick={() => setIsCustomizationOpen(true)}
						onStudioClick={() => setIsStudioOpen(true)}
					/>
				</div>

				{/* CENTER STAGE (Avatar) */}
				<motion.div
					className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center z-0" 
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.15}
					onDragEnd={handleDragEnd}
					style={{ zIndex: 0 }} // Explicit low z-index
				>
				<div
					ref={avatarStageRef}
					className="w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-[700px] aspect-square flex items-center justify-center pointer-events-auto drop-shadow-2xl"
				>
						<Avatar
							emotion={currentEmotion}
							voiceEnabled={voiceEnabled}
                            voiceLevel={voiceLevel}
							variant={faceVariant}
						/>
					</div>
				</motion.div>

				{/* BOTTOM UI (Floating Dock) */}
				<FloatingDock 
					activePreset={activePreset} 
					onPresetChange={applyPreset} 
					onMemoryClick={() => setIsMemoryOpen(true)}
				/>

				{/* OVERLAYS */}
				<ConsoleOverlay 
					isOpen={isConsoleOpen} 
					onClose={() => setIsConsoleOpen(false)}
                    history={history}
					isThinking={isDotThinking}
                    onSendMessage={async (message: string) => {
						const trimmed = message.trim();
						if (!trimmed) return;

						// optimistic append for UI
						const nextHistory = [...history, { role: "user", content: trimmed }];
                        setHistory(nextHistory);
                        
                        if (!aiConfig.apiKey) {
                            setHistory(prev => [...prev, { role: "system", content: "Error: No API Key configured. Check Intelligence Settings." }]);
                            return;
                        }

                        try {
							setIsDotThinking(true);
                             const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${aiConfig.apiKey}`
                                },
                                body: JSON.stringify({
                                    model: aiConfig.model,
                                    messages: [
                                        { role: "system", content: "You are Dot, a minimal expressive avatar. You are helpful, concise, and slightly poetic. If the user asks for an emotion, you can output JSON in the format { \"joy\": 0.5, \"sadness\": 0, ... } at the end of your message to change your face." },
                                        ...nextHistory.filter(h => h.role === 'user' || h.role === 'dot' || h.role === 'system').map(h => ({
                                            role: h.role === 'dot' ? 'assistant' : h.role,
                                            content: h.content
                                        })),
                                    ],
                                    temperature: 0.7,
                                    max_tokens: 150
                                })
                            });

                            if (!response.ok) {
                                throw new Error(`API Error: ${response.status}`);
                            }

                            const data = await response.json();
                            const reply = data.choices[0]?.message?.content || "(No response)";
                            
                            setHistory(prev => [...prev, { role: "dot", content: reply }]);

                            // Basic emotion parsing (JSON extraction)
                            const jsonMatch = reply.match(/\{[\s\S]*?\}/);
                            if (jsonMatch) {
                                try {
                                    const parsedEmotion = JSON.parse(jsonMatch[0]);
                                    if (typeof parsedEmotion.joy === 'number') {
                                        const newEmotion = { ...baseEmotionRef.current, ...parsedEmotion };
                                         setBaseEmotion(newEmotion);
                                         baseEmotionRef.current = newEmotion;
                                         targetEmotionRef.current = newEmotion;
                                         // Clean up the message if it's just JSON? No, keep it for debug context or style.
                                    }
                                } catch (e) {
                                    // Ignore json parse error
                                }
                            }

                        } catch (error) {
                            console.error(error);
                             setHistory(prev => [...prev, { role: "system", content: `Connection Failed: ${error instanceof Error ? error.message : "Unknown error"}` }]);
                        } finally {
							setIsDotThinking(false);
                        }
                    }}
                    onClear={() => {
						setIsDotThinking(false);
						setHistory([]);
					}}
				/>

				<CustomizationModal
					isOpen={isCustomizationOpen}
					onClose={() => setIsCustomizationOpen(false)}
					currentVariant={faceVariant}
					onVariantChange={setFaceVariant}
					accentColor={accentColor}
					onAccentChange={setAccentColor}
                    aiConfig={aiConfig}
                    onAiConfigChange={setAiConfig}
				/>
				
				<MemoryBank
					isOpen={isMemoryOpen}
					onClose={() => setIsMemoryOpen(false)}
					currentEmotion={currentEmotion}
					avatarStageRef={avatarStageRef}
					onRestore={(emotion) => {
						setBaseEmotion(emotion);
						baseEmotionRef.current = emotion;
						targetEmotionRef.current = emotion;
						setActivePreset("custom"); // New state for restored emotions
					}}
				/>

                {/* Studio Placeholder */}
                {isStudioOpen && (
                    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-8" onClick={() => setIsStudioOpen(false)}>
                        <div className="max-w-md text-center space-y-4">
                            <h2 className="text-2xl font-bold tracking-tight">Studio Mode</h2>
                            <p className="text-muted-foreground">Audio reactivity and advanced face customization tools are coming soon.</p>
                            <button className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
                                Close
                            </button>
                        </div>
                    </div>
                )}
			</div>
		</div>
	);
}
