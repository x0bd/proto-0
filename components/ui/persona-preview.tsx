"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

interface PersonaPreviewProps {
    name: string;
    sample: string;
    accentColor?: string;
}

export function PersonaPreview({
    name,
    sample,
    accentColor = "#7c3aed",
}: PersonaPreviewProps) {
    return (
        <div className="p-5 bg-background/60 backdrop-blur-md rounded-[28px] border border-foreground/[0.05] shadow-sm relative overflow-hidden">
            <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-foreground/70">
                    <Sparkles
                        className="size-4"
                        style={{ color: accentColor }}
                    />
                    <span className="text-[13px] font-medium uppercase tracking-wider">
                        {name} Preview
                    </span>
                </div>
                <p className="text-[16px] font-medium leading-snug text-foreground/90">
                    {sample}
                </p>
            </div>
        </div>
    );
}
