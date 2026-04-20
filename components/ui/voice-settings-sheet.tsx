"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mic2, Settings2 } from "lucide-react";
import { usePanelPosition } from "@/hooks/usePanelPosition";

interface VoiceSettingsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

const VOICE_PROFILES = [
    { id: "companion", label: "CMPNN", short: "C-01" },
    { id: "guide", label: "GUIDE", short: "G-02" },
    { id: "late-night", label: "NIGHT", short: "N-03" },
];

export function VoiceSettingsSheet({
    open,
    onOpenChange,
    accentColor = "#7c3aed",
    constraintsRef,
}: VoiceSettingsSheetProps) {
    const [activeProfile, setActiveProfile] = React.useState("companion");
    const [speed, setSpeed] = React.useState(58);
    const [warmth, setWarmth] = React.useState(72);
    const [clarity, setClarity] = React.useState(64);
    const [autoSpeak, setAutoSpeak] = React.useState(true);
    const [interruptible, setInterruptible] = React.useState(true);

    const { x, y, onDragEnd } = usePanelPosition("voice-settings");

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    style={{ x, y }}
                    onDragEnd={onDragEnd}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 w-[340px] h-auto te-module z-[100] flex flex-col"
                >
                    {/* Header / Drag Handle */}
                    <div className="te-module-header">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-[var(--te-orange)]" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">VOICE_MOD</span>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/30 ml-2">V-1.4</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-50" />
                        <button onClick={() => onOpenChange(false)} className="size-5 te-button !rounded-full !border-b-2 flex items-center justify-center text-foreground hover:text-[var(--te-orange)]">
                            <X className="size-3" />
                        </button>
                    </div>

                    <div className="relative z-10 flex flex-col p-4 gap-4 bg-[var(--panel-bg)] h-full">
                        
                        {/* LCD Status Display */}
                        <div className="te-lcd p-3 flex flex-col justify-center relative overflow-hidden shrink-0 h-[60px] border border-black/10 dark:border-white/10">
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)' }} />
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-[8px] opacity-50 tracking-[0.2em] font-bold">STATUS</span>
                                <span className="text-[8px] opacity-30 tracking-[0.2em] font-bold">PATCH</span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="size-2.5 rounded-full bg-[var(--te-green)] shadow-[0_0_8px_var(--te-green)]" />
                                    <span className="text-[14px] font-bold opacity-90 tracking-widest uppercase">ONLINE</span>
                                </div>
                                <span className="text-[14px] font-bold opacity-90 tracking-widest">
                                    {VOICE_PROFILES.find(p => p.id === activeProfile)?.short || "ERR"}
                                </span>
                            </div>
                        </div>

                        {/* Profile Selection */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">ENGINE_PROFILE</span>
                            </div>
                            <div className="te-recessed p-1.5 flex gap-1.5">
                                {VOICE_PROFILES.map((profile) => {
                                    const active = activeProfile === profile.id;
                                    return (
                                        <button
                                            key={profile.id}
                                            onClick={() => setActiveProfile(profile.id)}
                                            className="flex-1 h-9 te-button rounded-[8px] text-[10px] transition-all duration-150"
                                            style={active ? {
                                                "--key-bg": "var(--te-blue)",
                                                "--key-border": `color-mix(in srgb, var(--te-blue) 80%, black)`,
                                                "--key-shadow": `color-mix(in srgb, var(--te-blue) 60%, black)`,
                                                color: "#ffffff"
                                            } as React.CSSProperties : undefined}
                                        >
                                            {profile.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Tuning parameters */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">DSP_PARAM_TWEAK</span>
                            </div>
                            <div className="te-recessed p-3 flex flex-col gap-3">
                                {[
                                    { label: "SPD", value: speed, set: setSpeed },
                                    { label: "WRM", value: warmth, set: setWarmth },
                                    { label: "CLR", value: clarity, set: setClarity },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <span className="w-8 shrink-0 text-[10px] font-mono font-bold tracking-widest text-foreground/60">{item.label}</span>
                                        <div className="flex-1 h-2 bg-[var(--key-bg)] rounded-full overflow-hidden border border-[var(--panel-border)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] relative">
                                            <input 
                                                type="range" 
                                                min="0" max="100" 
                                                value={item.value} 
                                                onChange={(e) => item.set(Number(e.target.value))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div 
                                                className="h-full rounded-full transition-all duration-75 relative" 
                                                style={{ width: `${item.value}%`, backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                                            />
                                        </div>
                                        <span className="w-6 text-right shrink-0 text-[10px] font-mono font-bold tracking-widest" style={{ color: accentColor }}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Behavior switches */}
                        <section className="flex flex-col gap-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                                <span className="te-label">BEHAVIOR_ROUTING</span>
                            </div>
                            <div className="te-recessed p-1.5 flex gap-1.5">
                                {[
                                    { label: "AUTO_TX", state: autoSpeak, set: setAutoSpeak, color: "var(--te-orange)" },
                                    { label: "INTERRUPT", state: interruptible, set: setInterruptible, color: "var(--te-green)" },
                                ].map((sw) => (
                                    <div key={sw.label} className="flex-1 flex flex-col gap-1">
                                        <button
                                            onClick={() => sw.set(!sw.state)}
                                            className="w-full h-10 te-button rounded-[8px] transition-all duration-150 flex flex-col items-center justify-center gap-0.5"
                                            style={sw.state ? {
                                                "--key-bg": sw.color,
                                                "--key-border": `color-mix(in srgb, ${sw.color} 80%, black)`,
                                                "--key-shadow": `color-mix(in srgb, ${sw.color} 60%, black)`,
                                                color: "#ffffff"
                                            } as React.CSSProperties : { opacity: 0.8 }}
                                        >
                                            <span className="text-[10px] font-bold tracking-widest leading-none">{sw.label}</span>
                                            <span className="text-[7px] font-bold tracking-[0.2em] opacity-80 leading-none">
                                                {sw.state ? "ON" : "OFF"}
                                            </span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
