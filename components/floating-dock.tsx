"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { VoiceCompanionBar, VoiceState } from "./ui/voice-companion-bar";

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
    // Temporary mock state to demonstrate the UI
    const [voiceState, setVoiceState] = React.useState<VoiceState>("idle");

    return (
        <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-4 w-full max-w-[calc(100vw-2rem)] px-4">
            <VoiceCompanionBar
                state={voiceState}
                onToggleMic={() =>
                    setVoiceState(voiceState === "idle" ? "listening" : "idle")
                }
                onInterrupt={() => setVoiceState("idle")}
                onToggleMode={() => {}}
                isMuted={!voiceEnabled}
                onToggleMute={onVoiceToggle}
                accentColor={accentColor}
            />
        </div>
    );
}
