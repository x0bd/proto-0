"use client";

import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import { EmotionState, FaceVariant } from "./components/face/types";
import Link from "next/link";
import { motion } from "motion/react";
import { SiGithub, SiNpm } from "react-icons/si";
import { RiPlayFill } from "react-icons/ri";
import { useTheme } from "next-themes";

const EMOTION_PRESETS: Record<string, EmotionState> = {
    Neutral: { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.2 },
    Joy: { joy: 1, sadness: 0, surprise: 0.2, anger: 0, curiosity: 0.3 },
    Sadness: { joy: 0, sadness: 1, surprise: 0, anger: 0, curiosity: 0.1 },
    Anger: { joy: 0, sadness: 0.1, surprise: 0.2, anger: 1, curiosity: 0 },
    Surprise: { joy: 0.4, sadness: 0, surprise: 1, anger: 0, curiosity: 0.4 },
};

function clamp01(v: number) {
    return Math.min(1, Math.max(0, v));
}

function smooth01(t: number) {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
}

export default function LandingPage() {
    const [emotion, setEmotion] = useState<EmotionState>(
        EMOTION_PRESETS.Neutral,
    );
    const [variant, setVariant] = useState<FaceVariant>("analogue");
    const [accentColor, setAccentColor] = useState<string>("#ff3b30");
    const [mounted, setMounted] = useState(false);
    const [isTracking, setIsTracking] = useState(true);
    const { setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
        // Force light theme for this specific landing page aesthetic
        setTheme("light");
    }, [setTheme]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isTracking || typeof window === "undefined") return;
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
        if (isTracking) setEmotion(EMOTION_PRESETS.Neutral);
    };

    const setEmotionPreset = (name: string) => {
        setIsTracking(false);
        setEmotion(EMOTION_PRESETS[name]);
        // Re-enable tracking after a short delay if they move mouse? Or just stay locked.
        // Let's just lock it if they click a preset, and unlock if they click "Follow Mouse"
    };

    if (!mounted) return null;

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#f4f4f0] text-[#111111] font-sans overflow-hidden selection:bg-[#007aff] selection:text-white"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1040px] bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-4 sm:gap-6 border border-[#e5e5e5]"
            >
                {/* Left: Screen Module */}
                <div className="w-full md:w-[55%] aspect-square bg-[#eeeeee] rounded-[20px] sm:rounded-[24px] relative flex flex-col justify-between overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.04)] p-5 sm:p-6 border border-[#e5e5e5]">
                    {/* Screen Top HUD */}
                    <div className="flex justify-between items-start z-20 relative">
                        <div className="flex flex-col gap-1">
                            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                                SYS.STATE
                            </span>
                            <div className="flex items-center gap-1.5">
                                <div className="size-1.5 rounded-full bg-[#007aff]" />
                                <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#007aff]">
                                    ONLINE
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                                EMOTION
                            </span>
                            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#111111]">
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    {/* The Massive Avatar */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        {/* Make it extremely large so it fills the screen perfectly like the image */}
                        <div className="w-[140%] max-w-[800px] aspect-[4/3] flex items-center justify-center translate-y-4">
                            <Avatar
                                emotion={emotion}
                                variant={variant}
                                accentColor={accentColor}
                            />
                        </div>
                    </div>

                    {/* Screen Bottom HUD */}
                    <div className="flex justify-between items-end z-20 relative mt-auto px-2">
                        <Meter
                            label="JOY"
                            value={emotion.joy}
                            color={accentColor}
                        />
                        <Meter
                            label="ANG"
                            value={emotion.anger}
                            color={accentColor}
                        />
                        <Meter
                            label="CUR"
                            value={emotion.curiosity}
                            color={accentColor}
                        />
                    </div>
                </div>

                {/* Right: Info & Controls */}
                <div className="w-full md:w-[45%] flex flex-col gap-4 sm:gap-6">
                    {/* Info Panel */}
                    <div className="flex-1 bg-[#f4f4f0] rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 flex flex-col border border-[#e5e5e5]">
                        <div className="flex items-center justify-between mb-6">
                            <h2
                                className="font-display text-[40px] leading-none font-bold tracking-widest text-[#111111]"
                                style={{
                                    fontFamily: '"Doto", sans-serif',
                                    letterSpacing: "0.1em",
                                }}
                            >
                                <span className="border-b-[3px] border-dotted border-[#111111] pb-1 inline-block">
                                    DOT
                                </span>
                            </h2>
                            <div className="px-2.5 py-1 bg-[#111111] text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-md">
                                V 0.1
                            </div>
                        </div>

                        <p className="text-[15px] sm:text-[16px] font-medium text-[#555555] leading-relaxed mb-8">
                            An expressive, real-time AI companion. Procedural
                            geometry mapped to emotion. No text, no icons, no
                            chrome. Just shape and motion.
                        </p>

                        {/* Quick Controls */}
                        <div className="flex flex-col gap-4 mb-6">
                            {/* Variant Toggle */}
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#8e8e93] w-14">
                                    FACE
                                </span>
                                <div className="flex gap-1.5 bg-[#e5e5e5] p-1 rounded-lg">
                                    {(
                                        [
                                            "minimal",
                                            "analogue",
                                            "tron",
                                        ] as FaceVariant[]
                                    ).map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setVariant(v)}
                                            className={`px-2.5 py-1 rounded-md font-mono text-[9px] font-bold uppercase tracking-widest transition-all ${variant === v ? "bg-[#111111] text-white shadow-sm" : "text-[#555] hover:text-[#111]"}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Toggle */}
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#8e8e93] w-14">
                                    COLOR
                                </span>
                                <div className="flex gap-2">
                                    {[
                                        { id: "red", hex: "#ff3b30" },
                                        { id: "blue", hex: "#007aff" },
                                        { id: "green", hex: "#34c759" },
                                        { id: "yellow", hex: "#ffcc00" },
                                    ].map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() =>
                                                setAccentColor(c.hex)
                                            }
                                            className={`w-6 h-6 rounded-full transition-transform ${accentColor === c.hex ? "scale-110 shadow-[0_0_0_2px_#f4f4f0,0_0_0_4px_#111111]" : "hover:scale-110"}`}
                                            style={{ backgroundColor: c.hex }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Emotion Toggle */}
                            <div className="flex items-center gap-3 mt-2">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#8e8e93] w-14">
                                    MOOD
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => setIsTracking(true)}
                                        className={`px-2.5 py-1 rounded-md font-mono text-[9px] font-bold uppercase tracking-widest border transition-all ${isTracking ? "border-[#111] text-[#111] bg-white" : "border-[#d4d4d4] text-[#8e8e93] hover:text-[#111]"}`}
                                    >
                                        CURSOR
                                    </button>
                                    {Object.keys(EMOTION_PRESETS)
                                        .filter((k) => k !== "Neutral")
                                        .map((m) => (
                                            <button
                                                key={m}
                                                onClick={() =>
                                                    setEmotionPreset(m)
                                                }
                                                className={`px-2.5 py-1 rounded-md font-mono text-[9px] font-bold uppercase tracking-widest transition-all ${!isTracking && emotion === EMOTION_PRESETS[m] ? "bg-[#111] text-white" : "bg-[#e5e5e5] text-[#555] hover:text-[#111]"}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex items-end justify-between border-t border-[#e5e5e5] pt-6">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8e8e93] font-bold">
                                    ARCHITECT
                                </span>
                                <a
                                    href="https://xoboid.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-sans text-[14px] font-bold tracking-tight text-[#111111] hover:text-[#007aff] transition-colors"
                                >
                                    xoboid
                                </a>
                            </div>
                            <div className="flex gap-1.5 opacity-30">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="size-1.5 rounded-full bg-[#111111]"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 shrink-0">
                        {/* Giant Blue Launch Button */}
                        <Link
                            href="/companion"
                            className="bg-[#007aff] text-white rounded-[20px] min-h-[88px] flex flex-col items-center justify-center gap-1 shadow-[0_8px_16px_rgba(0,122,255,0.25)] hover:shadow-[0_12px_24px_rgba(0,122,255,0.3)] transition-all border-b-[6px] border-[#005bb5] active:border-b-0 active:translate-y-[6px]"
                        >
                            <div className="flex items-center gap-2">
                                <RiPlayFill className="size-6" />
                                <span className="text-xl sm:text-2xl font-bold tracking-[0.2em] translate-y-px">
                                    INITIALIZE
                                </span>
                            </div>
                            <span className="font-mono text-[9px] opacity-80 tracking-widest uppercase font-medium">
                                Launch Application
                            </span>
                        </Link>

                        {/* Secondary Colorful Hardware Buttons */}
                        <div className="flex gap-4 h-[64px]">
                            {/* Github Button (Yellow) */}
                            <a
                                href="https://github.com/x0bd/proto-0"
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-[#ffcc00] text-[#111111] rounded-[16px] flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(255,204,0,0.2)] hover:shadow-[0_8px_16px_rgba(255,204,0,0.25)] transition-all border-b-[5px] border-[#cca300] active:border-b-0 active:translate-y-[5px]"
                            >
                                <SiGithub className="size-5" />
                                <span className="text-[13px] font-bold tracking-widest translate-y-px">
                                    SOURCE
                                </span>
                            </a>

                            {/* NPM Button (Orange) */}
                            <a
                                href="https://www.npmjs.com/package/@xoboid/avatar"
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-[#ff3b30] text-white rounded-[16px] flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(255,59,48,0.2)] hover:shadow-[0_8px_16px_rgba(255,59,48,0.25)] transition-all border-b-[5px] border-[#cc2f26] active:border-b-0 active:translate-y-[5px]"
                            >
                                <SiNpm className="size-6" />
                                <span className="text-[13px] font-bold tracking-widest translate-y-px">
                                    PACKAGE
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Mini component for the emotion meters
function Meter({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex flex-col gap-1 w-12 sm:w-16">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                {label}
            </span>
            <div className="h-1.5 w-full bg-[#d4d4d4] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${value * 100}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
