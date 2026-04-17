"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo, AnimatePresence } from "motion/react";
import Avatar from "./components/Avatar";
import { CustomizationModal } from "./components/CustomizationModal";
import { ShareDock } from "./components/share-dock";
import { FloatingDock } from "@/components/floating-dock";
import { MemoryDrawer } from "./components/memory-drawer";
import { RitualDrawer } from "./components/ritual-drawer";
import { AudioLab } from "./components/audio-lab";
import { TranscriptPanel } from "@/components/ui/transcript-panel";
import { ActivePersonaChip } from "@/components/ui/active-persona-chip";
import { Database, Calendar, AudioWaveform } from "lucide-react";
import {
	RiMoonFill,
	RiSunFill,
	RiSettings4Fill,
	RiGlobalLine,
} from "react-icons/ri";
import { SiNpm, SiGithub } from "react-icons/si";
import { FaceVariant, EmotionState } from "./components/face/types";
import { VARIANT_COLORS } from "./components/face/themes";
import { useAudioAnalysis, type AudioLevels } from "@/hooks/useAudioAnalysis";
import { useTheme } from "next-themes";

const NEUTRAL_EMOTION: EmotionState = {
	joy: 0.3,
	sadness: 0,
	surprise: 0,
	anger: 0,
	curiosity: 0.2,
};

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
	const { theme, setTheme } = useTheme();

	const [isMemoryOpen, setIsMemoryOpen] = useState(false);
	const [isRitualOpen, setIsRitualOpen] = useState(false);
	const [isAudioLabOpen, setIsAudioLabOpen] = useState(false);
	const [showTranscript, setShowTranscript] = useState(true);
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

	const {
		levels,
		connectMicrophone,
		disconnect: disconnectAudio,
	} = useAudioAnalysis();

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

	// Voice level from real audio analysis
	useEffect(() => {
		if (levels?.overall) {
			setVoiceLevel(levels.overall);
		} else {
			setVoiceLevel(0);
		}
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
		targetEmotionRef.current = baseEmotionRef.current;
	};

	const applyPreset = (id: string) => {
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
							className="flex items-center gap-2.5 px-4 sm:px-6 h-10 sm:h-12 te-button group cursor-default"
						>
							<span
								className="logo-font font-bold text-xs sm:text-sm leading-none tracking-[0.2em] pl-1 transition-colors"
								style={{ color: accentColor }}
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
							className="te-lcd px-3 py-1.5"
						>
							<span className="text-[10px] tracking-widest">
								{activePersonaId.replace("-", " ")}
							</span>
						</motion.div>
					</div>
				</div>
				<div className="absolute top-[max(12px,env(safe-area-inset-top))] right-3 sm:top-8 sm:right-6 z-50 flex items-center gap-2 sm:gap-2.5 te-recessed p-2">
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
						className="size-10 sm:size-10 flex items-center justify-center te-button touch-manipulation"
						title="Toggle Theme"
						aria-label="Toggle theme"
					>
						{mounted && theme === "dark" ? (
							<RiMoonFill className="size-[18px] text-foreground/70" />
						) : (
							<RiSunFill className="size-[18px] text-foreground/70" />
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
						className="size-10 sm:size-10 flex items-center justify-center te-button touch-manipulation"
						title="Memory Core"
					>
						<Database className="size-[18px] text-foreground/70" />
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
						className="size-10 sm:size-10 flex items-center justify-center te-button touch-manipulation"
						title="Rituals"
					>
						<Calendar className="size-[18px] text-foreground/70" />
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
						className="size-10 sm:size-10 flex items-center justify-center te-button touch-manipulation"
						title="Audio Lab"
					>
						<AudioWaveform className="size-[18px] text-foreground/70" />
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
						className="size-10 sm:size-10 flex items-center justify-center te-button touch-manipulation"
						title="Settings"
					>
						<RiSettings4Fill className="size-[18px] text-foreground/70" />
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
							emotion={currentEmotion}
							voiceEnabled={voiceEnabled}
							voiceLevel={voiceLevel}
							audioLevels={audioLevels}
							variant={faceVariant}
							accentColor={customAccentColor ?? undefined}
						/>
					</div>
				</motion.div>
				<div className="absolute bottom-[100px] sm:bottom-[120px] w-full flex justify-center z-50 px-4 pointer-events-none">
					<AnimatePresence>
						{showTranscript && (
							<TranscriptPanel
								text="I remember you told me you prefer concise answers."
								isFinal={false}
								accentColor={accentColor}
								onClose={() => setShowTranscript(false)}
							/>
						)}
					</AnimatePresence>
				</div>
				{/* BOTTOM UI (Playful Dock) */}{" "}
				<FloatingDock
					voiceEnabled={voiceEnabled}
					onVoiceToggle={() => setVoiceEnabled((v) => !v)}
					presetLabel={
						EMOTION_PRESETS.find((p) => p.id === activePresetId)
							?.label ?? "NEUTRAL"
					}
					showTranscript={showTranscript}
					onToggleTranscript={() => setShowTranscript((v) => !v)}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
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
						setBaseEmotion(emotion);
						baseEmotionRef.current = emotion;
						targetEmotionRef.current = emotion;
					}}
					onAudioLevelsChange={setAudioLevels}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
				/>
				{/* Share Dock */}
				<ShareDock
					targetRef={avatarStageRef}
					accentColor={accentColor}
					constraintsRef={constraintsRef}
				/>
				{/* External links */}
				<div className="absolute left-3 sm:left-6 bottom-[calc(max(16px,env(safe-area-inset-bottom))+78px)] sm:bottom-10 z-[70] pointer-events-auto">
					<div className="flex flex-col items-start gap-2 te-recessed p-2">
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
								className="h-10 sm:h-auto flex items-center justify-start gap-2 px-3 sm:px-3.5 sm:py-2.5 te-button touch-manipulation text-foreground/70 hover:text-foreground"
								aria-label={`Open ${label}`}
								title={label}
							>
								{icon}
								<span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase leading-none">
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
