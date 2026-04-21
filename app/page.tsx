"use client";

import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import { EmotionState } from "./components/face/types";
import Link from "next/link";
import { motion } from "motion/react";

const NEUTRAL_EMOTION: EmotionState = {
    joy: 0.3,
    sadness: 0,
    surprise: 0,
    anger: 0,
    curiosity: 0.2,
};

function clamp01(v: number) {
    return Math.min(1, Math.max(0, v));
}

function smooth01(t: number) {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
}

export default function LandingPage() {
    const [emotion, setEmotion] = useState<EmotionState>(NEUTRAL_EMOTION);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (typeof window === "undefined") return;
        const { innerWidth, innerHeight } = window;

        // Normalized coordinates between -1 and 1
        const nx = Math.max(
            -1,
            Math.min(1, (e.clientX - innerWidth / 2) / (innerWidth * 0.4)),
        );
        const ny = Math.max(
            -1,
            Math.min(1, (e.clientY - innerHeight / 2) / (innerHeight * 0.4)),
        );

        const r = Math.min(1, Math.hypot(nx, ny));
        const deadZone = 0.1;
        const intensity =
            r <= deadZone ? 0 : smooth01((r - deadZone) / (1 - deadZone));

        setEmotion({
            joy: smooth01(-ny) * intensity,
            sadness: smooth01(ny) * intensity,
            surprise: smooth01(Math.abs(ny) * 0.6) * 0.7 * intensity,
            anger:
                smooth01(Math.max(0, Math.abs(nx) - 0.55) / 0.45) *
                0.65 *
                intensity,
            curiosity: smooth01(Math.abs(nx)) * intensity,
        });
    };

    const handleMouseLeave = () => {
        setEmotion(NEUTRAL_EMOTION);
    };

    if (!mounted) return null;

    return (
        <div
            className="dark flex flex-col items-center justify-center w-screen h-screen bg-[#111111] text-foreground font-sans overflow-hidden relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] bg-[#3b82f6]/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Window Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[90vw] max-w-[1000px] aspect-[16/10] sm:aspect-[21/10] mb-10 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden z-10"
                style={{
                    boxShadow:
                        "0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.4), 0 15px 20px rgba(0,0,0,0.4)",
                }}
            >
                {/* macOS Header */}
                <div className="flex items-center px-4 h-11 w-full bg-[#0a0a0a] border-b border-white/[0.04]">
                    <div className="flex gap-2 absolute left-4">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>

                    {/* Header Title */}
                    <div className="w-full flex justify-center items-center gap-2 opacity-80 select-none">
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <div className="w-2 h-2 rounded-full bg-black translate-x-[-1px] translate-y-[-1px]" />
                        </div>
                        <span className="text-[#a1a1aa] text-sm font-medium tracking-wide">
                            DOT
                        </span>
                    </div>
                </div>

                {/* Window Content */}
                <div className="w-full h-[calc(100%-44px)] flex items-center justify-center bg-[#050505] relative">
                    {/* Scanline overlay for that retro terminal feel */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-5"
                        style={{
                            background:
                                "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
                        }}
                    />

                    <div className="w-[65%] max-w-[500px] aspect-square relative z-10 flex items-center justify-center">
                        <Avatar
                            emotion={emotion}
                            variant="tron"
                            accentColor="#3b82f6"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.7,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[#a1a1aa] text-sm sm:text-[15px] font-medium max-w-[800px] text-center px-6 mb-8 z-10"
            >
                DOT is an expressive, real-time AI companion that uses
                procedural geometry to express emotions. Built with
                platform-native UI and sub-frame precision.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.7,
                    delay: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center justify-center gap-4 z-10"
            >
                <Link
                    href="/companion"
                    className="px-6 py-2.5 rounded-lg border border-[#27272a] bg-[#18181b]/50 hover:bg-[#27272a]/50 text-white text-[13px] font-medium transition-all"
                >
                    Launch App
                </Link>
                <a
                    href="https://github.com/x0bd/proto-0"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2.5 rounded-lg border border-[#27272a] bg-[#18181b]/50 hover:bg-[#27272a]/50 text-white text-[13px] font-medium transition-all"
                >
                    Documentation
                </a>
            </motion.div>
        </div>
    );
}
