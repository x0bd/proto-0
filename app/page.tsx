"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { SiGithub, SiNpm } from "react-icons/si";
import { RiPlayFill } from "react-icons/ri";
import { useTheme } from "next-themes";

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
    as?: React.ElementType;
    href?: string;
    target?: string;
    rel?: string;
}) {
    const style: React.CSSProperties = {
        backgroundColor: bg,
        border: `1px solid ${borderColor}`,
        borderBottom: `4px solid ${shadowColor}`,
        color,
    };
    return (
        <Tag
            href={href}
            target={target}
            rel={rel}
            className={`inline-flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-widest rounded-lg transition-all duration-75 active:border-b active:translate-y-[3px] ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </Tag>
    );
}

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);
    const { setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
        setTheme("light");
    }, [setTheme]);

    if (!mounted) return null;

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#f4f4f0] font-mono selection:bg-(--te-blue) selection:text-white">

            {/* Subtle grid */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.028) 1px,transparent 1px)",
                    backgroundSize: "52px 52px",
                    maskImage: "radial-gradient(ellipse 80% 80% at 20% 50%,black 20%,transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 20% 50%,black 20%,transparent 75%)",
                }}
            />

            {/* ── Navbar ─────────────────────────────────────────────────── */}
            <motion.nav
                initial={{ y: -80, opacity: 0, x: "-50%" }}
                animate={{ y: 0, opacity: 1, x: "-50%" }}
                transition={{ type: "spring", damping: 26, stiffness: 200, delay: 0.05 }}
                className="fixed top-5 left-1/2 w-[90%] max-w-[820px] h-[52px] z-50 flex items-center justify-between px-4 rounded-full"
                style={{
                    background: "rgba(244,244,240,0.88)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
            >
                <div className="flex items-center gap-2.5 pl-1">
                    <div className="size-2.5 rounded-full bg-[#111]" style={{ boxShadow: "0 0 0 3px rgba(0,0,0,0.06)" }} />
                    <span className="font-mono text-[11px] font-black tracking-[0.22em] uppercase">DOT</span>
                </div>

                <div className="flex items-center gap-2.5">
                    <a
                        href="https://github.com/x0bd/proto-0"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex size-8 rounded-full items-center justify-center text-[#777] hover:bg-black/6 hover:text-[#111] transition-all"
                    >
                        <SiGithub className="size-3.5" />
                    </a>
                    <a
                        href="https://www.npmjs.com/package/@xoboid/avatar"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex size-8 rounded-full items-center justify-center text-[#777] hover:bg-black/6 hover:text-[#111] transition-all"
                    >
                        <SiNpm className="size-[15px]" />
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

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <main className="flex-1 flex items-center relative" style={{ paddingTop: "72px" }}>
                <div className="relative w-full max-w-[1200px] mx-auto px-6 sm:px-10">

                    {/* Kicker */}
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex items-center gap-2.5 mb-7"
                    >
                        <div className="w-5 h-px bg-(--te-orange)" />
                        <span className="te-label text-(--te-orange)">XOBOID.SYS — PROTO.0</span>
                    </motion.div>

                    {/* Staggered headline */}
                    <h1 className="font-mono font-black leading-none tracking-[-0.025em] mb-9">
                        <motion.span
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.26 }}
                            className="block text-[#c0c0c0]"
                            style={{ fontSize: "clamp(28px, 3.8vw, 46px)" }}
                        >
                            Five emotions.
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.34 }}
                            className="block text-[#0d0d0d]"
                            style={{ fontSize: "clamp(52px, 8.5vw, 104px)" }}
                        >
                            One face.
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.42 }}
                            className="block text-(--te-orange)"
                            style={{ fontSize: "clamp(52px, 8.5vw, 104px)" }}
                        >
                            Real time.
                        </motion.span>
                    </h1>

                    {/* One line */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.52 }}
                        className="font-mono text-[13px] sm:text-[14px] text-[#999] max-w-[380px] leading-[1.85] mb-10"
                    >
                        Open-source AI companion with a procedural face.
                        Runs in your browser — no cloud, no lock-in.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
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
                            <RiPlayFill className="size-[15px]" />
                            LAUNCH_APP
                        </HwButton>
                        <HwButton
                            as="a"
                            href="https://www.npmjs.com/package/@xoboid/avatar"
                            target="_blank"
                            rel="noreferrer"
                            className="px-7 py-3.5 text-[11px] tracking-[0.18em] gap-2"
                        >
                            <SiNpm className="size-[15px]" />
                            NPM_PKG
                        </HwButton>
                    </motion.div>
                </div>
            </main>

            {/* ── Bottom bar ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.75 }}
                className="relative flex items-center justify-between px-6 sm:px-10 pb-6 pt-4 max-w-[1200px] mx-auto w-full"
            >
                <span className="te-label">v0.1.0 // EXPERIMENTAL</span>
                <div className="flex items-center gap-4">
                    <span className="te-label hidden sm:block">GSAP · WEB_AUDIO · ELEVENLABS</span>
                    <div className="flex items-center gap-1.5">
                        <span
                            className="size-1.5 rounded-full bg-(--te-green) animate-pulse"
                            style={{ boxShadow: "0 0 5px var(--te-green)" }}
                        />
                        <span className="te-label">NOMINAL</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
