"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

interface ReflectionPromptCardProps {
    prompt: string;
    accentColor?: string;
}

export function ReflectionPromptCard({
    prompt,
    accentColor = "#7c3aed",
}: ReflectionPromptCardProps) {
    return (
        <div className="p-5 hardware-input rounded-[24px] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                <Sparkles className="w-24 h-24" />
            </div>
            <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-foreground/70">
                    <Sparkles
                        className="size-4"
                        style={{ color: accentColor }}
                    />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60">
                        Suggested for you
                    </span>
                </div>
                <p className="text-[14px] font-mono font-medium leading-relaxed text-foreground/90">
                    {prompt}
                </p>
                <button
                    className="text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors mt-2"
                    style={{ color: accentColor }}
                >
                    Discuss with DOT
                </button>
            </div>
        </div>
    );
}
