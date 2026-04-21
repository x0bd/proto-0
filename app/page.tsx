"use client";

import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import { EmotionState, FaceVariant } from "./components/face/types";
import Link from "next/link";
import { motion } from "motion/react";
import { SiGithub, SiNpm } from "react-icons/si";
import {
    RiPlayFill,
    RiVoiceprintFill,
    RiShapeFill,
    RiShieldKeyholeFill,
} from "react-icons/ri";
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
        setTheme("light");
    }, [setTheme]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isTracking || typeof window === "undefined") return;
        const rect = e.currentTarget.getBoundingClientRect();

        // Map mouse position relative to the avatar container
        const nx = Math.max(
            -1,
            Math.min(
                1,
                (e.clientX - rect.left - rect.width / 2) / (rect.width * 0.4),
            ),
        );
        const ny = Math.max(
            -1,
            Math.min(
                1,
                (e.clientY - rect.top - rect.height / 2) / (rect.height * 0.4),
            ),
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
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#f4f4f0] text-[#111111] font-sans selection:bg-[#007aff] selection:text-white bg-washi overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-[#f4f4f0]/80 backdrop-blur-md border-b border-[#e5e5e5] z-50 flex items-center justify-between px-6 sm:px-10">
                <div className="flex items-center gap-3">
                    <div className="size-3.5 bg-[#ff3b30] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" />
                    <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[#111]">
                        DOT_OS
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#interactive"
                        className="text-[12px] font-mono font-bold uppercase tracking-widest text-[#8e8e93] hover:text-[#111] transition-colors"
                    >
                        Playground
                    </a>
                    <a
                        href="#features"
                        className="text-[12px] font-mono font-bold uppercase tracking-widest text-[#8e8e93] hover:text-[#111] transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="https://xoboid.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] font-mono font-bold uppercase tracking-widest text-[#8e8e93] hover:text-[#111] transition-colors"
                    >
                        Architect
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/x0bd/proto-0"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex text-[#555] hover:text-[#111] transition-colors"
                    >
                        <SiGithub className="size-5" />
                    </a>
                    <Link
                        href="/companion"
                        className="px-5 py-2 bg-[#007aff] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_16px_rgba(0,122,255,0.4)] transition-all active:scale-95"
                    >
                        Initialize
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 px-6 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="px-3 py-1 bg-white border border-[#e5e5e5] rounded-full font-mono text-[10px] font-bold uppercase tracking-widest mb-8 text-[#555] shadow-sm"
                >
                    v0.1.0 Experimental
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[44px] sm:text-[64px] md:text-[80px] font-bold tracking-tight text-[#111111] max-w-[900px] leading-[1.05] mb-8"
                >
                    Machine emotion, <br className="hidden sm:block" />
                    mapped to geometry.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-[17px] sm:text-[20px] font-medium text-[#555555] max-w-[600px] mb-12 leading-relaxed"
                >
                    Create an expressive, real-time AI companion. No text, no
                    generic icons, no chrome. Just responsive shape and motion.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-[600px]"
                >
                    <Link
                        href="/companion"
                        className="w-full sm:w-auto bg-[#007aff] text-white px-8 py-4 rounded-[16px] flex items-center justify-center gap-2.5 shadow-[0_8px_16px_rgba(0,122,255,0.25)] hover:shadow-[0_12px_24px_rgba(0,122,255,0.3)] transition-all border-b-[5px] border-[#005bb5] active:border-b-0 active:translate-y-[5px]"
                    >
                        <RiPlayFill className="size-6" />
                        <span className="text-[14px] sm:text-[15px] font-bold tracking-[0.1em] uppercase translate-y-px">
                            Launch App
                        </span>
                    </Link>
                    <a
                        href="https://www.npmjs.com/package/@xoboid/avatar"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto bg-[#ff3b30] text-white px-8 py-4 rounded-[16px] flex items-center justify-center gap-2.5 shadow-[0_8px_16px_rgba(255,59,48,0.2)] hover:shadow-[0_12px_24px_rgba(255,59,48,0.25)] transition-all border-b-[5px] border-[#cc2f26] active:border-b-0 active:translate-y-[5px]"
                    >
                        <SiNpm className="size-6" />
                        <span className="text-[14px] sm:text-[15px] font-bold tracking-[0.1em] uppercase translate-y-px">
                            NPM Package
                        </span>
                    </a>
                </motion.div>
            </section>

            {/* Interactive Showcase Section */}
            <section
                id="interactive"
                className="px-4 sm:px-6 w-full max-w-[1200px] mx-auto pb-24"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col lg:flex-row gap-6"
                >
                    {/* Left: The Avatar Screen Module */}
                    <div
                        className="w-full lg:w-[60%] aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#eeeeee] rounded-[24px] sm:rounded-[32px] relative flex flex-col justify-between overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.04),0_24px_48px_rgba(0,0,0,0.05)] p-5 sm:p-8 border border-[#e5e5e5]"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Screen overlay effects */}
                        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22%3E%3Crect width=%224%22 height=%224%22 fill=%22%23fff%22 fill-opacity=%220.05%22/%3E%3C/svg%3E')] mix-blend-overlay" />

                        {/* HUD Top */}
                        <div className="flex justify-between items-start z-20 relative pointer-events-none">
                            <div className="flex flex-col gap-1">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                                    SYS.STATE
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="size-1.5 rounded-full bg-[#007aff] animate-pulse shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
                                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#007aff]">
                                        ONLINE
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                                    EMOTION
                                </span>
                                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#111111]">
                                    ACTIVE
                                </span>
                            </div>
                        </div>

                        {/* The Massive Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="w-[120%] sm:w-[100%] max-w-[700px] aspect-[4/3] flex items-center justify-center translate-y-4">
                                <Avatar
                                    emotion={emotion}
                                    variant={variant}
                                    accentColor={accentColor}
                                />
                            </div>
                        </div>

                        {/* HUD Bottom */}
                        <div className="flex justify-between items-end z-20 relative mt-auto px-2 sm:px-4 pointer-events-none">
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

                    {/* Right: Controls Console */}
                    <div className="w-full lg:w-[40%] bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 flex flex-col border border-[#e5e5e5] shadow-[0_12px_32px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-between mb-10">
                            <h3
                                className="font-display text-[32px] sm:text-[40px] leading-none font-bold tracking-widest text-[#111111]"
                                style={{
                                    fontFamily: '"Doto", sans-serif',
                                    letterSpacing: "0.1em",
                                }}
                            >
                                <span className="border-b-[3px] border-dotted border-[#111111] pb-1 inline-block">
                                    CONTROLS
                                </span>
                            </h3>
                        </div>

                        <div className="flex flex-col gap-8 flex-1">
                            {/* Variant Toggle */}
                            <div className="flex flex-col gap-3">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                                    FACE ARCHITECTURE
                                </span>
                                <div className="flex flex-wrap gap-2 bg-[#f4f4f0] p-1.5 rounded-xl border border-[#e5e5e5]">
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
                                            className={`flex-1 px-3 py-2.5 rounded-lg font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all ${variant === v ? "bg-[#111111] text-white shadow-md" : "text-[#555] hover:text-[#111] hover:bg-white"}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Toggle */}
                            <div className="flex flex-col gap-3">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                                    ACCENT COLOR
                                </span>
                                <div className="flex gap-4">
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
                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-transform shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] ${accentColor === c.hex ? "scale-110 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_0_0_3px_#fff,0_0_0_6px_#111]" : "hover:scale-105"}`}
                                            style={{ backgroundColor: c.hex }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Emotion Toggle */}
                            <div className="flex flex-col gap-3">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                                    MOOD OVERRIDE
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setIsTracking(true)}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${isTracking ? "border-[#111] text-[#111] bg-white shadow-sm" : "border-[#e5e5e5] bg-[#f4f4f0] text-[#8e8e93] hover:text-[#111]"}`}
                                    >
                                        CURSOR TRACK
                                    </button>
                                    {Object.keys(EMOTION_PRESETS)
                                        .filter((k) => k !== "Neutral")
                                        .map((m) => (
                                            <button
                                                key={m}
                                                onClick={() =>
                                                    setEmotionPreset(m)
                                                }
                                                className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${!isTracking && emotion === EMOTION_PRESETS[m] ? "bg-[#111] text-white shadow-md" : "bg-[#f4f4f0] border border-[#e5e5e5] text-[#555] hover:text-[#111] hover:bg-white"}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex items-end justify-between border-t border-[#e5e5e5] pt-8">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8e8e93] font-bold">
                                    ARCHITECT
                                </span>
                                <a
                                    href="https://xoboid.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-sans text-[16px] font-bold tracking-tight text-[#111111] hover:text-[#007aff] transition-colors"
                                >
                                    xoboid.com
                                </a>
                            </div>
                            <div className="flex gap-2 opacity-30">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="size-2 rounded-full bg-[#111111]"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="py-24 sm:py-32 bg-white border-t border-[#e5e5e5]"
            >
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-16 sm:mb-20">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111111] mb-6">
                            Designed for pure expression.
                        </h2>
                        <p className="text-lg text-[#555] max-w-[600px] mx-auto font-medium">
                            Under the hood, DOT is powered by sub-frame
                            precision math and robust web APIs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <FeatureCard
                            icon={<RiShapeFill className="size-6 text-white" />}
                            color="#007aff"
                            title="Procedural Geometry"
                            description="No baked keyframes or snapping. Every expression is interpolated across a 5-axis emotion engine rendering crisp, scalable SVG paths."
                        />
                        <FeatureCard
                            icon={
                                <RiVoiceprintFill className="size-6 text-[#111111]" />
                            }
                            color="#ffcc00"
                            title="Voice Reactive"
                            description="Harnesses the Web Audio API for real-time multi-band frequency analysis. Bass drives breathing, while mids drive mouth articulation."
                        />
                        <FeatureCard
                            icon={
                                <RiShieldKeyholeFill className="size-6 text-white" />
                            }
                            color="#34c759"
                            title="BYOK Privacy First"
                            description="A local-first encrypted key vault means your OpenAI and ElevenLabs keys never touch a server. Run it securely on your own device."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#111111] text-white py-12 px-6">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-4 bg-white rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                        <span className="font-mono text-[12px] font-bold uppercase tracking-widest">
                            DOT_OS
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/x0bd/proto-0"
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://www.npmjs.com/package/@xoboid/avatar"
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                        >
                            NPM
                        </a>
                        <a
                            href="https://xoboid.com"
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                        >
                            xoboid.com
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Subcomponents

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
        <div className="flex flex-col gap-1.5 w-16 sm:w-20">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                {label}
            </span>
            <div className="h-2 w-full bg-[#d4d4d4] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${value * 100}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    color,
    title,
    description,
}: {
    icon: React.ReactNode;
    color: string;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-[#f4f4f0] rounded-[24px] p-8 border border-[#e5e5e5] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-shadow">
            <div
                className="size-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{
                    backgroundColor: color,
                    boxShadow: `0 8px 24px -4px ${color}60`,
                }}
            >
                {icon}
            </div>
            <h4 className="font-sans text-[20px] font-bold tracking-tight text-[#111111] mb-3">
                {title}
            </h4>
            <p className="text-[15px] text-[#555] leading-relaxed font-medium">
                {description}
            </p>
        </div>
    );
}
