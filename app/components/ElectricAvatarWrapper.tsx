"use client";

import { ReactNode } from "react";

interface ElectricAvatarWrapperProps {
    children: ReactNode;
    borderColor?: string;
    className?: string;
}

/**
 * ElectricAvatarWrapper
 * Replicates the electric-border effect from the example.
 * Uses SVG filters with animated turbulence for the "electric" look.
 */
export function ElectricAvatarWrapper({
    children,
    borderColor = "#dd8448", // Default: Orange
    className = "",
}: ElectricAvatarWrapperProps) {
    return (
        <>
            {/* SVG Filter Definitions */}
            <svg className="fixed size-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <filter
                        id="electric-filter"
                        colorInterpolationFilters="sRGB"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >
                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise1"
                            seed="1"
                        />
                        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                            <animate
                                attributeName="dy"
                                values="700; 0"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise2"
                            seed="1"
                        />
                        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                            <animate
                                attributeName="dy"
                                values="0; -700"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise3"
                            seed="2"
                        />
                        <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                            <animate
                                attributeName="dx"
                                values="490; 0"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise4"
                            seed="2"
                        />
                        <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                            <animate
                                attributeName="dx"
                                values="0; -490"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
                        <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
                        <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="combinedNoise"
                            scale="30"
                            xChannelSelector="R"
                            yChannelSelector="B"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Card Container */}
            <div
                className={`relative p-[2px] rounded-[1.5em] ${className}`}
                style={{
                    background: `linear-gradient(-30deg, ${borderColor}66, transparent, ${borderColor}66), linear-gradient(to bottom, #1a1a1a, #1a1a1a)`,
                }}
            >
                {/* Inner Container */}
                <div className="relative">
                    {/* Border Outer */}
                    <div
                        className="rounded-[1.5em] pr-[2px] pb-[2px]"
                        style={{
                            border: `2px solid ${borderColor}80`,
                        }}
                    >
                        {/* Main Card - Filter applied here */}
                        <div
                            className="w-[320px] aspect-square rounded-[1.5em] -mt-1 -ml-1 flex items-center justify-center"
                            style={{
                                border: `2px solid ${borderColor}`,
                                filter: "url(#electric-filter)",
                            }}
                        >
                            {children}
                        </div>
                    </div>

                    {/* Glow Layer 1 */}
                    <div
                        className="absolute inset-0 rounded-[24px] pointer-events-none"
                        style={{
                            border: `2px solid ${borderColor}99`,
                            filter: "blur(1px)",
                        }}
                    />

                    {/* Glow Layer 2 */}
                    <div
                        className="absolute inset-0 rounded-[24px] pointer-events-none"
                        style={{
                            border: `2px solid ${borderColor}`,
                            filter: "blur(4px)",
                        }}
                    />
                </div>

                {/* Overlay 1 */}
                <div
                    className="absolute inset-0 rounded-[24px] pointer-events-none"
                    style={{
                        mixBlendMode: "overlay",
                        transform: "scale(1.1)",
                        filter: "blur(16px)",
                        background: "linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)",
                    }}
                />

                {/* Overlay 2 */}
                <div
                    className="absolute inset-0 rounded-[24px] pointer-events-none opacity-50"
                    style={{
                        mixBlendMode: "overlay",
                        transform: "scale(1.1)",
                        filter: "blur(16px)",
                        background: "linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)",
                    }}
                />

                {/* Background Glow */}
                <div
                    className="absolute inset-0 rounded-[24px] pointer-events-none -z-10 opacity-30"
                    style={{
                        transform: "scale(1.1)",
                        filter: "blur(32px)",
                        background: `linear-gradient(-30deg, ${borderColor}, transparent, ${borderColor})`,
                    }}
                />
            </div>
        </>
    );
}
