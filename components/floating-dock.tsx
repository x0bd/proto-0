"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
    Smile, 
    Frown, 
    Meh, 
    Zap, 
    Angry, 
    Search
} from "lucide-react";

interface FloatingDockProps {
    activePreset: string;
    onPresetChange: (preset: string) => void;
}

const emotions = [
    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-muted-foreground' },
    { id: 'joy', label: 'Joy', icon: Smile, color: 'text-emerald-500' },
    { id: 'sad', label: 'Sadness', icon: Frown, color: 'text-blue-500' },
    { id: 'surprised', label: 'Surprise', icon: Zap, color: 'text-amber-500' },
    { id: 'angry', label: 'Anger', icon: Angry, color: 'text-rose-500' },
    { id: 'curious', label: 'Curiosity', icon: Search, color: 'text-indigo-500' },
];

export function FloatingDock({ activePreset, onPresetChange }: FloatingDockProps) {
    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
            <div className="glass-card rounded-[2rem] p-2 flex items-center gap-1 shadow-premium glow-internal">
                {emotions.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePreset === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onPresetChange(item.id)}
                            className={cn(
                                "relative size-12 rounded-full flex items-center justify-center transition-all duration-300 group",
                                isActive 
                                    ? "bg-foreground/10 shadow-zen scale-110" 
                                    : "hover:bg-foreground/5 hover:scale-105"
                            )}
                            title={item.label}
                        >
                            <Icon className={cn(
                                "size-5 transition-colors duration-300",
                                isActive ? item.color : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            
                            {/* Tooltip */}
                            <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-card/80 backdrop-blur-md rounded-full text-micro text-xs border border-border/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
                                {item.label}
                            </span>
                            
                            {/* Active Indicator */}
                            {isActive && (
                                <span className="absolute -bottom-1 size-1 rounded-full bg-foreground/50" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
