"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion, type PanInfo } from "motion/react";
import Avatar from "./components/Avatar";
import { CustomizationModal } from "./components/CustomizationModal";
import { DownloadButton } from "./components/DownloadButton";
import { FloatingDock } from "@/components/floating-dock";
import {
	IoMoonOutline,
	IoSettingsOutline,
	IoSunnyOutline,
} from "react-icons/io5";
import { cn } from "@/lib/utils";
import { FaceVariant, EmotionState } from "./components/face/types";
import { VARIANT_COLORS, VARIANT_GLOW } from "./components/face/themes";
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
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	// Adaptive accent based on current face variant
	const variantColor = VARIANT_COLORS[faceVariant];
	const variantGlow = VARIANT_GLOW[faceVariant];

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
						"myst",
						"flux",
						"echo",
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
		<div className="flex h-dvh w-full overflow-hidden bg-background font-sans relative">
			{/* BACKGROUND & ATMOSPHERE */}
			<div
				className="absolute inset-0 w-full h-full text-foreground flex flex-col items-center justify-center transition-colors duration-500 bg-dot-pattern bg-dot-fade"
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
				{/* Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

				{/* Variant color aura — smooth.js style floating blob */}
				<div
					className="absolute inset-0 pointer-events-none transition-all duration-700"
					style={{
						background: `radial-gradient(ellipse 55% 45% at 50% 55%, ${variantGlow} 0%, transparent 70%)`,
					}}
				/>

				{/* HEADER UI */}
				<div className="absolute top-4 left-2 sm:top-10 sm:left-6 z-50 flex items-center gap-3 select-none">
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
						className="flex items-center gap-2.5 rounded-full px-4 sm:px-6 h-10 sm:h-12 bg-background border shadow-premium hover:shadow-lg transition-all duration-300 group cursor-default"
						style={{ borderColor: `${variantColor}40` }}
					>
						<span
							className="logo-font font-bold text-xs sm:text-sm leading-none tracking-[0.2em] pl-1 transition-colors"
							style={{ color: variantColor }}
						>
							DOT
						</span>
					</motion.div>
				</div>

				<div className="absolute top-4 right-2 sm:top-10 sm:right-6 z-50 flex items-center gap-2 sm:gap-2.5">
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
						className="size-10 sm:size-10 rounded-full flex items-center justify-center bg-background border-2 shadow-premium hover:shadow-lg transition-all duration-300 active:scale-95 touch-manipulation"
						style={{
							borderColor: `${variantColor}50`,
							color: variantColor,
						}}
						title="Toggle Theme"
						aria-label="Toggle theme"
					>
						{mounted && theme === "dark" ? (
							<IoMoonOutline className="size-4 sm:size-4.5" />
						) : (
							<IoSunnyOutline className="size-4 sm:size-4.5" />
						)}
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
						className="size-10 sm:size-10 rounded-full flex items-center justify-center bg-background border-2 shadow-premium hover:shadow-lg transition-all duration-300 active:scale-95 touch-manipulation"
						style={{
							borderColor: `${variantColor}50`,
							color: variantColor,
						}}
						title="Settings"
					>
						<IoSettingsOutline className="size-4 sm:size-4.5" />
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

				{/* BOTTOM UI (Playful Dock) */}
				<FloatingDock
					voiceEnabled={voiceEnabled}
					onVoiceToggle={() => setVoiceEnabled((v) => !v)}
					presetLabel={
						EMOTION_PRESETS.find((p) => p.id === activePresetId)
							?.label ?? "NEUTRAL"
					}
					accentColor={variantColor}
				/>

				{/* Settings Modal */}
				<CustomizationModal
					isOpen={isCustomizationOpen}
					onClose={() => setIsCustomizationOpen(false)}
					currentVariant={faceVariant}
					onVariantChange={setFaceVariant}
				/>

				{/* Download Button */}
				<DownloadButton targetRef={avatarStageRef} />
			</div>
		</div>
	);
}
