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
    RiArrowRightLine,
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

/* ─── Reusable HW Button (bypasses te-button bg cascade issue) ─────────── */
function HwButton({
    children,
    className = "",
    bg = "var(--key-bg)",
    borderColor = "var(--key-border)",
    shadowColor = "var(--key-shadow)",
    color,
    onClick,
    as: Tag = "button",
    href,
    target,
    rel,
}: {
    children: React.ReactNode;
    className?: string;
    bg?: string;
    borderColor?: string;
    shadowColor?: string;
    color?: string;
    onClick?: () => void;
    as?: any;
    href?: string;
    target?: string;
    rel?: string;
}) {
    const style: React.CSSProperties = {
        backgroundColor: bg,
        border: `1px solid ${borderColor}`,
        borderBottom: `4px solid ${shadowColor}`,
        color: color,
    };
    const cls = `inline-flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-widest rounded-[8px] transition-all duration-75 active:border-b-[1px] active:translate-y-[3px] ${className}`;
    if (Tag === "a" || href) {
        return (
            <Tag href={href} target={target} rel={rel} className={cls} style={style} onClick={onClick}>
                {children}
            </Tag>
        );
    }
    return (
        <Tag className={cls} style={style} onClick={onClick}>
            {children}
        </Tag>
    );
}

export default function LandingPage() {
    const [emotion, setEmotion] = useState<EmotionState>(EMOTION_PRESETS.Neutral);
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
        const nx = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / (rect.width * 0.4)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / (rect.height * 0.4)));
        const r = Math.min(1, Math.hypot(nx, ny));
        const deadZone = 0.1;
        const intensity = r <= deadZone ? 0 : smooth01((r - deadZone) / (1 - deadZone));
        setEmotion({
            joy: smooth01(-ny) * intensity,
            sadness: smooth01(ny) * intensity,
            surprise: smooth01(Math.abs(ny) * 0.6) * 0.7 * intensity,
            anger: smooth01(Math.max(0, Math.abs(nx) - 0.55) / 0.45) * 0.65 * intensity,
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

            {/* ── Navbar ───────────────────────────────────────────────────── */}
            <motion.nav
                initial={{ y: -100, opacity: 0, x: "-50%" }}
                animate={{ y: 0, opacity: 1, x: "-50%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }}
                className="fixed top-5 left-1/2 w-[90%] max-w-[820px] h-[52px] z-50 flex items-center justify-between px-4 rounded-full"
                style={{
                    background: "rgba(244,244,240,0.85)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
            >
                <div className="flex items-center gap-2.5 pl-1">
                    <div className="size-2.5 rounded-full bg-[#111]" style={{ boxShadow: "0 0 0 3px rgba(0,0,0,0.06)" }} />
                    <span className="font-mono text-[12px] font-black tracking-[0.22em] uppercase text-[#111]">DOT</span>
                </div>

                <div className="hidden md:flex items-center gap-7">
                    {["Playground", "Features", "FAQ"].map((label, i) => (
                        <a
                            key={label}
                            href={`#${label.toLowerCase()}`}
                            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#555] hover:text-[#111] transition-colors"
                        >
                            {label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2.5">
                    <a
                        href="https://github.com/x0bd/proto-0"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex size-8 rounded-full items-center justify-center text-[#555] hover:bg-black/6 hover:text-[#111] transition-all"
                    >
                        <SiGithub className="size-[15px]" />
                    </a>
                    <HwButton
                        as={Link}
                        href="/companion"
                        bg="#111"
                        borderColor="#111"
                        shadowColor="#2a2a2a"
                        color="white"
                        className="px-5 py-[7px] text-[10px] tracking-[0.18em]"
                    >
                        BOOT_UP
                    </HwButton>
                </div>
            </motion.nav>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative pt-40 pb-16 sm:pt-48 sm:pb-24 px-6 w-full max-w-[1200px] mx-auto overflow-hidden">
                {/* Grid backdrop */}
                <div
                    className="absolute inset-x-0 top-0 h-full pointer-events-none"
                    style={{
                        backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                        maskImage: "radial-gradient(ellipse 70% 80% at 30% 40%,black 20%,transparent 80%)",
                        WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 30% 40%,black 20%,transparent 80%)",
                    }}
                />

                {/* Top identity bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative flex items-center justify-between mb-14 sm:mb-20"
                >
                    <div className="flex items-center gap-3 text-[#999]">
                        <span className="te-label">XOBOID.SYS</span>
                        <span className="te-label opacity-40">——</span>
                        <span className="te-label">PROTO.0</span>
                        <span className="te-label opacity-40">——</span>
                        <span className="te-label">ANNO&nbsp;2025</span>
                    </div>
                    <div
                        className="hidden sm:flex items-center gap-2 te-lcd px-3 py-1.5 text-[10px] tracking-[0.22em]"
                    >
                        <span
                            className="size-1.5 rounded-full bg-[var(--te-green)] shrink-0 animate-pulse"
                            style={{ boxShadow: "0 0 6px var(--te-green)" }}
                        />
                        STATUS&nbsp;:&nbsp;NOMINAL
                    </div>
                </motion.div>

                {/* Two-column layout */}
                <div className="relative flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

                    {/* Left: Headline + copy + CTAs */}
                    <div className="flex-1 min-w-0">

                        {/* Category label */}
                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 }}
                            className="flex items-center gap-2 mb-5"
                        >
                            <div className="w-4 h-px bg-[var(--te-orange)]" />
                            <span className="te-label text-[var(--te-orange)]">REAL-TIME AI COMPANION</span>
                        </motion.div>

                        {/* Staggered headline */}
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative font-mono font-black leading-[1.0] tracking-[-0.025em] mb-8"
                        >
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.12 }}
                                className="block text-[#bbb]"
                                style={{ fontSize: "clamp(32px, 4.5vw, 52px)" }}
                            >
                                Five emotions.
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="block text-[#111]"
                                style={{ fontSize: "clamp(56px, 9vw, 112px)" }}
                            >
                                One face.
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.28 }}
                                className="block text-[var(--te-orange)]"
                                style={{ fontSize: "clamp(56px, 9vw, 112px)" }}
                            >
                                Real time.
                            </motion.span>
                        </motion.h1>

                        {/* Description — specific, opinionated */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.36 }}
                            className="max-w-[480px] mb-10 space-y-3"
                        >
                            <p className="font-mono text-[14px] sm:text-[15px] text-[#444] leading-[1.8]">
                                DOT maps five independent emotion axes —{" "}
                                <span className="text-[#111] font-bold">joy, sadness, surprise, anger, curiosity</span>{" "}
                                — to real-time procedural SVG geometry. No baked keyframes. No preset animations.
                            </p>
                            <p className="font-mono text-[13px] text-[#888] leading-[1.7]">
                                Sub-frame interpolation via GSAP. Multi-band frequency analysis
                                via Web Audio API. Voice synthesis via ElevenLabs. Keys encrypted
                                locally via AES-GCM. Everything runs in your browser.
                            </p>
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.44 }}
                            className="flex flex-wrap gap-3"
                        >
                            <HwButton
                                as={Link}
                                href="/companion"
                                bg="var(--te-orange)"
                                borderColor="var(--te-orange)"
                                shadowColor="#b32200"
                                color="white"
                                className="px-7 py-3.5 text-[11px] tracking-[0.18em] gap-2"
                            >
                                <RiPlayFill className="size-4" />
                                LAUNCH_APP
                            </HwButton>
                            <HwButton
                                as="a"
                                href="https://www.npmjs.com/package/@xoboid/avatar"
                                target="_blank"
                                rel="noreferrer"
                                className="px-7 py-3.5 text-[11px] tracking-[0.18em] gap-2"
                            >
                                <SiNpm className="size-4" />
                                NPM_PKG
                            </HwButton>
                            <HwButton
                                as="a"
                                href="https://github.com/x0bd/proto-0"
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-3.5 text-[11px] tracking-[0.18em] gap-2"
                            >
                                <SiGithub className="size-4" />
                            </HwButton>
                        </motion.div>
                    </div>

                    {/* Right: Hardware spec sheet */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.3 }}
                        className="relative w-full lg:w-[260px] shrink-0"
                    >
                        {/* Spec panel */}
                        <div className="te-panel rounded-[14px] overflow-hidden">
                            <div className="te-module-header px-4 py-2.5">
                                <span className="te-label">DOT_SPEC.v1</span>
                                <span className="te-label opacity-40">TXT</span>
                            </div>
                            <div className="divide-y divide-[var(--panel-border)]">
                                {[
                                    { k: "FACE_ENGINE", v: "SVG_PROC" },
                                    { k: "ANIM_RATE", v: "GSAP@60FPS" },
                                    { k: "EMOTION_DIM", v: "5-AXIS" },
                                    { k: "VOICE_SYS", v: "ELEVENLABS" },
                                    { k: "KEY_ENC", v: "AES-GCM_256" },
                                    { k: "RUNTIME", v: "BROWSER" },
                                    { k: "LICENSE", v: "OPEN_SOURCE" },
                                ].map(({ k, v }, i) => (
                                    <motion.div
                                        key={k}
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.38 + i * 0.04 }}
                                        className="flex items-center justify-between px-4 py-2.5 group hover:bg-black/[0.02] transition-colors"
                                    >
                                        <span className="te-label">{k}</span>
                                        <span className="font-mono text-[10px] font-black tracking-[0.1em] text-[#111] group-hover:text-[var(--te-orange)] transition-colors">{v}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Build status LCD below spec sheet */}
                        <div className="mt-2.5 te-lcd px-4 py-3 flex items-center justify-between text-[10px] tracking-[0.14em]">
                            <span className="text-foreground/40">BUILD</span>
                            <div className="flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-[var(--te-green)]" style={{ boxShadow: "0 0 5px var(--te-green)" }} />
                                <span className="font-black text-foreground/70">PASSING</span>
                            </div>
                        </div>

                        {/* Small note */}
                        <p className="mt-3 font-mono text-[10px] text-[#bbb] leading-[1.6] px-1 tracking-[0.04em]">
                            All processing runs client-side.
                            Your keys never leave the device.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Interactive Showcase ──────────────────────────────────────── */}
            <section id="interactive" className="px-4 sm:px-6 w-full max-w-[1200px] mx-auto pb-36">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-[var(--te-orange)] rounded-full" />
                        <span className="te-label">LIVE_DEMO // MOVE YOUR CURSOR</span>
                    </div>
                    <span className="te-label hidden sm:block">SYS.CTRL_v1</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col lg:flex-row gap-5"
                >
                    {/* Avatar Screen */}
                    <div
                        className="w-full lg:w-[60%] aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#0d0d0d] rounded-[20px] relative flex flex-col justify-between overflow-hidden p-6 sm:p-8"
                        style={{
                            border: "1px solid #1f1f1f",
                            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.35),0 16px 32px -8px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.04)",
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Scanlines */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-50"
                            style={{
                                backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.008) 3px,rgba(255,255,255,0.008) 4px)",
                            }}
                        />
                        {/* Radial vignette */}
                        <div
                            className="absolute inset-0 pointer-events-none rounded-[20px]"
                            style={{ background: "radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.5) 100%)" }}
                        />
                        {/* Corner reticles */}
                        {[
                            "top-4 left-4",
                            "top-4 right-4 rotate-90",
                            "bottom-4 left-4 -rotate-90",
                            "bottom-4 right-4 rotate-180",
                        ].map((pos, i) => (
                            <div key={i} className={`absolute ${pos} size-5 pointer-events-none opacity-30`}>
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-white" />
                                <div className="absolute top-0 left-0 w-[1px] h-full bg-white" />
                            </div>
                        ))}

                        {/* HUD Top */}
                        <div className="flex justify-between items-start z-20 relative pointer-events-none">
                            <div className="flex flex-col gap-1.5">
                                <span className="te-label text-white/30">STATE</span>
                                <div
                                    className="te-lcd flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-[0.18em]"
                                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
                                >
                                    <span className="size-1.5 rounded-full bg-[var(--te-green)] shrink-0" style={{ boxShadow: "0 0 6px var(--te-green)" }} />
                                    ONLINE
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="te-label text-white/30">INPUT</span>
                                <div
                                    className="te-lcd px-2.5 py-1 text-[10px] tracking-[0.18em]"
                                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
                                >
                                    {isTracking ? "CURSOR" : "OVERRIDE"}
                                </div>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="w-[110%] sm:w-[90%] max-w-[700px] aspect-[4/3] flex items-center justify-center translate-y-4">
                                <Avatar emotion={emotion} variant={variant} accentColor={accentColor} />
                            </div>
                        </div>

                        {/* HUD Bottom Meters */}
                        <div className="flex justify-between items-end z-20 relative mt-auto px-1 pointer-events-none">
                            <Meter label="Joy" value={emotion.joy} color={accentColor} />
                            <Meter label="Anger" value={emotion.anger} color={accentColor} />
                            <Meter label="Curiosity" value={emotion.curiosity} color={accentColor} />
                        </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="w-full lg:w-[40%] te-panel rounded-[20px] flex flex-col overflow-hidden" style={{ border: "1px solid var(--panel-border)" }}>
                        {/* Module Header */}
                        <div className="te-module-header px-5 py-3">
                            <div className="flex items-center gap-2.5">
                                <div className="te-grip w-10 h-3 rounded-sm" />
                                <span className="te-label">SYS.CTRL</span>
                            </div>
                            <span className="te-label">PLAYGROUND_v1</span>
                        </div>

                        <div className="p-7 sm:p-9 flex flex-col flex-1">
                            <div className="flex flex-col gap-7 flex-1">

                                {/* Architecture */}
                                <div className="flex flex-col gap-2.5">
                                    <span className="te-label">ARCHITECTURE</span>
                                    <div className="te-recessed p-1.5 flex flex-wrap gap-1.5">
                                        {(["minimal", "analogue", "tron"] as FaceVariant[]).map((v) => (
                                            <HwButton
                                                key={v}
                                                onClick={() => setVariant(v)}
                                                bg={variant === v ? "#111" : "var(--key-bg)"}
                                                borderColor={variant === v ? "#111" : "var(--key-border)"}
                                                shadowColor={variant === v ? "#333" : "var(--key-shadow)"}
                                                color={variant === v ? "white" : undefined}
                                                className="flex-1 py-3 text-[9px] tracking-[0.15em]"
                                            >
                                                {v}
                                            </HwButton>
                                        ))}
                                    </div>
                                </div>

                                {/* Accent Color */}
                                <div className="flex flex-col gap-2.5">
                                    <span className="te-label">ACCENT_CLR</span>
                                    <div className="flex gap-3">
                                        {[
                                            { id: "red", hex: "#ff3b30", shadow: "#b32200" },
                                            { id: "blue", hex: "#007aff", shadow: "#0055bb" },
                                            { id: "green", hex: "#34c759", shadow: "#1e8c3a" },
                                            { id: "yellow", hex: "#ffcc00", shadow: "#b38f00" },
                                        ].map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setAccentColor(c.hex)}
                                                className="w-11 h-11 rounded-[8px] transition-all duration-100"
                                                style={{
                                                    backgroundColor: c.hex,
                                                    border: `1px solid ${c.hex}`,
                                                    borderBottom: `4px solid ${c.shadow}`,
                                                    outline: accentColor === c.hex ? "2px solid #111" : "none",
                                                    outlineOffset: "2px",
                                                    transform: accentColor === c.hex ? "scale(1.08)" : "",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Emotion Override */}
                                <div className="flex flex-col gap-2.5">
                                    <span className="te-label">OVERRIDE</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        <HwButton
                                            onClick={() => setIsTracking(true)}
                                            bg={isTracking ? "#111" : "var(--key-bg)"}
                                            borderColor={isTracking ? "#111" : "var(--key-border)"}
                                            shadowColor={isTracking ? "#333" : "var(--key-shadow)"}
                                            color={isTracking ? "white" : undefined}
                                            className="px-4 py-2.5 text-[9px] tracking-[0.12em]"
                                        >
                                            Cursor
                                        </HwButton>
                                        {Object.keys(EMOTION_PRESETS)
                                            .filter((k) => k !== "Neutral")
                                            .map((m) => {
                                                const active = !isTracking && emotion === EMOTION_PRESETS[m];
                                                return (
                                                    <HwButton
                                                        key={m}
                                                        onClick={() => setEmotionPreset(m)}
                                                        bg={active ? "#111" : "var(--key-bg)"}
                                                        borderColor={active ? "#111" : "var(--key-border)"}
                                                        shadowColor={active ? "#333" : "var(--key-shadow)"}
                                                        color={active ? "white" : undefined}
                                                        className="px-4 py-2.5 text-[9px] tracking-[0.12em]"
                                                    >
                                                        {m}
                                                    </HwButton>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-[var(--panel-border)]">
                                <div className="te-lcd px-3 py-2 text-[10px] flex items-center justify-between">
                                    <span className="text-foreground/40 tracking-[0.15em]">CRAFTED_BY</span>
                                    <a href="https://xoboid.com" target="_blank" rel="noreferrer"
                                        className="font-black tracking-[0.15em] hover:text-[var(--te-orange)] transition-colors">
                                        XOBOID.COM
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── Bento Features ───────────────────────────────────────────── */}
            <section id="features" className="py-28 sm:py-36 bg-[#0d0d0d] text-white relative overflow-hidden">
                {/* Subtle dot grid */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)",
                        backgroundSize: "32px 32px",
                        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)",
                        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)",
                    }}
                />

                <div className="relative max-w-[1200px] mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="te-lcd px-3 py-1.5 text-[10px] tracking-[0.28em] mb-7 flex items-center gap-2"
                            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                        >
                            <span className="size-1 rounded-full bg-[var(--te-orange)]" />
                            // SYS.MODULES
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-mono font-black tracking-[-0.025em] leading-[1.05] mb-5"
                            style={{ fontSize: "clamp(36px, 5.5vw, 64px)" }}
                        >
                            Designed for
                            <br />
                            pure expression.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-mono text-[15px] text-white/40 max-w-[520px] leading-[1.7]"
                        >
                            Sub-frame precision math and robust web APIs, assembled into a single coherent system.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-min md:auto-rows-[300px] gap-4">

                        {/* Bento 1: Procedural Geometry (2×2) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[420px] md:min-h-0 rounded-[16px] overflow-hidden flex flex-col group"
                            style={{ background: "#141414", border: "1px solid #222", boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset" }}
                        >
                            <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid #1e1e1e", background: "rgba(255,255,255,0.02)" }}>
                                <span className="te-label text-white/30">MODULE_01</span>
                                <span className="te-label text-white/15">PROC.GEO</span>
                            </div>
                            <div className="relative flex flex-col flex-1 p-8 sm:p-10">
                                <div className="absolute top-0 right-0 w-[70%] h-[70%] opacity-20 pointer-events-none transition-transform duration-1000 group-hover:scale-105"
                                    style={{ background: "radial-gradient(circle,rgba(0,122,255,0.6) 0%,transparent 70%)" }} />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[42%] w-[130%] aspect-square border border-white/[0.06] rounded-full pointer-events-none transition-transform duration-[1200ms] group-hover:rotate-[15deg]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[42%] w-[90%] aspect-square border border-white/[0.06] rounded-full pointer-events-none transition-transform duration-[1200ms] group-hover:-rotate-[15deg]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[42%] w-[50%] aspect-square border border-white/[0.1] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-110" />

                                <div
                                    className="size-14 rounded-[10px] flex items-center justify-center mb-auto relative z-10 transition-all duration-75 active:translate-y-[2px]"
                                    style={{ background: "var(--te-blue)", border: "1px solid var(--te-blue)", borderBottom: "4px solid #0055bb" }}
                                >
                                    <RiShapeFill className="size-6 text-white" />
                                </div>

                                <div className="relative z-10 mt-28 sm:mt-32">
                                    <h4 className="font-mono font-black text-[26px] sm:text-[30px] tracking-[-0.015em] uppercase text-white mb-3 leading-tight">
                                        Procedural<br />Geometry
                                    </h4>
                                    <p className="font-mono text-[13px] text-white/40 leading-[1.7] max-w-[380px]">
                                        No baked keyframes. Every expression is interpolated across a 5-axis emotion engine, rendering crisp SVG paths in real time.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bento 2: Voice Reactive (2×1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="col-span-1 md:col-span-2 row-span-1 min-h-[280px] md:min-h-0 rounded-[16px] overflow-hidden flex flex-col group"
                            style={{ background: "#141414", border: "1px solid #222", boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset" }}
                        >
                            <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid #1e1e1e", background: "rgba(255,255,255,0.02)" }}>
                                <span className="te-label text-white/30">MODULE_02</span>
                                <span className="te-label text-white/15">AUDIO.SYS</span>
                            </div>
                            <div className="relative flex flex-col justify-between flex-1 p-8 sm:p-10">
                                {/* Waveform bars */}
                                <div className="absolute right-8 md:right-10 top-1/2 -translate-y-1/2 flex items-end gap-1 opacity-20 group-hover:opacity-50 transition-opacity duration-500 pb-2">
                                    {[28, 52, 36, 76, 44, 62, 24, 80, 38].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2.5 rounded-sm"
                                            style={{ backgroundColor: "var(--te-yellow)" }}
                                            animate={{ height: [h * 0.4, h, h * 0.5, h * 0.8, h * 0.4] }}
                                            transition={{ duration: 2 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                                        />
                                    ))}
                                </div>

                                <div
                                    className="size-14 rounded-[10px] flex items-center justify-center relative z-10 mb-6"
                                    style={{ background: "var(--te-yellow)", border: "1px solid var(--te-yellow)", borderBottom: "4px solid #b38f00" }}
                                >
                                    <RiVoiceprintFill className="size-6 text-[#111]" />
                                </div>
                                <div className="relative z-10 max-w-[280px]">
                                    <h4 className="font-mono font-black text-[20px] tracking-[-0.01em] uppercase text-white mb-2">Voice Reactive</h4>
                                    <p className="font-mono text-[13px] text-white/40 leading-[1.7]">Real-time multi-band frequency analysis. The face breathes with audio.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bento 3: BYOK (1×1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="col-span-1 row-span-1 min-h-[280px] md:min-h-0 rounded-[16px] overflow-hidden flex flex-col group"
                            style={{ background: "#141414", border: "1px solid #222", boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset" }}
                        >
                            <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid #1e1e1e", background: "rgba(255,255,255,0.02)" }}>
                                <span className="te-label text-white/30">MODULE_03</span>
                                <span className="te-label text-white/15">KEY.VAULT</span>
                            </div>
                            <div className="relative flex flex-col justify-between flex-1 p-7">
                                <div
                                    className="size-14 rounded-[10px] flex items-center justify-center relative z-10"
                                    style={{ background: "var(--te-green)", border: "1px solid var(--te-green)", borderBottom: "4px solid #1e8c3a" }}
                                >
                                    <RiShieldKeyholeFill className="size-6 text-white" />
                                </div>
                                <div className="relative z-10 mt-6">
                                    <h4 className="font-mono font-black text-[17px] uppercase text-white mb-2">BYOK Privacy</h4>
                                    <p className="font-mono text-[12px] text-white/40 leading-[1.7]">Local-first encrypted key vault. Keys never touch a server.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bento 4: GSAP (1×1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="col-span-1 row-span-1 min-h-[280px] md:min-h-0 rounded-[16px] overflow-hidden flex flex-col group"
                            style={{ background: "#141414", border: "1px solid #222", boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset" }}
                        >
                            <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid #1e1e1e", background: "rgba(255,255,255,0.02)" }}>
                                <span className="te-label text-white/30">MODULE_04</span>
                                <span className="te-label text-white/15">GSAP.ENG</span>
                            </div>
                            <div className="relative flex flex-col justify-between flex-1 p-7">
                                <div
                                    className="size-14 rounded-[10px] flex items-center justify-center relative z-10"
                                    style={{ background: "var(--te-orange)", border: "1px solid var(--te-orange)", borderBottom: "4px solid #b32200" }}
                                >
                                    <span className="font-mono text-white font-black text-[17px]">60</span>
                                </div>
                                <div className="relative z-10 mt-6">
                                    <h4 className="font-mono font-black text-[17px] uppercase text-white mb-2">GSAP Powered</h4>
                                    <p className="font-mono text-[12px] text-white/40 leading-[1.7]">Sub-frame precision. Smooth interpolation, zero snapping.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── CTA Strip ────────────────────────────────────────────────── */}
            <section className="py-28 sm:py-36 px-6 bg-[#f4f4f0]">
                <div className="max-w-[900px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="te-panel rounded-[20px] p-12 sm:p-16 flex flex-col items-center text-center gap-8 relative overflow-hidden"
                    >
                        {/* Subtle horizontal scan line */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--te-orange)]/40 to-transparent" />
                        <div className="te-lcd px-3 py-1.5 text-[10px] tracking-[0.28em] flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-[var(--te-orange)] animate-pulse" style={{ boxShadow: "0 0 6px var(--te-orange)" }} />
                            READY_TO_INITIALIZE
                        </div>
                        <h2 className="font-mono font-black text-[40px] sm:text-[56px] md:text-[64px] tracking-[-0.025em] text-[#111] leading-[1.0]">
                            Open source.
                            <br />
                            <span className="text-[var(--te-orange)]">No lock-in.</span>
                        </h2>
                        <p className="font-mono text-[14px] sm:text-[15px] text-[#666] max-w-[460px] leading-[1.7]">
                            DOT is free and self-hosted. Bring your own keys, run it locally, and own everything.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <HwButton
                                as={Link}
                                href="/companion"
                                bg="var(--te-orange)"
                                borderColor="var(--te-orange)"
                                shadowColor="#b32200"
                                color="white"
                                className="px-8 py-3.5 text-[11px] tracking-[0.18em] gap-2"
                            >
                                <RiPlayFill className="size-4" />
                                LAUNCH_APP
                            </HwButton>
                            <HwButton
                                as="a"
                                href="https://github.com/x0bd/proto-0"
                                target="_blank"
                                rel="noreferrer"
                                className="px-8 py-3.5 text-[11px] tracking-[0.18em] gap-2"
                            >
                                <SiGithub className="size-4" />
                                VIEW_SOURCE
                            </HwButton>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <section id="faq" className="py-24 sm:py-32 bg-[#f4f4f0]" style={{ borderTop: "1px solid var(--panel-border)" }}>
                <div className="max-w-[720px] mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-14">
                        <div className="te-lcd px-3 py-1.5 text-[10px] tracking-[0.28em] mb-6">SYS.FAQ</div>
                        <h2 className="font-mono font-black text-[36px] sm:text-[44px] tracking-[-0.025em] text-[#111]">
                            Frequently asked.
                        </h2>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {FAQS.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <footer className="bg-[#0d0d0d] text-white" style={{ borderTop: "1px solid #1e1e1e" }}>
                {/* Main footer grid */}
                <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand col */}
                    <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
                        <div className="flex items-center gap-2.5">
                            <div className="size-6 rounded-full bg-white flex items-center justify-center">
                                <div className="size-2.5 rounded-full bg-[#111]" />
                            </div>
                            <span className="font-mono text-[13px] font-black tracking-[0.22em] uppercase">DOT</span>
                        </div>
                        <p className="font-mono text-[12px] text-white/40 leading-[1.7] max-w-[220px]">
                            A real-time AI companion powered by procedural geometry and machine emotion.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="size-1.5 rounded-full bg-[var(--te-green)]" style={{ boxShadow: "0 0 6px var(--te-green)" }} />
                            <span className="te-label text-white/30">SYSTEMS_NOMINAL</span>
                        </div>
                    </div>

                    {/* Product col */}
                    <div className="flex flex-col gap-4">
                        <span className="te-label text-white/25 mb-1">PRODUCT</span>
                        {[
                            { label: "Launch App", href: "/companion" },
                            { label: "NPM Package", href: "https://www.npmjs.com/package/@xoboid/avatar", ext: true },
                            { label: "GitHub", href: "https://github.com/x0bd/proto-0", ext: true },
                        ].map((l) => (
                            <a
                                key={l.label}
                                href={l.href}
                                target={l.ext ? "_blank" : undefined}
                                rel={l.ext ? "noreferrer" : undefined}
                                className="font-mono text-[12px] text-white/40 hover:text-white tracking-[0.08em] transition-colors flex items-center gap-1.5 group"
                            >
                                {l.label}
                                {l.ext && <RiArrowRightLine className="size-3 opacity-0 group-hover:opacity-100 -rotate-45 transition-all" />}
                            </a>
                        ))}
                    </div>

                    {/* Tech col */}
                    <div className="flex flex-col gap-4">
                        <span className="te-label text-white/25 mb-1">TECH_STACK</span>
                        {["Next.js 15", "GSAP", "Web Audio API", "ElevenLabs TTS", "Web Crypto API"].map((t) => (
                            <span key={t} className="font-mono text-[12px] text-white/30 tracking-[0.08em]">{t}</span>
                        ))}
                    </div>

                    {/* Connect col */}
                    <div className="flex flex-col gap-4">
                        <span className="te-label text-white/25 mb-1">CONNECT</span>
                        <a
                            href="https://xoboid.com"
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[12px] text-white/40 hover:text-white tracking-[0.08em] transition-colors flex items-center gap-1.5 group"
                        >
                            xoboid.com
                            <RiArrowRightLine className="size-3 opacity-0 group-hover:opacity-100 -rotate-45 transition-all" />
                        </a>
                        <a
                            href="https://github.com/x0bd"
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[12px] text-white/40 hover:text-white tracking-[0.08em] transition-colors flex items-center gap-1.5 group"
                        >
                            @x0bd
                            <RiArrowRightLine className="size-3 opacity-0 group-hover:opacity-100 -rotate-45 transition-all" />
                        </a>
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
                    style={{ borderTop: "1px solid #1a1a1a" }}
                >
                    <span className="te-label text-white/20">© 2025 XOBOID // ALL_RIGHTS_RESERVED</span>
                    <div className="flex items-center gap-1.5">
                        <span className="te-label text-white/15">BUILT_WITH</span>
                        <div
                            className="te-lcd px-2 py-0.5 text-[9px] tracking-[0.2em]"
                            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                        >
                            PURPOSE
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="te-recessed px-5 py-5 cursor-pointer group"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex items-center justify-between gap-4">
                <h4 className="font-mono font-bold text-[14px] sm:text-[16px] text-[#111] group-hover:text-[var(--te-orange)] transition-colors leading-snug">
                    {question}
                </h4>
                <div
                    className="size-7 shrink-0 rounded-[6px] flex items-center justify-center transition-transform duration-300 ease-out"
                    style={{
                        background: "var(--key-bg)",
                        border: "1px solid var(--key-border)",
                        borderBottom: "3px solid var(--key-shadow)",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                >
                    <div className="relative size-3">
                        <div className="absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 bg-[#111] rounded-full" />
                        <div className="absolute top-0 left-1/2 h-full w-[1.5px] -translate-x-1/2 bg-[#111] rounded-full" />
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
                        <p className="pt-4 font-mono text-[13px] text-[#666] leading-[1.8] max-w-[90%]">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex flex-col gap-1.5 w-14 sm:w-18">
            <span className="te-label text-white/30">{label}</span>
            <div className="h-1 w-full bg-white/10 rounded-sm overflow-hidden">
                <div
                    className="h-full transition-all duration-300 ease-out rounded-sm"
                    style={{ width: `${Math.max(5, value * 100)}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
