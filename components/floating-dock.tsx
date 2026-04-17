"use client";

import * as React from "react";
import { VoiceCompanionBar, VoiceState } from "./ui/voice-companion-bar";
import { VoiceSettingsSheet } from "./ui/voice-settings-sheet";

interface FloatingDockProps {
    voiceEnabled: boolean;
    onVoiceToggle: () => void;
    presetLabel: string;
    showTranscript: boolean;
    onToggleTranscript: () => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

export function FloatingDock({
    voiceEnabled,
    onVoiceToggle,
    presetLabel,
    showTranscript,
    onToggleTranscript,
    accentColor = "#7C3AED",
    constraintsRef,
}: FloatingDockProps) {
    // Temporary mock state to demonstrate the UI
    const [voiceState, setVoiceState] = React.useState<VoiceState>("idle");
    const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = React.useState(false);

    return (
        <>
            <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-4 w-full max-w-[calc(100vw-2rem)] px-4">
                <VoiceCompanionBar
                    state={voiceState}
                    onToggleMic={() =>
                        setVoiceState(
                            voiceState === "idle" ? "listening" : "idle",
                        )
                    }
                    onInterrupt={() => setVoiceState("idle")}
                    showTranscript={showTranscript}
                    onToggleTranscript={onToggleTranscript}
                    isMuted={!voiceEnabled}
                    onToggleMute={onVoiceToggle}
                    onOpenSettings={() => setIsVoiceSettingsOpen(true)}
                    accentColor={accentColor}
                />
            </div>

            <VoiceSettingsSheet
                open={isVoiceSettingsOpen}
                onOpenChange={setIsVoiceSettingsOpen}
                accentColor={accentColor}
                constraintsRef={constraintsRef}
            />
        </>
    );
}
