"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IoVolumeHighOutline, IoVolumeMuteOutline, IoChatbubblesOutline } from "react-icons/io5";
import { motion } from "motion/react";

interface FloatingDockProps {
    voiceEnabled: boolean;
    onVoiceToggle: () => void;
    onHistoryClick: () => void;
}

export function FloatingDock({ voiceEnabled, onVoiceToggle, onHistoryClick }: FloatingDockProps) {
    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60]">
            {/* Minimal Pill */}
            <motion.div 
                layout
                className="glass-card rounded-full p-1.5 flex items-center gap-1 shadow-premium backdrop-blur-2xl bg-card/60 border-0"
            >
                {/* Voice Toggle */}
                <button
                    onClick={onVoiceToggle}
                    className={cn(
                        "size-10 rounded-full flex items-center justify-center transition-all duration-300 click-tactic relative group",
                        voiceEnabled 
                            ? "bg-foreground text-background" 
                            : "hover:bg-foreground/5 text-muted-foreground"
                    )}
                    title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                >
                    {voiceEnabled ? (
                        <IoVolumeHighOutline className="size-5" />
                    ) : (
                        <IoVolumeMuteOutline className="size-5" />
                    )}
                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-card/80 backdrop-blur-sm rounded-md border border-border/20 text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {voiceEnabled ? "VOICE ON" : "VOICE OFF"}
                    </span>
                </button>

                {/* Separator */}
                <div className="w-px h-5 bg-foreground/10" />

                {/* Chat History Button */}
                <button
                    onClick={onHistoryClick}
                    className="size-10 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-300 click-tactic relative group"
                    title="View Transcript"
                >
                    <IoChatbubblesOutline className="size-5" />
                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-card/80 backdrop-blur-sm rounded-md border border-border/20 text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        TRANSCRIPT
                    </span>
                </button>
            </motion.div>
        </div>
    );
}
