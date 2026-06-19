"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
	Mic,
	Square,
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

export type VoiceErrorCode =
	| "NO_AI_KEY"
	| "MIC_UNSUPPORTED"
	| "MIC_ERROR"
	| "AI_ERROR"
	| "TTS_ERROR";

interface VoiceCompanionBarProps {
	state: VoiceState;
	onToggleMic: () => void;
	onInterrupt: () => void;
	isChatOpen: boolean;
	onToggleChat: () => void;
	isMuted: boolean;
	onToggleMute: () => void;
	onOpenSettings: () => void;
	errorCode?: VoiceErrorCode | null;
	liveTranscript?: string;
	accentColor?: string;
	className?: string;
}

const VOICE_ERROR_LABELS: Record<VoiceErrorCode, string> = {
	NO_AI_KEY: "NO_KEY",
	MIC_UNSUPPORTED: "NO_MIC",
	MIC_ERROR: "MIC_ERR",
	AI_ERROR: "AI_ERR",
	TTS_ERROR: "TTS_ERR",
};

/* status → { dot colour, readout label } — status colours encode data, exempt from one-accent rule */
const STATUS: Record<
	VoiceState,
	{ color: string; label: string; pulse: boolean }
> = {
	idle: { color: "var(--fg-faint)", label: "IDLE", pulse: false },
	listening: { color: "var(--accent)", label: "LISTENING", pulse: true },
	thinking: { color: "var(--warning)", label: "THINKING", pulse: true },
	speaking: { color: "var(--success)", label: "SPEAKING", pulse: true },
	error: { color: "var(--error)", label: "ERROR", pulse: false },
};

/* Active fill presets applied over .nt-btn */
const FILL_LIME: React.CSSProperties = {
	background: "var(--accent)",
	borderColor: "var(--accent)",
	color: "var(--accent-foreground)",
};
const FILL_INK: React.CSSProperties = {
	background: "var(--fg)",
	borderColor: "var(--fg)",
	color: "var(--bg)",
};

export function VoiceCompanionBar({
	state,
	onToggleMic,
	onInterrupt,
	isChatOpen,
	onToggleChat,
	isMuted,
	onToggleMute,
	onOpenSettings,
	errorCode,
	liveTranscript = "",
	className,
}: VoiceCompanionBarProps) {
	const isListening = state === "listening";
	const isSpeaking = state === "speaking";
	const isThinking = state === "thinking";
	const isBusy = isSpeaking || isThinking;

	const status = STATUS[state];
	const statusLabel =
		state === "error" && errorCode
			? VOICE_ERROR_LABELS[errorCode]
			: status.label;

	return (
		<div
			className={cn(
				"nt-surface relative z-50 flex items-center gap-2 rounded-[10px] p-2",
				className,
			)}
		>
			{/* ── Status readout ── */}
			<div className="nt-recess flex h-[46px] min-w-[116px] shrink-0 flex-col justify-center gap-1 rounded-[6px] px-3.5">
				<span className="label leading-none">STATUS</span>
				<div className="flex items-center gap-2">
					<span
						className={cn("size-2 shrink-0", status.pulse && "animate-pulse")}
						style={{ background: status.color }}
					/>
					<span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--fg)]">
						{statusLabel}
					</span>
				</div>
			</div>

			{/* ── Live transcript readout ── */}
			{liveTranscript && (
				<div className="nt-recess hidden h-[46px] min-w-[180px] max-w-[260px] shrink flex-col justify-center gap-1 rounded-[6px] px-3 sm:flex">
					<span className="label leading-none">TRANSCRIPT</span>
					<span className="truncate font-mono text-[10px] normal-case text-[var(--fg-muted)]">
						{liveTranscript}
					</span>
				</div>
			)}

			{/* ── Transport cluster ── */}
			<div className="nt-recess flex shrink-0 items-center gap-1 rounded-[8px] p-1">
				{/* Mute */}
				<button
					onClick={onToggleMute}
					className="nt-btn h-9 w-11 rounded-[5px]"
					style={isMuted ? { color: "var(--error)" } : undefined}
					title={isMuted ? "Unmute" : "Mute"}
					aria-label={isMuted ? "Unmute" : "Mute"}
				>
					{isMuted ? (
						<VolumeX className="size-[16px]" strokeWidth={1.5} />
					) : (
						<Volume2 className="size-[16px]" strokeWidth={1.5} />
					)}
				</button>

				{/* Main action — record / stop */}
				<button
					onClick={isBusy ? onInterrupt : onToggleMic}
					className="nt-btn h-9 w-16 rounded-[5px]"
					style={isListening ? FILL_LIME : isBusy ? FILL_INK : undefined}
					title={isBusy ? "Stop" : "Record"}
					aria-label={isBusy ? "Stop" : "Record"}
				>
					{isBusy ? (
						<Square className="size-[15px] fill-current" strokeWidth={1.5} />
					) : (
						<Mic className="size-[18px]" strokeWidth={1.5} />
					)}
				</button>

				{/* Chat */}
				<button
					onClick={onToggleChat}
					className="nt-btn h-9 w-11 rounded-[5px]"
					style={isChatOpen ? FILL_INK : undefined}
					title={isChatOpen ? "Close chat" : "Open chat"}
					aria-label={isChatOpen ? "Close chat" : "Open chat"}
				>
					<MessageSquareText className="size-[16px]" strokeWidth={1.5} />
				</button>
			</div>

			{/* ── Settings ── */}
			<button
				onClick={onOpenSettings}
				className="nt-btn size-[46px] shrink-0 rounded-[6px]"
				title="Voice settings"
				aria-label="Voice settings"
			>
				<SlidersHorizontal className="size-[16px]" strokeWidth={1.5} />
			</button>
		</div>
	);
}
