"use client";

import * as React from "react";

interface ActivePersonaChipProps {
    label: string;
    accentColor?: string;
}

export function ActivePersonaChip({
    label,
    accentColor = "#7c3aed",
}: ActivePersonaChipProps) {
    return (
        <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-background/85 backdrop-blur-md border shadow-premium"
            style={{ borderColor: `${accentColor}24`, color: accentColor }}
        >
            <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: accentColor }}
            />
            <span className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase leading-none">
                {label}
            </span>
        </div>
    );
}
