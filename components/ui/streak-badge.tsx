"use client";

import * as React from "react";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
    streak: number;
    broken?: boolean;
    accentColor?: string;
}

export function StreakBadge({
    streak,
    broken = false,
    accentColor = "#7c3aed",
}: StreakBadgeProps) {
    if (broken) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-warning/20 bg-warning/10 text-warning shadow-sm">
                <Flame className="size-4" />
                <span className="text-sm font-bold tracking-tight">
                    Streak paused
                </span>
            </div>
        );
    }

    if (streak <= 0) return null;

    return (
        <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm"
            style={{
                backgroundColor: `${accentColor}12`,
                color: accentColor,
                borderColor: `${accentColor}20`,
            }}
        >
            <Flame className="size-4" fill="currentColor" />
            <span className="text-sm font-bold tracking-tight">
                {streak} Day{streak !== 1 ? "s" : ""}
            </span>
        </div>
    );
}
