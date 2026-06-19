"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo, AnimatePresence } from "motion/react";
import Avatar from "../components/Avatar";
import { CustomizationModal } from "../components/CustomizationModal";
import { ShareDock } from "../components/share-dock";
import { FloatingDock } from "@/components/floating-dock";
import { MemoryDrawer } from "../components/memory-drawer";
import { RitualDrawer } from "../components/ritual-drawer";
import { AudioLab } from "../components/audio-lab";
import { ChatModule } from "../components/chat-module";
import { ActivePersonaChip } from "@/components/ui/active-persona-chip";
import { Database, Calendar, AudioWaveform } from "lucide-react";
import {
	RiMoonFill,
	RiSunFill,
	RiSettings4Fill,
	RiGlobalLine,
} from "react-icons/ri";
import { SiNpm, SiGithub } from "react-icons/si";
import { FaceVariant, EmotionState } from "../components/face/types";
import { VARIANT_COLORS } from "../components/face/themes";
import { useAudioAnalysis, type AudioLevels } from "@/hooks/useAudioAnalysis";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { NEUTRAL_EMOTION, emotionFromText } from "@/lib/emotion-analysis";
import {
	getPersonaAvatarBias,
	usePersonaSettings,
} from "@/hooks/usePersonaSettings";
import { useTheme } from "next-themes";
import { getAllKeys, KEY_STORE_CHANGE_EVENT } from "@/lib/key-store";

const EMOTION_PRESETS: { id: string; label: string; state: EmotionState }[] = [
	{ id: "neutral", label: "NEUTRAL", state: NEUTRAL_EMOTION },
	{
		id: "joy",
		label: "JOY",
		state: { joy: 1, sadness: 0, surprise: 0.2, anger: 0, curiosity: 0.3 },
	},
	{
		id: "sad",
		label: "SORROW",
		state: { joy: 0, sadness: 1, surprise: 0, anger: 0, curiosity: 0.1 },
	},
	{
		id: "surprised",
		label: "SHOCK",
		state: { joy: 0.4, sadness: 0, surprise: 1, anger: 0, curiosity: 0.4 },
	},
	{
		id: "angry",
		label: "RAGE",
		state: { joy: 0, sadness: 0.1, surprise: 0.2, anger: 1, curiosity: 0 },
	},
	{
		id: "curious",
		label: "QUERY",
		state: { joy: 0.3, sadness: 0, surprise: 0.3, anger: 0, curiosity: 1 },
	},
];

interface VoiceMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
}

type EmotionSourceMode = "demo" | "live";

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
	alpha: number,
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
	const [activePresetId, setActivePresetId] = useState<string>("neutral");
	const [emotionSourceMode, setEmotionSourceMode] =
		useState<EmotionSourceMode>("demo");
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
	const avatarStageRef = useRef<HTMLDivElement>(null);
	const [faceVariant, setFaceVariant] = useState<FaceVariant>("minimal");
	const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
	const [voiceLevel, setVoiceLevel] = useState<number>(0);
	const [audioLevels, setAudioLevels] = useState<AudioLevels | undefined>(
		undefined,
	);
	const targetEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const baseEmotionRef = useRef<EmotionState>(NEUTRAL_EMOTION);
	const constraintsRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const [hasKeys, setHasKeys] = useState(false);
	const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
	const { theme, setTheme } = useTheme();
	const {
		settings: personaTuning,
		updateSettings: updatePersonaTuning,
	} = usePersonaSettings();

	const [isMemoryOpen, setIsMemoryOpen] = useState(false);
	const [isRitualOpen, setIsRitualOpen] = useState(false);
	const [isAudioLabOpen, setIsAudioLabOpen] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [liveTranscript, setLiveTranscript] = useState("");
	const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
	const [activePersonaId, setActivePersonaId] = useState<string>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("activePersonaId") || "coach";
		}
		return "coach";
	});
	// Avatar personalisation
	const [avatarName, setAvatarName] = useState<string>(() => {
		if (typeof window !== "undefined")
			return localStorage.getItem("avatarName") || "DOT";
		return "DOT";
	});
	const [customAccentColor, setCustomAccentColor] = useState<string | null>(
		() => {
			if (typeof window !== "undefined")
				return localStorage.getItem("accentColor") || null;
			return null;
		},
	);

	const handleAvatarNameChange = (name: string) => {
		setAvatarName(name);
		localStorage.setItem("avatarName", name);
	};
	const handleAccentColorChange = (color: string) => {
		setCustomAccentColor(color);
		localStorage.setItem("accentColor", color);
	};
	const handlePersonaChange = (personaId: string) => {
		setActivePersonaId(personaId);
		localStorage.setItem("activePersonaId", personaId);
	};

	// Adaptive accent based on current face variant (or custom override)
	const variantColor = VARIANT_COLORS[faceVariant];
	const accentColor = customAccentColor ?? variantColor;

	const applyLiveEmotionFromText = (text: string) => {
		if (!text.trim()) return;
		const nextEmotion = emotionFromText(text);
		setBaseEmotion(nextEmotion);
		baseEmotionRef.current = nextEmotion;
		targetEmotionRef.current = nextEmotion;
		setCurrentEmotion(nextEmotion);
	};

	const {
		levels,
		connectMicrophone,
		disconnect: disconnectAudio,
	} = useAudioAnalysis();

	const { voiceState, voiceError, toggleMic, interrupt } = useVoiceConversation({
		activePersonaId,
		personaTuning,
		onTranscriptChange: setLiveTranscript,
		onVoiceUserMessage: (message) => {
			setVoiceMessages((prev) => [
				...prev,
				{ id: `voice-user:${message.id}`, role: "user", content: message.content },
			]);
			if (emotionSourceMode === "live") {
				applyLiveEmotionFromText(message.content);
			}
		},
		onVoiceAssistantStart: (message) => {
			setVoiceMessages((prev) => [
				...prev,
				{ id: `voice-assistant:${message.id}`, role: "assistant", content: "" },
			]);
		},
		onVoiceAssistantUpdate: (message) => {
			setVoiceMessages((prev) =>
				prev.map((item) =>
					item.id === `voice-assistant:${message.id}`
						? { ...item, content: message.content }
						: item,
				),
			);
		},
		onVoiceAssistantComplete: (message) => {
			setVoiceMessages((prev) =>
				prev.map((item) =>
					item.id === `voice-assistant:${message.id}`
						? { ...item, content: message.content }
						: item,
				),
			);
			if (emotionSourceMode === "live") {
				applyLiveEmotionFromText(message.content);
			}
		},
		onAudioLevelsChange: (ttsLevels) => {
			setAudioLevels(ttsLevels);
			setVoiceLevel(ttsLevels.overall);
		},
	});

	// Ref mirror so the mic-levels effect below never reads stale voiceState
	const voiceStateRef = useRef(voiceState);
	useEffect(() => {
		voiceStateRef.current = voiceState;
	}, [voiceState]);

	// Pass mic levels to avatar — skip while TTS is playing (hook drives them)
	useEffect(() => {
		if (voiceStateRef.current === "speaking") return;
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
		const refreshKeyState = () => setHasKeys(getAllKeys().length > 0);

		setMounted(true);
		refreshKeyState();
		setIsOnboardingOpen(
			localStorage.getItem("dot_onboarding_done") !== "true",
		);
		window.addEventListener("storage", refreshKeyState);
		window.addEventListener(KEY_STORE_CHANGE_EVENT, refreshKeyState);
		return () => {
			window.removeEventListener("storage", refreshKeyState);
			window.removeEventListener(KEY_STORE_CHANGE_EVENT, refreshKeyState);
		};
	}, []);

	useEffect(() => {
		baseEmotionRef.current = baseEmotion;
	}, [baseEmotion]);

	// Animation Loop
	useEffect(() => {
		let frameId: number;
		const step = () => {
			setCurrentEmotion((prev) => {
				const next = lerpEmotion(prev, targetEmotionRef.current, 0.08);
				const newBase = lerpEmotion(
					baseEmotionRef.current,
					next,
					0.015,
				);
				baseEmotionRef.current = newBase;
				setBaseEmotion(newBase);
				return next;
			});
			frameId = requestAnimationFrame(step);
		};
		frameId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frameId);
	}, []);

	// Voice level from mic — skip while TTS is playing
	useEffect(() => {
		if (voiceStateRef.current === "speaking") return;
		setVoiceLevel(levels?.overall ?? 0);
	}, [levels]);

	// Debug / Rapid Switch: Cycle variants with 'v' key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key.toLowerCase() === "v" &&
				!e.repeat &&
				!isCustomizationOpen
			) {
				setFaceVariant((prev) => {
					const variants: FaceVariant[] = [
						"minimal",
						"tron",
						"analogue",
					];
					const idx = variants.indexOf(prev);
					const nextIdx = (idx + 1) % variants.length;
					return variants[nextIdx];
				});
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isCustomizationOpen]);

	const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (emotionSourceMode === "live") return;
		if (typeof window === "undefined") return;

		const { innerWidth, innerHeight } = window;
		const nx = Math.max(
			-1,
			Math.min(1, (e.clientX - innerWidth / 2) / (innerWidth * 0.25)),
		);
		const ny = Math.max(
			-1,
			Math.min(1, (e.clientY - innerHeight / 2) / (innerHeight * 0.25)),
		);
		const r = Math.min(1, Math.hypot(nx, ny));
		const deadZone = 0.18;
		const intensity =
			r <= deadZone ? 0 : smooth01((r - deadZone) / (1 - deadZone));

		const pointerTarget: EmotionState = {
			joy: smooth01(-ny) * intensity,
			sadness: smooth01(ny) * intensity,
			surprise: smooth01(Math.abs(ny) * 0.6) * 0.7 * intensity,
			anger:
				smooth01(Math.max(0, Math.abs(nx) - 0.55) / 0.45) *
				0.65 *
				intensity,
			curiosity: smooth01(Math.abs(nx)) * intensity,
		};

		const weightPointer = 0.6;
		const base = baseEmotionRef.current;
		targetEmotionRef.current = {
			joy:
				base.joy * (1 - weightPointer) +
				pointerTarget.joy * weightPointer,
			sadness:
				base.sadness * (1 - weightPointer) +
				pointerTarget.sadness * weightPointer,
			surprise:
				base.surprise * (1 - weightPointer) +
				pointerTarget.surprise * weightPointer,
			anger:
				base.anger * (1 - weightPointer) +
				pointerTarget.anger * weightPointer,
			curiosity:
				base.curiosity * (1 - weightPointer) +
				pointerTarget.curiosity * weightPointer,
		};
	};

	const handlePointerLeave = () => {
		if (emotionSourceMode === "live") return;
		targetEmotionRef.current = baseEmotionRef.current;
	};

	const applyPreset = (id: string) => {
		if (emotionSourceMode === "live") return;
		const preset = EMOTION_PRESETS.find((p) => p.id === id);
		if (!preset) return;
		setActivePresetId(id);
		setBaseEmotion(preset.state);
		baseEmotionRef.current = preset.state;
		targetEmotionRef.current = preset.state;
		setCurrentEmotion(preset.state);
	};

	const cyclePreset = (direction: number) => {
		const index = EMOTION_PRESETS.findIndex((p) => p.id === activePresetId);
		const safeIndex = index === -1 ? 0 : index;
		let nextIndex = safeIndex + direction;
		if (nextIndex >= EMOTION_PRESETS.length) nextIndex = 0;
		if (nextIndex < 0) nextIndex = EMOTION_PRESETS.length - 1;
		applyPreset(EMOTION_PRESETS[nextIndex].id);
	};

	const completeOnboarding = () => {
		localStorage.setItem("dot_onboarding_done", "true");
		setIsOnboardingOpen(false);
	};

	const switchEmotionSourceMode = (mode: EmotionSourceMode) => {
		setEmotionSourceMode(mode);
		if (mode === "live") {
			setBaseEmotion(NEUTRAL_EMOTION);
			baseEmotionRef.current = NEUTRAL_EMOTION;
			targetEmotionRef.current = NEUTRAL_EMOTION;
			setCurrentEmotion(NEUTRAL_EMOTION);
			setActivePresetId("neutral");
		}
	};

	const personaAvatarBias = getPersonaAvatarBias(
		activePersonaId,
		personaTuning,
	);
	const displayedEmotion: EmotionState = {
		joy: clamp01(currentEmotion.joy + personaAvatarBias.joy),
		sadness: clamp01(currentEmotion.sadness + personaAvatarBias.sadness),
		surprise: clamp01(currentEmotion.surprise + personaAvatarBias.surprise),
		anger: clamp01(currentEmotion.anger + personaAvatarBias.anger),
		curiosity: clamp01(
			currentEmotion.curiosity + personaAvatarBias.curiosity,
		),
	};

	return (
		<div
			ref={constraintsRef}
			className="flex h-dvh w-full overflow-hidden bg-background font-sans relative"
		>
			{/* BACKGROUND & ATMOSPHERE */}
			<div
				className="absolute inset-0 w-full h-full text-foreground flex flex-col items-center justify-center transition-colors duration-500"
				onMouseMove={handlePointerMove}
				onMouseLeave={handlePointerLeave}
				onTouchMove={(e) => {
					// Handle touch events for emotion mapping on mobile
					if (e.touches.length === 1) {
						const touch = e.touches[0];
						const syntheticEvent = {
							clientX: touch.clientX,
							clientY: touch.clientY,
						} as React.MouseEvent<HTMLDivElement>;
						handlePointerMove(syntheticEvent);
					}
				}}
				onTouchEnd={handlePointerLeave}
			>
				{/* Washi paper texture */}
				<div className="absolute inset-0 bg-washi pointer-events-none" />
				{/* Faint accent color wash — visible in both light & dark */}
				<div
					className="absolute inset-0 pointer-events-none transition-all duration-700"
					style={{
						background: `radial-gradient(ellipse at 50% 40%, ${accentColor}10 0%, transparent 70%)`,
					}}
				/>
				{/* HEADER UI */}
				<div className="absolute top-[max(12px,env(safe-area-inset-top))] left-3 sm:top-8 sm:left-6 z-50 flex items-center gap-3 select-none">
					<div className="flex flex-col items-start gap-2">
						{/* Branding */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{
								delay: 0.2,
								type: "spring",
								damping: 25,
								stiffness: 300,
							}}
							className="nt-surface flex h-10 cursor-default items-center gap-2.5 rounded-[8px] px-4 sm:h-12 sm:px-6"
						>
							<span
								className="text-[16px] leading-none tracking-[0.06em] text-[var(--fg)] sm:text-[18px]"
								style={{ fontFamily: "var(--font-display)" }}
							>
								{avatarName}
							</span>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								delay: 0.26,
								type: "spring",
								damping: 26,
								stiffness: 280,
							}}
							className="nt-recess flex flex-col gap-1 rounded-[6px] px-3 py-1.5"
						>
							<span className="label leading-none">PERSONA</span>
							<span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--fg)]">
								{activePersonaId.replace("-", " ")}
							</span>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								delay: 0.3,
								type: "spring",
								damping: 26,
								stiffness: 280,
							}}
							className="nt-recess flex gap-1 rounded-[8px] p-1"
						>
							{([
								{ id: "demo", label: "DEMO" },
								{ id: "live", label: "LIVE" },
							] as const).map((mode) => {
								const active = emotionSourceMode === mode.id;
								return (
									<button
										key={mode.id}
										type="button"
										onClick={() => switchEmotionSourceMode(mode.id)}
										className="nt-btn h-7 rounded-[5px] px-3 text-[8px] tracking-[0.18em]"
										style={
											active
												? ({
														background: "var(--fg)",
														borderColor: "var(--fg)",
														color: "var(--bg)",
													} as React.CSSProperties)
												: undefined
										}
										title={
											mode.id === "demo"
												? "Cursor and manual demos drive avatar mood"
												: "Conversation text drives avatar mood"
										}
									>
										{mode.label}
									</button>
								);
							})}
						</motion.div>
					</div>
				</div>
				<div className="absolute top-[max(12px,env(safe-area-inset-top))] right-3 sm:top-8 sm:right-6 z-50 nt-recess flex items-center gap-1.5 rounded-[8px] p-1.5">
					{/* Theme Toggle */}
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: 0.25,
							type: "spring",
							damping: 25,
							stiffness: 300,
						}}
						onClick={() =>
							setTheme(theme === "dark" ? "light" : "dark")
						}
						className="nt-btn size-10 rounded-[5px] touch-manipulation"
						title="Toggle Theme"
						aria-label="Toggle theme"
					>
						{mounted && theme === "dark" ? (
							<RiMoonFill className="size-[17px]" />
						) : (
							<RiSunFill className="size-[17px]" />
						)}
					</motion.button>
					{/* Memory Button */}
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: 0.28,
							type: "spring",
							damping: 25,
							stiffness: 300,
						}}
						onClick={() => setIsMemoryOpen(true)}
						className="nt-btn size-10 rounded-[5px] touch-manipulation"
						title="Memory Core"
					>
						<Database className="size-[17px]" strokeWidth={1.5} />
					</motion.button>
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: 0.29,
							type: "spring",
							damping: 25,
							stiffness: 300,
						}}
						onClick={() => setIsRitualOpen(true)}
						className="nt-btn size-10 rounded-[5px] touch-manipulation"
						title="Rituals"
					>
						<Calendar className="size-[17px]" strokeWidth={1.5} />
					</motion.button>
					{/* Audio Lab Button */}
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: 0.295,
							type: "spring",
							damping: 25,
							stiffness: 300,
						}}
						onClick={() => setIsAudioLabOpen(true)}
						className="nt-btn size-10 rounded-[5px] touch-manipulation"
						title="Audio Lab"
					>
						<AudioWaveform className="size-[17px]" strokeWidth={1.5} />
					</motion.button>
					{/* Settings Button */}
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: 0.3,
							type: "spring",
							damping: 25,
							stiffness: 300,
						}}
						onClick={() => setIsCustomizationOpen(true)}
						className="nt-btn relative size-10 rounded-[5px] touch-manipulation"
						title="Settings"
					>
						<RiSettings4Fill className="size-[17px]" />
						{mounted && !hasKeys && (
							<span className="absolute -right-0.5 -top-0.5 size-2 bg-[var(--accent)] animate-pulse" />
						)}
					</motion.button>
				</div>
				{/* CENTER STAGE (Avatar) */}
				<motion.div
					className="absolute inset-0 touch-none flex items-center justify-center z-0"
					style={{ zIndex: 0 }}
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.18}
					onDragEnd={(_, info: PanInfo) => {
						const threshold = 60;
						if (info.offset.x < -threshold) {
							cyclePreset(1);
						} else if (info.offset.x > threshold) {
							cyclePreset(-1);
						}
					}}
				>
					<div
						ref={avatarStageRef}
						className="w-full sm:w-[90vw] md:w-[80vw] lg:w-[62vw] max-w-[820px] aspect-[360/250] flex items-center justify-center pointer-events-auto"
					>
						<Avatar
							emotion={displayedEmotion}
							voiceEnabled={voiceEnabled}
							voiceLevel={voiceLevel}
							audioLevels={audioLevels}
							variant={faceVariant}
							accentColor={customAccentColor ?? undefined}
						/>
					</div>
				</motion.div>
				{/* BOTTOM UI (Playful Dock) */}{" "}
				<FloatingDock
					voiceEnabled={voiceEnabled}
					onVoiceToggle={() => setVoiceEnabled((v) => !v)}
					presetLabel={
						EMOTION_PRESETS.find((p) => p.id === activePresetId)
							?.label ?? "NEUTRAL"
					}
					isChatOpen={isChatOpen}
					onToggleChat={() => setIsChatOpen((v) => !v)}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
					voiceState={voiceState}
					voiceError={voiceError}
					liveTranscript={liveTranscript}
					onToggleMic={toggleMic}
					onInterrupt={interrupt}
				/>
				{/* Settings Modal */}
				<CustomizationModal
					isOpen={isCustomizationOpen}
					onClose={() => setIsCustomizationOpen(false)}
					currentVariant={faceVariant}
					onVariantChange={setFaceVariant}
					avatarName={avatarName}
					onAvatarNameChange={handleAvatarNameChange}
					accentColor={accentColor}
					onAccentColorChange={handleAccentColorChange}
					activePersonaId={activePersonaId}
					onPersonaChange={handlePersonaChange}
					personaTuning={personaTuning}
					onPersonaTuningChange={updatePersonaTuning}
					constraintsRef={constraintsRef}
				/>
				{/* Memory Drawer */}
				<MemoryDrawer
					open={isMemoryOpen}
					onOpenChange={setIsMemoryOpen}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
				/>
				<RitualDrawer
					open={isRitualOpen}
					onOpenChange={setIsRitualOpen}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
				/>
				{/* Audio Lab */}
				<AudioLab
					open={isAudioLabOpen}
					onOpenChange={setIsAudioLabOpen}
					onEmotionChange={(emotion) => {
						if (emotionSourceMode !== "demo") return;
						setBaseEmotion(emotion);
						baseEmotionRef.current = emotion;
						targetEmotionRef.current = emotion;
					}}
					onAudioLevelsChange={setAudioLevels}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
				/>
				{/* Chat Module */}
				<ChatModule
					open={isChatOpen}
					onOpenChange={setIsChatOpen}
					onEmotionChange={(emotion) => {
						if (emotionSourceMode !== "live") return;
						setBaseEmotion(emotion);
						baseEmotionRef.current = emotion;
						targetEmotionRef.current = emotion;
					}}
					externalMessages={voiceMessages}
					liveTranscript={liveTranscript}
					voiceState={voiceState}
					activePersonaId={activePersonaId}
					personaTuning={personaTuning}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
					onOpenSettings={() => { setIsChatOpen(false); setIsCustomizationOpen(true); }}
				/>
				{/* Share Dock */}
				<ShareDock
					targetRef={avatarStageRef}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
				/>
				<AnimatePresence>
					{mounted && isOnboardingOpen && (
						<motion.div
							initial={{ opacity: 0, y: 12, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 12, scale: 0.96 }}
							transition={{
								type: "spring",
								damping: 26,
								stiffness: 280,
							}}
							className="absolute left-3 right-3 sm:left-auto sm:right-6 top-[calc(max(64px,env(safe-area-inset-top))+56px)] sm:top-28 sm:w-[340px] te-module te-safe-panel z-[110]"
						>
							<div className="te-module-header">
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-[var(--te-orange)]" />
									<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
										BOOT_SEQ
									</span>
								</div>
								<button
									onClick={completeOnboarding}
									className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-orange)]"
									aria-label="Close onboarding"
								>
									<span className="text-[10px]">X</span>
								</button>
							</div>
							<div className="p-4 bg-[var(--panel-bg)] flex flex-col gap-3">
								<div className="te-lcd p-3">
									<p className="text-[10px] leading-relaxed">
										DOT IS LOCAL-FIRST. ADD YOUR KEYS, ENABLE
										MEMORY IF YOU WANT PERSONALIZATION, THEN
										TEST VOICE.
									</p>
								</div>
								<div className="grid grid-cols-2 gap-2">
									{[
										{
											label: "AI_KEYS",
											ok: hasKeys,
										},
										{
											label: "VOICE",
											ok: voiceEnabled,
										},
										{
											label: "MEMORY",
											ok:
												typeof window !== "undefined" &&
												localStorage.getItem(
													"dot_memory_enabled",
												) !== "false",
										},
										{
											label: "PERSONA",
											ok: !!activePersonaId,
										},
									].map((item) => (
										<div
											key={item.label}
											className="te-recessed p-2 flex items-center justify-between"
										>
											<span className="te-label">
												{item.label}
											</span>
											<span
												className="size-2 rounded-full"
												style={{
													backgroundColor: item.ok
														? "var(--te-green)"
														: "var(--te-orange)",
													boxShadow: item.ok
														? "0 0 8px var(--te-green)"
														: "0 0 8px var(--te-orange)",
												}}
											/>
										</div>
									))}
								</div>
								<div className="grid grid-cols-2 gap-2">
									<button
										onClick={() => {
											setIsCustomizationOpen(true);
										}}
										className="h-10 te-button rounded-[8px] text-[9px]"
									>
										SET_KEYS
									</button>
									<button
										onClick={() => {
											localStorage.setItem(
												"dot_memory_enabled",
												"true",
											);
											setIsMemoryOpen(true);
										}}
										className="h-10 te-button rounded-[8px] text-[9px]"
									>
										MEMORY
									</button>
									<button
										onClick={toggleMic}
										className="h-10 te-button rounded-[8px] text-[9px]"
									>
										VOICE_TEST
									</button>
									<button
										onClick={completeOnboarding}
										className="h-10 te-button rounded-[8px] text-[9px]"
										style={
											{
												"--key-bg":
													"var(--te-green)",
												"--key-border":
													"color-mix(in srgb, var(--te-green) 80%, black)",
												"--key-shadow":
													"color-mix(in srgb, var(--te-green) 60%, black)",
												color: "#ffffff",
											} as React.CSSProperties
										}
									>
										DONE
									</button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				{/* External links */}
				<div className="absolute left-3 sm:left-6 bottom-[calc(max(16px,env(safe-area-inset-bottom))+78px)] sm:bottom-10 z-[70] pointer-events-auto">
					<div className="nt-recess flex flex-col items-start gap-1 rounded-[8px] p-1.5">
						{[
							{
								icon: (
									<RiGlobalLine className="size-[15px] sm:size-4 shrink-0" />
								),
								label: "xoboid.com",
								href: "https://xoboid.com",
								delay: 0.4,
							},
							{
								icon: (
									<SiGithub className="size-[15px] sm:size-4 shrink-0" />
								),
								label: "source",
								href: "https://github.com/x0bd/proto-0",
								delay: 0.48,
							},
							{
								icon: (
									<SiNpm className="size-[17px] sm:size-[19px] shrink-0" />
								),
								label: "@xoboid/avatar",
								href: "https://www.npmjs.com/package/@xoboid/avatar",
								delay: 0.56,
							},
						].map(({ icon, label, href, delay }) => (
							<motion.button
								key={label}
								initial={{ opacity: 0, x: -8 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									delay,
									type: "spring",
									damping: 28,
									stiffness: 280,
								}}
								onClick={() =>
									window.open(
										href,
										"_blank",
										"noopener,noreferrer",
									)
								}
								className="nt-btn h-10 w-full justify-start gap-2 rounded-[5px] px-3 touch-manipulation sm:h-auto sm:px-3.5 sm:py-2.5"
								aria-label={`Open ${label}`}
								title={label}
							>
								{icon}
								<span className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase leading-none">
									{label}
								</span>
							</motion.button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
