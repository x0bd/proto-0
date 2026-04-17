"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
	Mic,
	SquareSquare,
	Volume2,
	VolumeX,
	MessageSquareText,
	SlidersHorizontal,
} from "lucide-react";

export type VoiceState =
	| "idle"
	| "listening"
	| "thinking"
	| "speaking"
	| "error";

interface VoiceCompanionBarProps {
	state: VoiceState;
	onToggleMic: () => void;
	onInterrupt: () => void;
	isChatOpen: boolean;
	onToggleChat: () => void;
	isMuted: boolean;
	onToggleMute: () => void;
	onOpenSettings: () => void;
	accentColor?: string;
	className?: string;
}

export function VoiceCompanionBar({
	state,
	onToggleMic,
	onInterrupt,
	isChatOpen,
	onToggleChat,
	isMuted,
	onToggleMute,
	onOpenSettings,
	accentColor = "#7c3aed",
	className,
}: VoiceCompanionBarProps) {
	// State maps to UI behavior
	const isListening = state === "listening";
	const isSpeaking = state === "speaking";
	const isThinking = state === "thinking";
	const isError = state === "error";

	return (
		<div
			className={cn(
				"relative z-50 flex items-center gap-3 p-2 pr-2.5 te-panel",
				className,
			)}
		>
			{/* Dynamic Status LCD */}
			<div className="te-lcd px-3.5 py-2 flex flex-col justify-center min-w-[110px] h-[48px] relative overflow-hidden shrink-0">
				{/* Subtle glass reflection for realism */}
				<div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
				
				<div className="text-[8px] opacity-50 mb-0.5 tracking-[0.2em] font-bold">STATUS</div>
				<div className="flex items-center gap-2">
					{isListening ? (
						<>
							<div className="size-2 rounded-full bg-[var(--te-orange)] animate-pulse shadow-[0_0_8px_var(--te-orange)]" />
							<span className="text-[12px] font-bold">REC...</span>
						</>
					) : isThinking ? (
						<>
							<div className="size-2 rounded-full bg-[var(--te-yellow)] animate-pulse shadow-[0_0_8px_var(--te-yellow)]" />
							<span className="text-[12px] font-bold">PROC...</span>
						</>
					) : isSpeaking ? (
						<>
							<div className="size-2 rounded-full bg-[var(--te-blue)] animate-pulse shadow-[0_0_8px_var(--te-blue)]" />
							<span className="text-[12px] font-bold">PLAY...</span>
						</>
					) : isError ? (
						<>
							<div className="size-2 rounded-full bg-[var(--te-orange)] shadow-[0_0_8px_var(--te-orange)]" />
							<span className="text-[12px] font-bold">ERR_01</span>
						</>
					) : (
						<>
							<div className="size-2 rounded-full bg-current opacity-20" />
							<span className="text-[12px] opacity-50 font-bold">IDLE</span>
						</>
					)}
				</div>
			</div>

			{/* Transport Controls */}
			<div className="flex items-center gap-1.5 te-recessed p-1.5 shrink-0">
				{/* Mute Toggle */}
				<button
					onClick={onToggleMute}
					className="w-12 h-10 te-button text-foreground/70 rounded-[10px]"
					title={isMuted ? "Unmute" : "Mute"}
				>
					{isMuted ? (
						<VolumeX className="size-[16px]" />
					) : (
						<Volume2 className="size-[16px]" />
					)}
				</button>

				{/* Main Action (Record / Stop) */}
				<button
					onClick={
						isSpeaking || isThinking ? onInterrupt : onToggleMic
					}
					className="w-16 h-10 te-button rounded-[10px]"
					style={
						(isListening || isSpeaking || isThinking)
							? ({
									"--key-bg": "var(--te-orange)",
									"--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
									"--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
									color: "#ffffff",
							  } as React.CSSProperties)
							: undefined
					}
				>
					{isSpeaking || isThinking ? (
						<SquareSquare className="size-[16px] fill-current" />
					) : (
						<Mic className="size-[18px]" />
					)}
				</button>

				{/* Chat Toggle */}
				<button
					onClick={onToggleChat}
					className="w-12 h-10 te-button text-foreground/70 rounded-[10px]"
					style={
						isChatOpen
							? ({
									"--key-bg": "var(--te-blue)",
									"--key-border": "color-mix(in srgb, var(--te-blue) 80%, black)",
									"--key-shadow": "color-mix(in srgb, var(--te-blue) 60%, black)",
									color: "#ffffff",
							  } as React.CSSProperties)
							: undefined
					}
					title={
						isChatOpen ? "Close Chat" : "Open Chat"
					}
				>
					<MessageSquareText className="size-[16px]" />
				</button>
			</div>

			{/* Settings Button */}
			<button
				onClick={onOpenSettings}
				className="size-12 te-button rounded-full shrink-0"
				title="Voice Settings"
			>
				<SlidersHorizontal className="size-[16px]" />
			</button>
		</div>
	);
}
