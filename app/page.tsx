"use client";

import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import { EmotionState } from "./components/face/types";
import Link from "next/link";
import { motion } from "motion/react";
import { SiGithub, SiNpm } from "react-icons/si";
import { RiPlayFill } from "react-icons/ri";

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
            className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-background text-foreground font-sans overflow-hidden bg-washi selection:bg-[var(--te-blue)] selection:text-white"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                className="te-module w-full max-w-[900px] shadow-2xl relative z-10"
            >
                {/* Top Bezel / Header */}
                <div className="te-module-header h-12 px-4 flex justify-between items-center bg-[var(--key-bg)] border-b border-[var(--panel-border)]">
                    <div className="flex items-center gap-4">
                        {/* Hardware Status Dots */}
                        <div className="flex gap-1.5">
                            <div className="size-2.5 rounded-full bg-[var(--te-orange)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
                            <div className="size-2.5 rounded-full bg-[var(--te-yellow)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
                            <div className="size-2.5 rounded-full bg-[var(--te-green)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] animate-pulse" />
                        </div>
                        <div className="h-3 w-px bg-[var(--panel-border)]" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">
                            DOT_OS
                        </span>
                    </div>
                    <div className="w-24 h-2 te-grip opacity-40 hidden sm:block" />
                </div>

                {/* Main Chassis */}
                <div className="p-4 sm:p-6 bg-[var(--panel-bg)] flex flex-col gap-6">
                    {/* The Screen Module */}
                    <div className="w-full aspect-[4/3] sm:aspect-[21/9] te-lcd relative flex flex-col items-center justify-center overflow-hidden border-2 border-[var(--panel-border)]">
                        {/* Screen overlay effects */}
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22%3E%3Crect width=%224%22 height=%224%22 fill=%22%23fff%22 fill-opacity=%220.05%22/%3E%3C/svg%3E')] mix-blend-overlay" />
                        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)] pointer-events-none" />

                        {/* Top Screen HUD */}
                        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex flex-col gap-1 z-10">
                            <span className="te-label opacity-50">
                                SYS.STATE
                            </span>
                            <span className="te-value text-[var(--te-blue)] drop-shadow-[0_0_8px_rgba(0,122,255,0.4)] animate-pulse">
                                ONLINE
                            </span>
                        </div>

                        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex flex-col items-end gap-1 z-10">
                            <span className="te-label opacity-50">
                                EMOTION_CORE
                            </span>
                            <span className="te-value">ACTIVE</span>
                        </div>

                        {/* The Avatar */}
                        <div className="w-[80%] max-w-[450px] aspect-[4/3] relative z-10 flex items-center justify-center">
                            <Avatar
                                emotion={emotion}
                                variant="minimal"
                                accentColor="var(--te-orange)"
                            />
                        </div>

                        {/* Bottom Screen HUD */}
                        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 flex gap-4 sm:gap-6 z-10">
                            <div className="flex flex-col gap-0.5">
                                <span className="te-label opacity-50">JOY</span>
                                <div className="h-1 w-8 bg-foreground/20 rounded-full overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-[var(--te-orange)]"
                                        style={{
                                            width: `${emotion.joy * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="te-label opacity-50">ANG</span>
                                <div className="h-1 w-8 bg-foreground/20 rounded-full overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-[var(--te-orange)]"
                                        style={{
                                            width: `${emotion.anger * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="te-label opacity-50">CUR</span>
                                <div className="h-1 w-8 bg-foreground/20 rounded-full overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-[var(--te-orange)]"
                                        style={{
                                            width: `${emotion.curiosity * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Control Panel (Info & Buttons) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                        {/* Info Panel (Left) */}
                        <div className="te-recessed col-span-1 lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between gap-4 relative overflow-hidden h-full">
                            {/* Hardware Speaker Grill Detail */}
                            <div
                                className="absolute right-4 top-4 bottom-4 w-12 opacity-[0.03] dark:opacity-10 pointer-events-none"
                                style={{
                                    background:
                                        "repeating-linear-gradient(90deg, transparent, transparent 2px, var(--foreground) 2px, var(--foreground) 4px)",
                                }}
                            />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                                        DOT
                                    </h2>
                                    <div className="px-2 py-0.5 bg-[var(--te-green)] text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-sm">
                                        V 0.1
                                    </div>
                                </div>
                                <p className="text-[14px] sm:text-[15px] font-medium text-foreground/70 leading-relaxed max-w-[90%]">
                                    An expressive, real-time AI companion.
                                    Procedural geometry mapped to emotion. No
                                    text, no icons, no chrome. Just shape and
                                    motion.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 relative z-10 mt-2">
                                <span className="te-label px-2.5 py-1.5 bg-[var(--panel-bg)] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.05)] border border-[var(--panel-border)]">
                                    REACT 18
                                </span>
                                <span className="te-label px-2.5 py-1.5 bg-[var(--panel-bg)] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.05)] border border-[var(--panel-border)]">
                                    GSAP 3
                                </span>
                                <span className="te-label px-2.5 py-1.5 bg-[var(--panel-bg)] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.05)] border border-[var(--panel-border)]">
                                    WEB_AUDIO
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons (Right) */}
                        <div className="col-span-1 lg:col-span-5 flex flex-col gap-3 sm:gap-4 h-full">
                            {/* Giant Blue Launch Button */}
                            <Link
                                href="/companion"
                                className="te-button flex-1 min-h-[80px] w-full group relative overflow-hidden flex-col gap-1"
                                style={{
                                    backgroundColor: "var(--te-blue)",
                                    borderColor: "rgba(0,0,0,0.2)",
                                    borderBottomColor: "#005bb5",
                                    color: "white",
                                }}
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                                <div className="flex items-center justify-center gap-2">
                                    <RiPlayFill className="size-5" />
                                    <span className="text-lg sm:text-xl tracking-[0.2em] translate-y-[1px]">
                                        INITIALIZE
                                    </span>
                                </div>
                                <span className="font-mono text-[9px] opacity-70 tracking-widest uppercase">
                                    Launch Application
                                </span>
                            </Link>

                            {/* Secondary Colorful Hardware Buttons */}
                            <div className="flex gap-3 sm:gap-4 h-[60px]">
                                {/* Github Button (Yellow) */}
                                <a
                                    href="https://github.com/x0bd/proto-0"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="te-button flex-1 gap-2 relative group"
                                    style={{
                                        backgroundColor: "var(--te-yellow)",
                                        borderColor: "rgba(0,0,0,0.1)",
                                        borderBottomColor: "#cca300",
                                        color: "#111",
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors rounded-[7px]" />
                                    <SiGithub className="size-4" />
                                    <span className="text-[11px] translate-y-px">
                                        SOURCE
                                    </span>
                                </a>

                                {/* NPM Button (Orange) */}
                                <a
                                    href="https://www.npmjs.com/package/@xoboid/avatar"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="te-button flex-1 gap-2 relative group"
                                    style={{
                                        backgroundColor: "var(--te-orange)",
                                        borderColor: "rgba(0,0,0,0.1)",
                                        borderBottomColor: "#cc2f26",
                                        color: "white",
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors rounded-[7px]" />
                                    <SiNpm className="size-5" />
                                    <span className="text-[11px] translate-y-px">
                                        PACKAGE
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
