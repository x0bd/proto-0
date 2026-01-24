"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo } from "motion/react";
import Avatar from "./components/Avatar";
import { CustomizationModal, type AIConfig } from "./components/CustomizationModal";
import { FloatingDock } from "@/components/floating-dock";
import { ConsoleOverlay } from "@/components/console-overlay";
import { IoSettingsOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { FaceVariant, EmotionState } from "./components/face/types";
import { useVoiceSynthesis } from "@/hooks/useVoiceSynthesis";
import { useAudioAnalysis, type AudioLevels } from "@/hooks/useAudioAnalysis";

const NEUTRAL_EMOTION: EmotionState = { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 };

// Simple emotion detection from text
function detectEmotion(text: string): EmotionState {
	const lower = text.toLowerCase();
	
	if (lower.includes("happy") || lower.includes("glad") || lower.includes("wonderful") || lower.includes("great") || lower.includes("love")) {
		return { joy: 0.9, sadness: 0, surprise: 0.1, anger: 0, curiosity: 0.2 };
	}
	if (lower.includes("sad") || lower.includes("sorry") || lower.includes("unfortunate") || lower.includes("miss")) {
		return { joy: 0, sadness: 0.8, surprise: 0, anger: 0, curiosity: 0.1 };
	}
	if (lower.includes("wow") || lower.includes("amazing") || lower.includes("incredible") || lower.includes("!")) {
		return { joy: 0.3, sadness: 0, surprise: 0.9, anger: 0, curiosity: 0.4 };
	}
	if (lower.includes("curious") || lower.includes("wonder") || lower.includes("interesting") || lower.includes("?")) {
		return { joy: 0.2, sadness: 0, surprise: 0.2, anger: 0, curiosity: 0.9 };
	}
	
	return NEUTRAL_EMOTION;
}

const DEFAULT_AI_CONFIG: AIConfig = {
    baseUrl: "",
    apiKey: "",
    model: "gemini-1.5-flash",
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

export default function Home() {
	const [currentEmotion, setCurrentEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [baseEmotion, setBaseEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
	const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
	const [isDotThinking, setIsDotThinking] = useState(false);
	const avatarStageRef = useRef<HTMLDivElement>(null);
	const [faceVariant, setFaceVariant] = useState<FaceVariant>("minimal");
	const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
	const [voiceLevel, setVoiceLevel] = useState<number>(0);
	const [audioLevels, setAudioLevels] = useState<AudioLevels | undefined>(undefined);
    const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
	const targetEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const baseEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const [mounted, setMounted] = useState(false);
    const [history, setHistory] = useState<{ role: string; content: string }[]>(INITIAL_HISTORY);

    const { 
        levels, 
        connectMicrophone,
        connectExternalAnalyser,
        disconnect: disconnectAudio,
    } = useAudioAnalysis();
    
    const { speak, stop: stopSpeaking, analyserRef: ttsAnalyserRef } = useVoiceSynthesis({
        onAudioStart: () => {
            if (ttsAnalyserRef.current) {
                connectExternalAnalyser(ttsAnalyserRef.current);
            }
        },
    });

    // Pass levels to avatar
    useEffect(() => {
        setAudioLevels(levels);
    }, [levels]);

    // Connect/disconnect mic when voice is toggled
    useEffect(() => {
        if (voiceEnabled) {
            connectMicrophone();
        } else {
            disconnectAudio();
        }
    }, [voiceEnabled, connectMicrophone, disconnectAudio]);
	
	useEffect(() => { 
        setMounted(true); 
    }, []);

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

	// Voice level from real audio analysis
	useEffect(() => {
		if (levels?.overall) {
			setVoiceLevel(levels.overall);
		} else {
			setVoiceLevel(0);
		}
	}, [levels]);

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

	// Simple chat handler using /api/chat
	const handleSendMessage = async (message: string) => {
		const trimmed = message.trim();
		if (!trimmed) return;

		stopSpeaking();

		const nextHistory = [...history, { role: "user", content: trimmed }];
		setHistory(nextHistory);

		try {
			setIsDotThinking(true);

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: nextHistory.filter(m => m.role !== "system").map(m => ({
						role: m.role === "dot" ? "assistant" : m.role,
						content: m.content,
					})),
				}),
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || "AI Error");
			}

			const data = await response.json();
			const reply = data.text || "...";

			// Add Dot's response
			setHistory(prev => [...prev, { role: "dot", content: reply }]);

			// Detect emotion from response
			const emotion = detectEmotion(reply);
			setBaseEmotion(emotion);
			baseEmotionRef.current = emotion;
			targetEmotionRef.current = emotion;

			// Speak the response
			if (voiceEnabled) {
				speak(reply);
			}

		} catch (error) {
			console.error(error);
			setHistory(prev => [...prev, { role: "system", content: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }]);
		} finally {
			setIsDotThinking(false);
		}
	};

	return (
		<div className="flex h-dvh w-full overflow-hidden bg-background font-sans selection:bg-foreground selection:text-background relative">
			{/* BACKGROUND & ATMOSPHERE */}
			<div
				className="absolute inset-0 w-full h-full text-foreground flex flex-col items-center justify-center transition-colors duration-500 bg-grain"
				onMouseMove={handlePointerMove}
				onMouseLeave={handlePointerLeave}
			>
				{/* Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
				
				{/* HEADER UI */}
				<div className="absolute top-8 left-8 z-50 flex items-center gap-3 select-none">
					{/* Branding */}
					<div className="flex items-center gap-2.5 glass-card rounded-full px-5 h-12 opacity-60 hover:opacity-100 transition-opacity border border-white/10">
						<span className="logo-font font-bold text-sm leading-none tracking-[0.3em]">
							DOT
						</span>
					</div>
				</div>

				<div className="absolute top-8 right-8 z-50 flex items-center gap-2">
					{/* Settings Button */}
					<button
						onClick={() => setIsCustomizationOpen(true)}
						className="size-9 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-300 click-tactic"
						title="Settings"
					>
						<IoSettingsOutline className="size-4" />
					</button>
				</div>

				{/* CENTER STAGE (Avatar) */}
				<motion.div
					className="absolute inset-0 touch-none flex items-center justify-center z-0"
					style={{ zIndex: 0 }}
				>
				<div
					ref={avatarStageRef}
					className="w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-[700px] aspect-square flex items-center justify-center pointer-events-auto drop-shadow-2xl"
				>
						<Avatar
							emotion={currentEmotion}
							voiceEnabled={voiceEnabled}
                            voiceLevel={voiceLevel}
							audioLevels={audioLevels}
							variant={faceVariant}
						/>
					</div>
				</motion.div>

				{/* BOTTOM UI (Minimal Dock) */}
				<FloatingDock 
					voiceEnabled={voiceEnabled}
					onVoiceToggle={() => setVoiceEnabled(v => !v)}
					onHistoryClick={() => setIsTranscriptOpen(true)}
				/>

				{/* Transcript Overlay */}
				<ConsoleOverlay 
					isOpen={isTranscriptOpen} 
					onClose={() => setIsTranscriptOpen(false)}
                    history={history}
					isThinking={isDotThinking}
                    onSendMessage={handleSendMessage}
                    onClear={() => {
						setIsDotThinking(false);
						setHistory([]);
					}}
				/>

				{/* Settings Modal */}
				<CustomizationModal
					isOpen={isCustomizationOpen}
					onClose={() => setIsCustomizationOpen(false)}
					currentVariant={faceVariant}
					onVariantChange={setFaceVariant}
					accentColor={"neutral"}
					onAccentChange={() => {}}
                    aiConfig={aiConfig}
                    onAiConfigChange={setAiConfig}
				/>
			</div>
		</div>
	);
}
