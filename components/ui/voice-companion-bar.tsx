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
    accentColor = "#7c3aed",
    className,
}: VoiceCompanionBarProps) {
    // State maps to UI behavior
    const isListening = state === "listening";
    const isSpeaking = state === "speaking";
    const isThinking = state === "thinking";
    const isError = state === "error";

    return (
        <div className={cn("relative z-50 flex items-center gap-2", className)}>
            {/* Dynamic Status Pill */}
            <AnimatePresence mode="popLayout">
                {state !== "idle" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -10 }}
                        className="hidden sm:flex absolute -top-12 left-1/2 -translate-x-1/2 items-center gap-2 px-4 py-2 rounded-full shadow-premium backdrop-blur-md border border-foreground/10"
                        style={{
                            backgroundColor: isError
                                ? "var(--color-destructive)"
                                : "var(--background)",
                            color: isError ? "#fff" : "var(--foreground)",
                        }}
                    >
                        {isListening && (
                            <>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                    }}
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <span className="text-xs font-medium tracking-wide">
                                    Listening...
                                </span>
                            </>
                        )}

                        {isThinking && (
                            <>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.6,
                                                delay: i * 0.1,
                                            }}
                                            className="size-1.5 rounded-full"
                                            style={{
                                                backgroundColor: accentColor,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium tracking-wide">
                                    Thinking...
                                </span>
                            </>
                        )}

                        {isSpeaking && (
                            <>
                                <Volume2
                                    className="size-3.5"
                                    style={{ color: accentColor }}
                                />
                                <span className="text-xs font-medium tracking-wide">
                                    Speaking...
                                </span>
                            </>
                        )}

                        {isError && (
                            <span className="text-xs font-medium tracking-wide">
                                Connection Error
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Bar */}
            <div
                className="flex items-center gap-2 p-2 rounded-full shadow-premium backdrop-blur-md bg-background/80 border-2"
                style={{ borderColor: `${accentColor}30` }}
            >
                {/* Left Toggle (Mute) */}
                <button
                    onClick={onToggleMute}
                    className="size-10 rounded-full flex items-center justify-center transition-colors hover:bg-foreground/5 text-foreground/70 hover:text-foreground active:scale-95"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? (
                        <VolumeX className="size-[18px]" />
                    ) : (
                        <Volume2 className="size-[18px]" />
                    )}
                </button>
                {/* Center Main Action (Mic / Stop) */}
                <button
                    onClick={
                        isSpeaking || isThinking ? onInterrupt : onToggleMic
                    }
                    className="relative size-12 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                    style={
                        isListening
                            ? {
                                  backgroundColor: accentColor,
                                  color: "#fff",
                                  boxShadow: `0 0 20px ${accentColor}80`,
                              }
                            : isSpeaking || isThinking
                              ? {
                                    backgroundColor: "var(--color-destructive)",
                                    color: "#fff",
                                }
                              : {
                                    backgroundColor: `${accentColor}15`,
                                    color: accentColor,
                                }
                    }
                >
                    {isListening && (
                        <motion.div
                            className="absolute inset-0 rounded-full border-2"
                            style={{ borderColor: accentColor }}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}

                    {isSpeaking || isThinking ? (
                        <SquareSquare className="size-5 fill-current" />
                    ) : (
                        <Mic className="size-[22px]" />
                    )}
                </button>
                {/* Right Toggle (Transcript) */}
                <button
                    onClick={onToggleTranscript}
                    className="relative size-10 rounded-full flex items-center justify-center transition-colors hover:bg-foreground/5 text-foreground/70 hover:text-foreground active:scale-95"
                    style={showTranscript ? { color: accentColor } : {}}
                    title={
                        showTranscript ? "Hide Transcript" : "Show Transcript"
                    }
                >
                    <MessageSquareText className="size-[18px]" />
                    {showTranscript && (
                        <motion.div
                            layoutId="transcript-active"
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full"
                            style={{ backgroundColor: accentColor }}
                        />
                    )}
                </button>{" "}
            </div>
        </div>
    );
}
