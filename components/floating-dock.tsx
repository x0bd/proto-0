"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
	RiVolumeUpFill,
	RiVolumeMuteFill,
	RiArrowLeftSLine,
	RiArrowRightSLine,
} from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";

interface FloatingDockProps {
	voiceEnabled: boolean;
	onVoiceToggle: () => void;
	presetLabel: string;
	accentColor?: string;
}

export function FloatingDock({
	voiceEnabled,
	onVoiceToggle,
	presetLabel,
	accentColor = "#7C3AED",
}: FloatingDockProps) {
	const [showHint, setShowHint] = React.useState(true);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setShowHint(false);
		}, 5000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[calc(100vw-2rem)] px-4">
			{/* Swipe Hint */}
			<AnimatePresence>
				{showHint && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{
							type: "spring",
							damping: 30,
							stiffness: 400,
						}}
						className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/95 border shadow-premium"
						style={{ borderColor: `${accentColor}30` }}
					>
						<RiArrowLeftSLine
							className="size-3.5 sm:size-4 shrink-0"
							style={{ color: accentColor }}
						/>
						<span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-foreground font-semibold whitespace-nowrap">
							Swipe to change
						</span>
						<RiArrowRightSLine
							className="size-3.5 sm:size-4 shrink-0"
							style={{ color: accentColor }}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Emotion Preset Pill */}
			<motion.div
				layout
				className="rounded-full px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 shadow-premium bg-background/95 backdrop-blur-md border-2 hover:scale-[1.02] transition-transform w-full max-w-fit"
				style={{ borderColor: `${accentColor}40` }}
			>
				{/* Voice Toggle */}
				<button
					onClick={onVoiceToggle}
					className={cn(
						"size-9 sm:size-10 rounded-full flex items-center justify-center transition-all duration-200 relative group touch-manipulation shrink-0 border-2",
					)}
					style={
						voiceEnabled
							? {
									backgroundColor: accentColor,
									borderColor: accentColor,
									color: "#FFFFFF",
								}
							: {
									backgroundColor: "transparent",
									borderColor: `${accentColor}40`,
									color: accentColor,
								}
					}
					title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
				>
					{voiceEnabled ? (
						<RiVolumeUpFill className="size-[18px]" />
					) : (
						<RiVolumeMuteFill className="size-[18px]" />
					)}
					{/* Tooltip */}
					<span className="absolute -top-11 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-foreground/95 text-background rounded-lg border border-foreground/10 shadow-premium text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
						{voiceEnabled ? "VOICE ON" : "VOICE OFF"}
					</span>
				</button>

				{/* Divider */}
				<div
					className="w-px h-6"
					style={{ backgroundColor: `${accentColor}25` }}
				/>

				{/* Current Emotion Preset */}
				<div className="flex items-center gap-2 sm:gap-2.5 px-1 min-w-0">
					<span
						className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] font-bold shrink-0"
						style={{ color: `${accentColor}99` }}
					>
						Mood
					</span>
					<span
						className="text-[10px] sm:text-[11px] font-bold tracking-widest truncate logo-font"
						style={{ color: accentColor }}
					>
						{presetLabel}
					</span>
				</div>
			</motion.div>
		</div>
	);
}
