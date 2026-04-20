"use client";

import * as React from "react";
import { VoiceCompanionBar, VoiceState } from "./ui/voice-companion-bar";
import { VoiceSettingsSheet } from "./ui/voice-settings-sheet";

interface FloatingDockProps {
    voiceEnabled: boolean;
    onVoiceToggle: () => void;
    presetLabel: string;
    isChatOpen: boolean;
    onToggleChat: () => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
    voiceState: VoiceState;
    onToggleMic: () => void;
    onInterrupt: () => void;
}

export function FloatingDock({
    voiceEnabled,
    onVoiceToggle,
    presetLabel,
    isChatOpen,
    onToggleChat,
    accentColor = "#7C3AED",
    constraintsRef,
    voiceState,
    onToggleMic,
    onInterrupt,
}: FloatingDockProps) {
    const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = React.useState(false);

    return (
        <>
            <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-4 w-full max-w-[calc(100vw-2rem)] px-4">
                <VoiceCompanionBar
                    state={voiceState}
                    onToggleMic={onToggleMic}
                    onInterrupt={onInterrupt}
                    isChatOpen={isChatOpen}
                    onToggleChat={onToggleChat}
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
