"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

interface PersonaCardProps {
    name: string;
    tone: string;
    description: string;
    isActive?: boolean;
    unavailable?: boolean;
    accentColor?: string;
    onClick?: () => void;
}

export function PersonaCard({
    name,
    tone,
    description,
    isActive = false,
    unavailable = false,
    accentColor = "#7c3aed",
    onClick,
}: PersonaCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-4 rounded-[24px] border transition-all duration-300 bg-background/60 backdrop-blur-md shadow-sm hover:bg-background/80 disabled:cursor-not-allowed"
            style={{
                borderColor: isActive
                    ? `${accentColor}45`
                    : "rgba(28,10,46,0.06)",
                boxShadow: isActive
                    ? `0 10px 24px -14px ${accentColor}60`
                    : undefined,
                opacity: unavailable ? 0.6 : 1,
            }}
            disabled={unavailable}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <p className="text-[15px] font-semibold tracking-tight text-foreground/90">
                            {name}
                        </p>
                        {isActive && (
                            <Badge
                                className="rounded-full border-0"
                                style={{
                                    backgroundColor: `${accentColor}14`,
                                    color: accentColor,
                                }}
                            >
                                Active
                            </Badge>
                        )}
                        {unavailable && (
                            <Badge variant="outline" className="rounded-full">
                                Voice Key Missing
                            </Badge>
                        )}
                    </div>
                    <p
                        className="text-[11px] font-mono font-bold uppercase tracking-[0.18em]"
                        style={{ color: accentColor }}
                    >
                        {tone}
                    </p>
                    <p className="text-[13px] leading-relaxed text-muted-foreground/75">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}
