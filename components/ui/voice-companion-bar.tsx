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
    showTranscript: boolean;
    onToggleTranscript: () => void;
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
    showTranscript,
    onToggleTranscript,
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
        <div className={cn("relative z-50 flex items-center gap-3 p-3 te-panel", className)}>
            {/* Dynamic Status LCD */}
            <div className="te-lcd px-4 py-2.5 flex flex-col justify-center min-w-[120px] h-[52px]">
                <div className="text-[8px] opacity-60 mb-0.5">STATUS</div>
                <div className="flex items-center gap-2">
                    {isListening ? (
                        <>
                            <div className="size-2 rounded-full bg-[var(--te-orange)] animate-pulse" />
                            <span className="text-[12px]">REC...</span>
                        </>
                    ) : isThinking ? (
                        <>
                            <div className="size-2 rounded-full bg-[var(--te-yellow)] animate-pulse" />
                            <span className="text-[12px]">PROC...</span>
                        </>
                    ) : isSpeaking ? (
                        <>
                            <div className="size-2 rounded-full bg-[var(--te-blue)] animate-pulse" />
                            <span className="text-[12px]">PLAY...</span>
                        </>
                    ) : isError ? (
                        <>
                            <div className="size-2 rounded-full bg-[var(--te-orange)]" />
                            <span className="text-[12px]">ERR_01</span>
                        </>
                    ) : (
                        <>
                            <div className="size-2 rounded-full bg-current opacity-20" />
                            <span className="text-[12px] opacity-50">IDLE</span>
                        </>
                    )}
                </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center gap-2 te-recessed p-2">
                {/* Mute Toggle */}
                <button
                    onClick={onToggleMute}
                    className="size-10 te-button text-foreground/70"
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
                    onClick={isSpeaking || isThinking ? onInterrupt : onToggleMic}
                    className="w-16 h-10 te-button"
                    style={{
                        backgroundColor: isListening || isSpeaking || isThinking ? "var(--te-orange)" : "var(--key-bg)",
                        color: isListening || isSpeaking || isThinking ? "#fff" : "var(--foreground)",
                        borderColor: isListening || isSpeaking || isThinking ? "var(--te-orange)" : "var(--key-border)",
                    }}
                >
                    {isSpeaking || isThinking ? (
                        <SquareSquare className="size-[16px] fill-current" />
                    ) : (
                        <Mic className="size-[18px]" />
                    )}
                </button>

                {/* Transcript Toggle */}
                <button
                    onClick={onToggleTranscript}
                    className="size-10 te-button text-foreground/70"
                    style={showTranscript ? { color: "var(--te-blue)" } : {}}
                    title={showTranscript ? "Hide Transcript" : "Show Transcript"}
                >
                    <MessageSquareText className="size-[16px]" />
                </button>
            </div>

            {/* Settings Button */}
            <button
                onClick={onOpenSettings}
                className="size-12 te-button rounded-full"
                title="Voice Settings"
            >
                <SlidersHorizontal className="size-[16px]" />
            </button>
        </div>
    );
}
