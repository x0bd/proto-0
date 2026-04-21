"use client";

import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import { EmotionState, FaceVariant } from "./components/face/types";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
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

const FAQS = [
    {
        question: "What is DOT?",
        answer: "DOT is an expressive, real-time AI companion. Instead of a standard chat interface, it uses procedural geometry to map a 5-axis emotional state directly onto a responsive face.",
    },
    {
        question: "Do I need an API key to use it?",
        answer: "DOT runs locally on your machine. To use the AI conversational features, you bring your own OpenAI and ElevenLabs API keys. These are stored securely in a local Key Vault and never sent to our servers.",
    },
    {
        question: "How does the emotion engine work?",
        answer: "It utilizes a sub-frame interpolation engine powered by GSAP. Every expression floats across joy, sadness, surprise, anger, and curiosity axes without ever snapping to a baked keyframe.",
    },
    {
        question: "Can I use the Avatar in my own project?",
        answer: "Yes. The core rendering engine and face geometry are available as a standalone React component via the @xoboid/avatar npm package.",
    },
];

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
            {/* The Island Navbar */}
            <motion.nav
                initial={{ y: -100, opacity: 0, x: "-50%" }}
                animate={{ y: 0, opacity: 1, x: "-50%" }}
                transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 200,
                    delay: 0.1,
                }}
                className="fixed top-6 left-1/2 w-[90%] max-w-[800px] h-14 bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] rounded-full z-50 flex items-center justify-between px-5"
            >
                <div className="flex items-center gap-3 pl-2">
                    <div className="size-3 bg-[#111] rounded-full shadow-sm" />
                    <span className="font-sans text-[15px] font-bold tracking-tight text-[#111]">
                        DOT
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#interactive"
                        className="text-[13px] font-medium tracking-tight text-[#555] hover:text-[#111] transition-colors"
                    >
                        Playground
                    </a>
                    <a
                        href="#features"
                        className="text-[13px] font-medium tracking-tight text-[#555] hover:text-[#111] transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#faq"
                        className="text-[13px] font-medium tracking-tight text-[#555] hover:text-[#111] transition-colors"
                    >
                        FAQ
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="https://github.com/x0bd/proto-0"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex size-8 rounded-full items-center justify-center text-[#555] hover:bg-black/5 hover:text-[#111] transition-colors"
                    >
                        <SiGithub className="size-4" />
                    </a>
                    <Link
                        href="/companion"
                        className="px-5 py-2 bg-[#111] text-white rounded-full text-[13px] font-semibold tracking-tight shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all active:scale-95"
                    >
                        Initialize
                    </Link>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 sm:pt-48 sm:pb-32 px-6 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="px-4 py-1.5 bg-white border border-[#e5e5e5] shadow-sm rounded-full font-sans text-[12px] font-semibold tracking-tight mb-8 text-[#555] flex items-center gap-2"
                >
                    <div className="size-1.5 rounded-full bg-[#007aff] animate-pulse" />
                    v0.1.0 Experimental
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[48px] sm:text-[72px] md:text-[88px] font-bold tracking-tight text-[#111111] max-w-[900px] leading-[1.05] mb-8 drop-shadow-sm"
                >
                    Machine emotion, <br className="hidden sm:block" />
                    mapped to geometry.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-[18px] sm:text-[22px] font-medium text-[#555555] max-w-[640px] mb-12 leading-relaxed"
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
                        className="w-full sm:w-auto bg-[#007aff] text-white px-8 py-4 rounded-full flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(0,122,255,0.3)] hover:shadow-[0_12px_32px_rgba(0,122,255,0.4)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95"
                    >
                        <RiPlayFill className="size-5" />
                        <span className="text-[16px] font-bold tracking-tight">
                            Launch App
                        </span>
                    </Link>
                    <a
                        href="https://www.npmjs.com/package/@xoboid/avatar"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto bg-white text-[#111] border border-[#e5e5e5] px-8 py-4 rounded-full flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95"
                    >
                        <SiNpm className="size-5" />
                        <span className="text-[16px] font-bold tracking-tight">
                            NPM Package
                        </span>
                    </a>
                </motion.div>
            </section>

            {/* Interactive Showcase Section */}
            <section
                id="interactive"
                className="px-4 sm:px-6 w-full max-w-[1200px] mx-auto pb-32"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col lg:flex-row gap-6"
                >
                    {/* Left: The Avatar Screen Module */}
                    <div
                        className="w-full lg:w-[60%] aspect-square sm:aspect-[4/3] lg:aspect-square bg-white rounded-[32px] sm:rounded-[40px] relative flex flex-col justify-between overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.03)] p-6 sm:p-8 border border-white/50"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Subtle Inner Shadow instead of harsh borders */}
                        <div className="absolute inset-0 shadow-[inset_0_2px_12px_rgba(0,0,0,0.02)] rounded-[32px] sm:rounded-[40px] pointer-events-none" />

                        {/* Screen overlay effects */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22%3E%3Crect width=%224%22 height=%224%22 fill=%22%23000%22 fill-opacity=%221%22/%3E%3C/svg%3E')] mix-blend-overlay" />

                        {/* HUD Top */}
                        <div className="flex justify-between items-start z-20 relative pointer-events-none">
                            <div className="flex flex-col gap-1">
                                <span className="font-sans text-[11px] font-semibold tracking-widest uppercase text-[#8e8e93]">
                                    State
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="size-2 rounded-full bg-[#34c759] shadow-[0_0_8px_rgba(52,199,89,0.8)]" />
                                    <span className="font-sans text-[13px] font-bold tracking-tight text-[#111]">
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="font-sans text-[11px] font-semibold tracking-widest uppercase text-[#8e8e93]">
                                    Status
                                </span>
                                <span className="font-sans text-[13px] font-bold tracking-tight text-[#111]">
                                    Tracking
                                </span>
                            </div>
                        </div>

                        {/* The Massive Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="w-[110%] sm:w-[90%] max-w-[700px] aspect-[4/3] flex items-center justify-center translate-y-4">
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
                                label="Joy"
                                value={emotion.joy}
                                color={accentColor}
                            />
                            <Meter
                                label="Anger"
                                value={emotion.anger}
                                color={accentColor}
                            />
                            <Meter
                                label="Curiosity"
                                value={emotion.curiosity}
                                color={accentColor}
                            />
                        </div>
                    </div>

                    {/* Right: Controls Console */}
                    <div className="w-full lg:w-[40%] bg-white/60 backdrop-blur-xl rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 flex flex-col border border-[#e5e5e5] shadow-[0_12px_32px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="font-sans text-[28px] sm:text-[32px] leading-none font-bold tracking-tight text-[#111111]">
                                Playground
                            </h3>
                        </div>

                        <div className="flex flex-col gap-8 flex-1">
                            {/* Variant Toggle */}
                            <div className="flex flex-col gap-3">
                                <span className="font-sans text-[12px] font-semibold uppercase tracking-widest text-[#8e8e93]">
                                    Architecture
                                </span>
                                <div className="flex flex-wrap gap-2 bg-[#f4f4f0] p-1.5 rounded-[16px] shadow-inner">
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
                                            className={`flex-1 px-3 py-3 rounded-[12px] font-sans text-[13px] font-semibold tracking-tight transition-all ${variant === v ? "bg-white text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.08)]" : "text-[#8e8e93] hover:text-[#111] hover:bg-white/50"}`}
                                        >
                                            {v.charAt(0).toUpperCase() +
                                                v.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Toggle */}
                            <div className="flex flex-col gap-3">
                                <span className="font-sans text-[12px] font-semibold uppercase tracking-widest text-[#8e8e93]">
                                    Accent Color
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
                                            className={`w-12 h-12 rounded-full transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)] ${accentColor === c.hex ? "scale-110 shadow-[inset_0_2px_6px_rgba(0,0,0,0.2),0_0_0_4px_#fff,0_0_0_6px_#111]" : "hover:scale-105"}`}
                                            style={{ backgroundColor: c.hex }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Emotion Toggle */}
                            <div className="flex flex-col gap-3">
                                <span className="font-sans text-[12px] font-semibold uppercase tracking-widest text-[#8e8e93]">
                                    Override
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setIsTracking(true)}
                                        className={`px-5 py-2.5 rounded-full font-sans text-[13px] font-semibold tracking-tight transition-all ${isTracking ? "bg-[#111] text-white shadow-md" : "bg-white border border-[#e5e5e5] text-[#555] hover:text-[#111] hover:shadow-sm"}`}
                                    >
                                        Cursor Track
                                    </button>
                                    {Object.keys(EMOTION_PRESETS)
                                        .filter((k) => k !== "Neutral")
                                        .map((m) => (
                                            <button
                                                key={m}
                                                onClick={() =>
                                                    setEmotionPreset(m)
                                                }
                                                className={`px-5 py-2.5 rounded-full font-sans text-[13px] font-semibold tracking-tight transition-all ${!isTracking && emotion === EMOTION_PRESETS[m] ? "bg-[#111] text-white shadow-md" : "bg-white border border-[#e5e5e5] text-[#555] hover:text-[#111] hover:shadow-sm"}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center justify-between border-t border-[#e5e5e5] pt-8">
                            <span className="font-sans text-[13px] font-medium text-[#8e8e93]">
                                Crafted by{" "}
                                <a
                                    href="https://xoboid.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-[#111] hover:text-[#007aff] transition-colors"
                                >
                                    xoboid.com
                                </a>
                            </span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Bento Box Features Section */}
            <section
                id="features"
                className="py-24 sm:py-32 bg-[#111111] text-white"
            >
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-16 sm:mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[36px] sm:text-[48px] md:text-[56px] font-bold tracking-tight mb-6"
                        >
                            Designed for pure expression.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-[18px] sm:text-[20px] text-white/60 max-w-[600px] mx-auto font-medium"
                        >
                            Under the hood, DOT is powered by sub-frame
                            precision math and robust web APIs.
                        </motion.p>
                    </div>

                    {/* 4x2 Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-min md:auto-rows-[300px] gap-6">
                        {/* Bento 1: Large (2x2) - Procedural Geometry */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[400px] md:min-h-0 bg-[#1c1c1e] rounded-[32px] p-8 sm:p-10 flex flex-col relative overflow-hidden group border border-white/10"
                        >
                            {/* Ambient Background Glow */}
                            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#007aff]/30 blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

                            <div className="size-14 rounded-full bg-[#007aff] flex items-center justify-center mb-auto shadow-[0_8px_24px_-4px_rgba(0,122,255,0.6)] relative z-10">
                                <RiShapeFill className="size-6 text-white" />
                            </div>

                            {/* Abstract SVG Geometry Visual */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[120%] aspect-square border border-white/10 rounded-full opacity-50 pointer-events-none transition-transform duration-1000 group-hover:rotate-12" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[80%] aspect-square border border-white/10 rounded-full opacity-50 pointer-events-none transition-transform duration-1000 group-hover:-rotate-12" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[40%] aspect-square border border-white/20 rounded-full opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-110" />

                            <div className="relative z-10 mt-32">
                                <h4 className="font-sans text-[28px] sm:text-[32px] font-bold tracking-tight text-white mb-4">
                                    Procedural Geometry
                                </h4>
                                <p className="text-[16px] text-white/60 leading-relaxed font-medium max-w-[400px]">
                                    No baked keyframes or snapping. Every
                                    expression is interpolated across a 5-axis
                                    emotion engine rendering crisp, scalable SVG
                                    paths in real time.
                                </p>
                            </div>
                        </motion.div>

                        {/* Bento 2: Wide (2x1) - Voice Reactive */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="col-span-1 md:col-span-2 row-span-1 min-h-[300px] md:min-h-0 bg-[#1c1c1e] rounded-[32px] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border border-white/10 group"
                        >
                            <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
                                {[40, 70, 40, 100, 60, 80, 30].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-3 bg-white rounded-full"
                                        animate={{
                                            height: [h * 0.5, h, h * 0.5],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: i * 0.1,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="size-14 rounded-full bg-[#ffcc00] flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(255,204,0,0.4)] relative z-10 mb-6">
                                <RiVoiceprintFill className="size-6 text-[#111111]" />
                            </div>

                            <div className="relative z-10 max-w-[320px]">
                                <h4 className="font-sans text-[24px] font-bold tracking-tight text-white mb-3">
                                    Voice Reactive
                                </h4>
                                <p className="text-[16px] text-white/60 leading-relaxed font-medium">
                                    Harnesses the Web Audio API for real-time
                                    multi-band frequency analysis.
                                </p>
                            </div>
                        </motion.div>

                        {/* Bento 3: Small (1x1) - BYOK Privacy */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="col-span-1 row-span-1 min-h-[300px] md:min-h-0 bg-[#1c1c1e] rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden border border-white/10 group"
                        >
                            <div className="size-14 rounded-full bg-[#34c759] flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(52,199,89,0.4)] relative z-10">
                                <RiShieldKeyholeFill className="size-6 text-white" />
                            </div>

                            <div className="relative z-10 mt-6">
                                <h4 className="font-sans text-[20px] font-bold tracking-tight text-white mb-2">
                                    BYOK Privacy
                                </h4>
                                <p className="text-[15px] text-white/60 leading-relaxed font-medium">
                                    Local-first encrypted key vault. Keys never
                                    touch a server.
                                </p>
                            </div>
                        </motion.div>

                        {/* Bento 4: Small (1x1) - GSAP Powered */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="col-span-1 row-span-1 min-h-[300px] md:min-h-0 bg-[#1c1c1e] rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden border border-white/10 group"
                        >
                            <div className="size-14 rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(255,59,48,0.4)] relative z-10">
                                <div className="font-mono text-white font-bold text-[16px] translate-y-px">
                                    60
                                </div>
                            </div>

                            <div className="relative z-10 mt-6">
                                <h4 className="font-sans text-[20px] font-bold tracking-tight text-white mb-2">
                                    GSAP Powered
                                </h4>
                                <p className="text-[15px] text-white/60 leading-relaxed font-medium">
                                    Sub-frame precision. Smooth interpolation
                                    out of the box.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 sm:py-32 bg-[#f4f4f0]">
                <div className="max-w-[800px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-[36px] sm:text-[48px] font-bold tracking-tight text-[#111] mb-6">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="flex flex-col divide-y divide-[#e5e5e5] border-y border-[#e5e5e5]">
                        {FAQS.map((faq, idx) => (
                            <FAQItem
                                key={idx}
                                question={faq.question}
                                answer={faq.answer}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#111111] text-white py-12 px-6">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-5 bg-white rounded-full flex items-center justify-center">
                            <div className="size-2 bg-[#111] rounded-full" />
                        </div>
                        <span className="font-sans text-[15px] font-bold tracking-tight">
                            DOT
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/x0bd/proto-0"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-medium tracking-tight text-white/60 hover:text-white transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://www.npmjs.com/package/@xoboid/avatar"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-medium tracking-tight text-white/60 hover:text-white transition-colors"
                        >
                            NPM
                        </a>
                        <a
                            href="https://xoboid.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-medium tracking-tight text-white/60 hover:text-white transition-colors"
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="py-6 sm:py-8 cursor-pointer group"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-[18px] sm:text-[22px] font-semibold tracking-tight text-[#111] group-hover:text-[#007aff] transition-colors">
                    {question}
                </h4>
                <div
                    className="size-8 sm:size-10 rounded-full bg-white border border-[#e5e5e5] shadow-sm flex items-center justify-center shrink-0 transition-transform duration-300 ease-out"
                    style={{
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                >
                    {/* Plus icon made of div strips */}
                    <div className="relative size-3.5">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 bg-[#111] rounded-full" />
                        <div className="absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-[#111] rounded-full" />
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="pt-4 sm:pt-6 text-[16px] sm:text-[18px] text-[#555] leading-relaxed font-medium max-w-[90%]">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

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
            <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#8e8e93]">
                {label}
            </span>
            <div className="h-1.5 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-300 ease-out rounded-full"
                    style={{
                        width: `${Math.max(5, value * 100)}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    );
}
