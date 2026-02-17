"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IoVolumeHighOutline, IoVolumeMuteOutline, IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";

interface FloatingDockProps {
    voiceEnabled: boolean;
    onVoiceToggle: () => void;
	presetLabel: string;
}

export function FloatingDock({ voiceEnabled, onVoiceToggle, presetLabel }: FloatingDockProps) {
    const [showHint, setShowHint] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-3">
            {/* Swipe Hint */}
            <AnimatePresence>
                {showHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-background/95 border border-foreground/5 shadow-premium"
                    >
                        <IoChevronBackOutline className="size-3.5 text-muted-foreground/60" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/70">
                            Swipe to change
                        </span>
                        <IoChevronForwardOutline className="size-3.5 text-muted-foreground/60" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emotion Preset Pill */}
            <motion.div 
                layout
                className="rounded-full px-4 py-2.5 flex items-center gap-3 shadow-premium bg-background border border-foreground/5"
            >
                {/* Voice Toggle */}
                <button
                    onClick={onVoiceToggle}
                    className={cn(
                        "size-9 rounded-full flex items-center justify-center transition-all duration-200 relative group",
                        voiceEnabled 
                            ? "bg-foreground text-background hover:bg-foreground/90" 
                            : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                    )}
                    title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                >
                    {voiceEnabled ? (
                        <IoVolumeHighOutline className="size-4.5" />
                    ) : (
                        <IoVolumeMuteOutline className="size-4.5" />
                    )}
                    {/* Tooltip */}
                    <span className="absolute -top-11 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-background rounded-lg border border-foreground/5 shadow-premium text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {voiceEnabled ? "VOICE ON" : "VOICE OFF"}
                    </span>
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-foreground/8" />

                {/* Current Emotion Preset */}
                <div className="flex items-center gap-2.5 px-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/50">
                        Mood
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.15em] text-foreground">
                        {presetLabel}
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
