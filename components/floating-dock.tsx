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
    { id: 'neutral', label: 'NEUTRAL', icon: Meh, color: 'text-muted-foreground' },
    { id: 'joy', label: 'JOY', icon: Smile, color: 'text-emerald-500' },
    { id: 'sad', label: 'SADNESS', icon: Frown, color: 'text-blue-500' },
    { id: 'surprised', label: 'SURPRISE', icon: Zap, color: 'text-amber-500' },
    { id: 'angry', label: 'ANGER', icon: Angry, color: 'text-rose-500' },
    { id: 'curious', label: 'CURIOSITY', icon: Search, color: 'text-indigo-500' },
];

export function FloatingDock({ activePreset, onPresetChange }: FloatingDockProps) {
    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
            {/* Matte Container: Physical object feel */}
            <div className="glass-card rounded-full p-2 flex items-center gap-2 shadow-premium">
                {emotions.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePreset === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onPresetChange(item.id)}
                            className={cn(
                                "relative size-12 rounded-full flex items-center justify-center transition-all duration-200 click-tactic group",
                                isActive 
                                    ? "bg-foreground/10 shadow-zen" 
                                    : "hover:bg-foreground/5"
                            )}
                            title={item.label}
                        >
                            <Icon className={cn(
                                "size-5 transition-colors duration-200",
                                isActive ? item.color : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            
                            {/* Fukasawa-style Label (appearing below) */}
                            <span className={cn(
                                "absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest uppercase transition-opacity duration-200 pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 text-muted-foreground/60",
                                isActive && "opacity-100 text-foreground font-medium"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
