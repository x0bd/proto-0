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
        <div className="min-h-screen bg-[#f4f4f0] text-[#111111] font-mono selection:bg-[var(--te-blue)] selection:text-white bg-washi overflow-x-hidden">
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
                className="fixed top-6 left-1/2 w-[90%] max-w-[800px] h-14 bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-full z-50 flex items-center justify-between px-5"
                style={{
                    boxShadow:
                        "0 8px 32px rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.04),inset 0 1px 1px rgba(255,255,255,0.8)",
                }}
            >
                <div className="flex items-center gap-3 pl-2">
                    <div className="size-3 bg-[#111] rounded-full shadow-sm" />
                    <span className="font-mono text-[11px] font-black tracking-[0.2em] uppercase">
                        DOT
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#interactive"
                        className="te-label hover:text-foreground transition-colors"
                    >
                        Playground
                    </a>
                    <a
                        href="#features"
                        className="te-label hover:text-foreground transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#faq"
                        className="te-label hover:text-foreground transition-colors"
                    >
                        FAQ
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="https://github.com/x0bd/proto-0"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex size-8 rounded-full items-center justify-center te-label hover:bg-black/5 transition-colors"
                    >
                        <SiGithub className="size-4" />
                    </a>
                    <Link
                        href="/companion"
                        className="te-button px-5 py-2 text-[10px] tracking-[0.2em] bg-[#111] text-white"
                        style={{
                            borderColor: "#111",
                            borderBottomColor: "#333",
                        }}
                    >
                        BOOT_UP
                    </Link>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 sm:pt-48 sm:pb-32 px-6 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="te-lcd px-4 py-1.5 text-[10px] tracking-[0.3em] mb-8 flex items-center gap-2"
                >
                    <div
                        className="size-1.5 rounded-full bg-[var(--te-blue)] animate-pulse"
                        style={{ boxShadow: "0 0 6px var(--te-blue)" }}
                    />
                    V0.1.0 // EXPERIMENTAL
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[48px] sm:text-[72px] md:text-[88px] font-mono font-black tracking-[-0.02em] text-[#111111] max-w-[900px] leading-[1.05] mb-8"
                >
                    Machine emotion, <br className="hidden sm:block" />
                    mapped to geometry.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-mono text-[16px] sm:text-[18px] text-[#555555] max-w-[600px] mb-12 leading-relaxed"
                >
                    An expressive, real-time AI companion. No text, no generic
                    icons, no chrome. Just responsive shape and motion.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-[600px]"
                >
                    <Link
                        href="/companion"
                        className="te-button w-full sm:w-auto px-8 py-4 gap-2.5 text-[12px] tracking-[0.15em]"
                        style={{
                            backgroundColor: "var(--te-blue)",
                            color: "white",
                            borderColor: "var(--te-blue)",
                            borderBottomColor: "#0055bb",
                        }}
                    >
                        <RiPlayFill className="size-5" />
                        LAUNCH_APP
                    </Link>
                    <a
                        href="https://www.npmjs.com/package/@xoboid/avatar"
                        target="_blank"
                        rel="noreferrer"
                        className="te-button w-full sm:w-auto px-8 py-4 gap-2.5 text-[12px] tracking-[0.15em]"
                    >
                        <SiNpm className="size-5" />
                        NPM_PKG
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
                        className="w-full lg:w-[60%] aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#111] rounded-[16px] relative flex flex-col justify-between overflow-hidden p-6 sm:p-8 border border-[#2a2a2a]"
                        style={{
                            boxShadow:
                                "0 32px 64px -16px rgba(0,0,0,0.25),0 16px 32px -8px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.04)",
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Scanline overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)",
                            }}
                        />

                        {/* HUD Top */}
                        <div className="flex justify-between items-start z-20 relative pointer-events-none">
                            <div className="flex flex-col gap-1">
                                <span className="te-label text-white/40">
                                    STATE
                                </span>
                                <div
                                    className="te-lcd flex items-center gap-1.5 px-2 py-1 text-[10px] bg-[#1a1a1a] text-white border-[#2a2a2a]"
                                >
                                    <div
                                        className="size-1.5 rounded-full bg-[var(--te-green)] shrink-0"
                                        style={{
                                            boxShadow:
                                                "0 0 6px var(--te-green)",
                                        }}
                                    />
                                    ONLINE
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="te-label text-white/40">
                                    INPUT
                                </span>
                                <div className="te-lcd px-2 py-1 text-[10px] bg-[#1a1a1a] text-white border-[#2a2a2a]">
                                    {isTracking ? "CURSOR" : "OVERRIDE"}
                                </div>
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
                    <div className="w-full lg:w-[40%] te-panel flex flex-col overflow-hidden rounded-[16px]">
                        {/* Module header */}
                        <div className="te-module-header">
                            <div className="flex items-center gap-2">
                                <div className="te-grip w-8 h-3" />
                                <span className="te-label">SYS.CTRL</span>
                            </div>
                            <span className="te-label">PLAYGROUND_v1</span>
                        </div>

                        <div className="p-8 sm:p-10 flex flex-col flex-1">
                            <div className="flex flex-col gap-8 flex-1">
                                {/* Variant Toggle */}
                                <div className="flex flex-col gap-3">
                                    <span className="te-label">
                                        ARCHITECTURE
                                    </span>
                                    <div className="te-recessed p-1.5 flex flex-wrap gap-2">
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
                                                className="te-button flex-1 px-3 py-3 text-[10px] tracking-[0.15em] transition-all"
                                                style={
                                                    variant === v
                                                        ? {
                                                              backgroundColor:
                                                                  "#111",
                                                              color: "white",
                                                              borderColor:
                                                                  "#111",
                                                              borderBottomColor:
                                                                  "#333",
                                                          }
                                                        : {}
                                                }
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Toggle */}
                                <div className="flex flex-col gap-3">
                                    <span className="te-label">ACCENT_CLR</span>
                                    <div className="flex gap-3">
                                        {[
                                            {
                                                id: "red",
                                                hex: "#ff3b30",
                                                shadow: "#b32200",
                                            },
                                            {
                                                id: "blue",
                                                hex: "#007aff",
                                                shadow: "#0055bb",
                                            },
                                            {
                                                id: "green",
                                                hex: "#34c759",
                                                shadow: "#1e8c3a",
                                            },
                                            {
                                                id: "yellow",
                                                hex: "#ffcc00",
                                                shadow: "#b38f00",
                                            },
                                        ].map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() =>
                                                    setAccentColor(c.hex)
                                                }
                                                className="te-button w-12 h-12 transition-all"
                                                style={{
                                                    backgroundColor: c.hex,
                                                    borderColor: c.hex,
                                                    borderBottomColor: c.shadow,
                                                    transform:
                                                        accentColor === c.hex
                                                            ? "scale(1.1)"
                                                            : "",
                                                    outline:
                                                        accentColor === c.hex
                                                            ? "2px solid #111"
                                                            : "none",
                                                    outlineOffset: "2px",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Emotion Toggle */}
                                <div className="flex flex-col gap-3">
                                    <span className="te-label">OVERRIDE</span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setIsTracking(true)}
                                            className="te-button px-4 py-2.5 text-[10px] tracking-[0.15em]"
                                            style={
                                                isTracking
                                                    ? {
                                                          backgroundColor:
                                                              "#111",
                                                          color: "white",
                                                          borderColor: "#111",
                                                          borderBottomColor:
                                                              "#333",
                                                      }
                                                    : {}
                                            }
                                        >
                                            Cursor
                                        </button>
                                        {Object.keys(EMOTION_PRESETS)
                                            .filter((k) => k !== "Neutral")
                                            .map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() =>
                                                        setEmotionPreset(m)
                                                    }
                                                    className="te-button px-4 py-2.5 text-[10px] tracking-[0.15em]"
                                                    style={
                                                        !isTracking &&
                                                        emotion ===
                                                            EMOTION_PRESETS[m]
                                                            ? {
                                                                  backgroundColor:
                                                                      "#111",
                                                                  color: "white",
                                                                  borderColor:
                                                                      "#111",
                                                                  borderBottomColor:
                                                                      "#333",
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 border-t border-[var(--panel-border)] pt-6">
                                <span className="te-label">
                                    CRAFTED BY{" "}
                                    <a
                                        href="https://xoboid.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="te-value hover:text-[var(--te-orange)] transition-colors"
                                    >
                                        XOBOID.COM
                                    </a>
                                </span>
                            </div>
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
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block te-lcd px-3 py-1 text-[10px] tracking-[0.3em] mb-6 bg-[#1a1a1a] text-white/50 border-[#2a2a2a]"
                        >
                            // SYS.MODULES
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-mono font-black text-[36px] sm:text-[48px] md:text-[56px] tracking-[-0.02em] mb-6"
                        >
                            Designed for pure expression.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-mono text-[16px] sm:text-[18px] text-white/50 max-w-[600px] mx-auto"
                        >
                            Powered by sub-frame precision math and robust web
                            APIs.
                        </motion.p>
                    </div>

                    {/* 4x2 Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-min md:auto-rows-[300px] gap-6">
                        {/* Bento 1: Large (2x2) - Procedural Geometry */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[400px] md:min-h-0 bg-[#141414] border border-[#2a2a2a] rounded-[12px] overflow-hidden flex flex-col group"
                            style={{
                                boxShadow:
                                    "0 32px 64px -16px rgba(0,0,0,0.95),0 16px 32px -8px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.04)",
                            }}
                        >
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
                                <span className="te-label text-white/40">
                                    MODULE_01
                                </span>
                                <span className="te-label text-white/20">
                                    PROC.GEO
                                </span>
                            </div>
                            <div className="relative flex flex-col flex-1 p-8 sm:p-10">
                                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[var(--te-blue)]/20 blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

                                <button
                                    className="te-button size-14 mb-auto relative z-10"
                                    style={{
                                        backgroundColor: "var(--te-blue)",
                                        borderColor: "var(--te-blue)",
                                        borderBottomColor: "#0055bb",
                                    }}
                                >
                                    <RiShapeFill className="size-6 text-white" />
                                </button>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[120%] aspect-square border border-white/10 rounded-full opacity-50 pointer-events-none transition-transform duration-1000 group-hover:rotate-12" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[80%] aspect-square border border-white/10 rounded-full opacity-50 pointer-events-none transition-transform duration-1000 group-hover:-rotate-12" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[40%] aspect-square border border-white/20 rounded-full opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-110" />

                                <div className="relative z-10 mt-32">
                                    <h4 className="font-mono font-black text-[26px] sm:text-[30px] tracking-[-0.01em] uppercase text-white mb-3">
                                        Procedural
                                        <br />
                                        Geometry
                                    </h4>
                                    <p className="font-mono text-[14px] text-white/50 leading-relaxed max-w-[400px]">
                                        No baked keyframes or snapping. Every
                                        expression is interpolated across a
                                        5-axis emotion engine rendering crisp
                                        SVG paths in real time.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bento 2: Wide (2x1) - Voice Reactive */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="col-span-1 md:col-span-2 row-span-1 min-h-[300px] md:min-h-0 bg-[#141414] border border-[#2a2a2a] rounded-[12px] overflow-hidden flex flex-col group"
                            style={{
                                boxShadow:
                                    "0 32px 64px -16px rgba(0,0,0,0.95),inset 0 1px 0 rgba(255,255,255,0.04)",
                            }}
                        >
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
                                <span className="te-label text-white/40">
                                    MODULE_02
                                </span>
                                <span className="te-label text-white/20">
                                    AUDIO.SYS
                                </span>
                            </div>
                            <div className="relative flex flex-col justify-between flex-1 p-8 sm:p-10">
                                <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
                                    {[40, 70, 40, 100, 60, 80, 30].map(
                                        (h, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-3 bg-white rounded-sm"
                                                animate={{
                                                    height: [
                                                        h * 0.5,
                                                        h,
                                                        h * 0.5,
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: i * 0.1,
                                                }}
                                            />
                                        ),
                                    )}
                                </div>

                                <button
                                    className="te-button size-14 relative z-10 mb-6"
                                    style={{
                                        backgroundColor: "var(--te-yellow)",
                                        borderColor: "var(--te-yellow)",
                                        borderBottomColor: "#b38f00",
                                    }}
                                >
                                    <RiVoiceprintFill className="size-6 text-[#111]" />
                                </button>

                                <div className="relative z-10 max-w-[320px]">
                                    <h4 className="font-mono font-black text-[22px] tracking-[-0.01em] uppercase text-white mb-2">
                                        Voice Reactive
                                    </h4>
                                    <p className="font-mono text-[13px] text-white/50 leading-relaxed">
                                        Real-time multi-band frequency analysis
                                        via Web Audio API.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bento 3: Small (1x1) - BYOK Privacy */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="col-span-1 row-span-1 min-h-[300px] md:min-h-0 bg-[#141414] border border-[#2a2a2a] rounded-[12px] overflow-hidden flex flex-col group"
                            style={{
                                boxShadow:
                                    "0 32px 64px -16px rgba(0,0,0,0.95),inset 0 1px 0 rgba(255,255,255,0.04)",
                            }}
                        >
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
                                <span className="te-label text-white/40">
                                    MODULE_03
                                </span>
                                <span className="te-label text-white/20">
                                    KEY.VAULT
                                </span>
                            </div>
                            <div className="relative flex flex-col justify-between flex-1 p-8">
                                <button
                                    className="te-button size-14 relative z-10"
                                    style={{
                                        backgroundColor: "var(--te-green)",
                                        borderColor: "var(--te-green)",
                                        borderBottomColor: "#1e8c3a",
                                    }}
                                >
                                    <RiShieldKeyholeFill className="size-6 text-white" />
                                </button>

                                <div className="relative z-10 mt-6">
                                    <h4 className="font-mono font-black text-[18px] uppercase tracking-tight text-white mb-2">
                                        BYOK Privacy
                                    </h4>
                                    <p className="font-mono text-[13px] text-white/50 leading-relaxed">
                                        Local-first encrypted key vault. Keys
                                        never touch a server.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bento 4: Small (1x1) - GSAP Powered */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="col-span-1 row-span-1 min-h-[300px] md:min-h-0 bg-[#141414] border border-[#2a2a2a] rounded-[12px] overflow-hidden flex flex-col group"
                            style={{
                                boxShadow:
                                    "0 32px 64px -16px rgba(0,0,0,0.95),inset 0 1px 0 rgba(255,255,255,0.04)",
                            }}
                        >
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
                                <span className="te-label text-white/40">
                                    MODULE_04
                                </span>
                                <span className="te-label text-white/20">
                                    GSAP.ENG
                                </span>
                            </div>
                            <div className="relative flex flex-col justify-between flex-1 p-8">
                                <button
                                    className="te-button size-14 relative z-10"
                                    style={{
                                        backgroundColor: "var(--te-orange)",
                                        borderColor: "var(--te-orange)",
                                        borderBottomColor: "#b32200",
                                    }}
                                >
                                    <div className="font-mono text-white font-black text-[16px]">
                                        60
                                    </div>
                                </button>

                                <div className="relative z-10 mt-6">
                                    <h4 className="font-mono font-black text-[18px] uppercase tracking-tight text-white mb-2">
                                        GSAP Powered
                                    </h4>
                                    <p className="font-mono text-[13px] text-white/50 leading-relaxed">
                                        Sub-frame precision. Smooth
                                        interpolation out of the box.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 sm:py-32 bg-[#f4f4f0]">
                <div className="max-w-[800px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-block te-lcd px-3 py-1 text-[10px] tracking-[0.3em] mb-6">
                            SYS.FAQ
                        </div>
                        <h2 className="font-mono font-black text-[36px] sm:text-[48px] tracking-[-0.02em] text-[#111] mb-6">
                            Freq. Asked Questions
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3">
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
            <footer className="bg-[#111111] text-white py-12 px-6 border-t border-[#2a2a2a]">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-5 bg-white rounded-full flex items-center justify-center">
                            <div className="size-2 bg-[#111] rounded-full" />
                        </div>
                        <span className="font-mono text-[11px] font-black tracking-[0.2em] uppercase">
                            DOT
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/x0bd/proto-0"
                            target="_blank"
                            rel="noreferrer"
                            className="te-label text-white/40 hover:text-white transition-colors"
                        >
                            GITHUB
                        </a>
                        <a
                            href="https://www.npmjs.com/package/@xoboid/avatar"
                            target="_blank"
                            rel="noreferrer"
                            className="te-label text-white/40 hover:text-white transition-colors"
                        >
                            NPM
                        </a>
                        <a
                            href="https://xoboid.com"
                            target="_blank"
                            rel="noreferrer"
                            className="te-label text-white/40 hover:text-white transition-colors"
                        >
                            XOBOID.COM
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
            className="te-recessed px-5 py-5 cursor-pointer group"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex items-center justify-between gap-4">
                <h4 className="font-mono font-bold text-[15px] sm:text-[17px] text-[#111] group-hover:text-[var(--te-orange)] transition-colors">
                    {question}
                </h4>
                <div
                    className="te-button size-8 shrink-0"
                    style={{
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        transition: "transform 300ms ease",
                    }}
                >
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
                        <p className="pt-4 font-mono text-[13px] sm:text-[14px] text-[#555] leading-relaxed max-w-[90%]">
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
            <span className="te-label text-white/40">{label}</span>
            <div className="h-1.5 w-full bg-[#2a2a2a] rounded-sm overflow-hidden">
                <div
                    className="h-full transition-all duration-300 ease-out rounded-sm"
                    style={{
                        width: `${Math.max(5, value * 100)}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    );
}
