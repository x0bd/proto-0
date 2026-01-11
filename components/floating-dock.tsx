"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
    Smile, 
    Frown, 
    Meh, 
    Zap, 
    Angry, 
    Search,
    BrainCircuit
} from "lucide-react";
import { motion } from "motion/react";

interface FloatingDockProps {
    activePreset: string;
    onPresetChange: (preset: string) => void;
    onMemoryClick: () => void;
}

const emotions = [
    { id: 'neutral', label: 'NEUTRAL', icon: Meh, color: 'text-muted-foreground' },
    { id: 'joy', label: 'JOY', icon: Smile, color: 'text-emerald-500' },
    { id: 'sad', label: 'SORROW', icon: Frown, color: 'text-blue-500' },
    { id: 'surprised', label: 'SHOCK', icon: Zap, color: 'text-amber-500' },
    { id: 'angry', label: 'RAGE', icon: Angry, color: 'text-rose-500' },
    { id: 'curious', label: 'QUERY', icon: Search, color: 'text-indigo-500' },
];

export function FloatingDock({ activePreset, onMemoryClick }: FloatingDockProps) {
    const activeItem = emotions.find(e => e.id === activePreset) || emotions[0];
    const Icon = activeItem.icon;

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60]">
            {/* Minimal Pill: Matching SystemMenu style */}
            <motion.div 
                layout
                className="glass-card rounded-full p-1.5 pl-4 flex items-center gap-3 shadow-premium backdrop-blur-2xl bg-card/60 border-0"
            >
                {/* Active State Display */}
                <div className="flex items-center gap-2.5 select-none">
                    <motion.div
                        key={activeItem.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Icon 
                            className={cn("size-4", activeItem.color)} 
                            strokeWidth={2}
                        />
                    </motion.div>
                    <motion.span 
                        key={`${activeItem.id}-text`}
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[10px] font-mono tracking-[0.2em] font-bold text-muted-foreground uppercase min-w-[60px]"
                    >
                        {activeItem.label}
                    </motion.span>
                </div>

                {/* Separator */}
                <div className="w-px h-4 bg-foreground/10" />

                {/* Memory Button */}
                <button
                    onClick={onMemoryClick}
                    className="size-9 rounded-full flex items-center justify-center hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-300 click-tactic relative group"
                    title="Open Memory Bank"
                >
                    <BrainCircuit className="size-4" strokeWidth={1.5} />
                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-card/80 backdrop-blur-sm rounded-md border border-border/20 text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Memory
                    </span>
                </button>
            </motion.div>
            
            {/* Gesture Hint */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground/30 whitespace-nowrap tracking-widest animate-pulse pointer-events-none">
                SWIPE_TO_CYCLE
            </div>
        </div>
    );
}
