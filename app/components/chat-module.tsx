"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";
import { useChat, type Message } from "@ai-sdk/react";
import { getKey, hasKey, DEFAULT_MODELS, type Provider } from "@/lib/key-store";
import type { EmotionState } from "../components/face/types";

interface ChatModuleProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmotionChange?: (emotion: EmotionState) => void;
    activePersonaId?: string;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
}

// Lightweight text sentiment → emotion mapping
function sentimentToEmotion(text: string): EmotionState {
    const lower = text.toLowerCase();

    let joy = 0, sadness = 0, surprise = 0, anger = 0, curiosity = 0;

    // Joy signals
    const joyWords = ["happy", "great", "love", "wonderful", "beautiful", "bright", "warm", "light", "smile", "laugh", "glad", "brilliant", "enjoy", "fun", "delight", "hope", "joy", "excited"];
    joyWords.forEach(w => { if (lower.includes(w)) joy += 0.3; });

    // Sadness signals
    const sadWords = ["sad", "sorry", "miss", "lost", "pain", "hurt", "alone", "quiet", "heavy", "weight", "dark", "shadow", "grief", "melancholy"];
    sadWords.forEach(w => { if (lower.includes(w)) sadness += 0.3; });

    // Surprise / curiosity signals
    const surpriseWords = ["wow", "unexpected", "sudden", "surprise", "amazing", "incredible", "whoa"];
    surpriseWords.forEach(w => { if (lower.includes(w)) surprise += 0.3; });

    const curiosityWords = ["wonder", "curious", "think", "reflect", "ponder", "question", "consider", "imagine", "perhaps", "maybe", "explore"];
    curiosityWords.forEach(w => { if (lower.includes(w)) curiosity += 0.25; });

    // Anger signals
    const angerWords = ["frustrat", "angry", "annoy", "hate", "rage", "furious", "stop", "enough"];
    angerWords.forEach(w => { if (lower.includes(w)) anger += 0.3; });

    // Question mark = curiosity boost
    if (text.includes("?")) curiosity += 0.2;
    // Exclamation = surprise/joy boost
    if (text.includes("!")) { surprise += 0.15; joy += 0.1; }

    // Clamp
    joy = Math.min(1, joy);
    sadness = Math.min(1, sadness);
    surprise = Math.min(1, surprise);
    anger = Math.min(1, anger);
    curiosity = Math.min(1, curiosity);

    // Default to gentle neutral if nothing triggers
    if (joy < 0.1 && sadness < 0.1 && surprise < 0.1 && anger < 0.1 && curiosity < 0.1) {
        return { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.15 };
    }

    return { joy, sadness, surprise, anger, curiosity };
}

// Detect which provider is configured
function getActiveProvider(): { provider: Provider; key: string; model: string } | null {
    // Priority: OpenAI > Google
    for (const p of ["openai", "google"] as Provider[]) {
        const stored = getKey(p);
        if (stored) {
            return {
                provider: p,
                key: stored.key,
                model: stored.model || DEFAULT_MODELS[p],
            };
        }
    }
    return null;
}

export function ChatModule({
    open,
    onOpenChange,
    onEmotionChange,
    activePersonaId = "coach",
    accentColor = "#7c3aed",
    constraintsRef,
}: ChatModuleProps) {
    const [providerInfo, setProviderInfo] = React.useState<ReturnType<typeof getActiveProvider>>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Re-check keys when panel opens
    React.useEffect(() => {
        if (open) setProviderInfo(getActiveProvider());
    }, [open]);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: "/api/chat",
        body: {
            provider: providerInfo?.provider,
            model: providerInfo?.model,
            apiKey: providerInfo?.key,
            persona: activePersonaId,
        },
        onFinish: (message: Message) => {
            // Drive avatar emotion from assistant response sentiment
            if (message.role === "assistant" && onEmotionChange) {
                const emotion = sentimentToEmotion(message.content);
                onEmotionChange(emotion);
            }
        },
    });

    // Auto-scroll to bottom
    React.useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on open
    React.useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    const providerLabel = providerInfo
        ? `${providerInfo.provider.toUpperCase()} · ${providerInfo.model.split("/").pop()?.split("-").slice(0, 2).join("-") ?? providerInfo.model}`
        : "NO_KEY";

    const isConfigured = !!providerInfo;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 left-6 w-[380px] h-auto te-module z-[100] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                >
                    {/* Header */}
                    <div className="te-module-header px-4 h-10 border-b border-black/10 dark:border-white/5 relative bg-[var(--panel-bg)] rounded-t-[16px]">
                        <div className="flex items-center gap-2">
                            <div
                                className="size-2 rounded-full"
                                style={{
                                    backgroundColor: isConfigured ? "var(--te-green)" : "var(--te-orange)",
                                    boxShadow: isConfigured ? "0 0 8px var(--te-green)" : "none",
                                }}
                            />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">CONV_MOD</span>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/30 ml-2">TX-2</span>
                        </div>
                        <div className="w-16 h-2 te-grip opacity-40 shrink-0" />
                        <button
                            onClick={() => onOpenChange(false)}
                            className="size-5 te-button !rounded-full flex items-center justify-center text-foreground hover:text-[var(--te-orange)]"
                            aria-label="Close"
                        >
                            <X className="size-3" />
                        </button>
                    </div>

                    <div className="relative z-10 flex flex-col bg-[var(--panel-bg)] rounded-b-[16px]">
                        {/* Screws */}
                        <div className="absolute top-2 left-3 size-1.5 rounded-full bg-black/20 dark:bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />
                        <div className="absolute top-2 right-3 size-1.5 rounded-full bg-black/20 dark:bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />

                        {/* LCD Status */}
                        <div className="mx-4 mt-4 mb-2">
                            <div
                                className="te-recessed p-2 flex items-center justify-between border border-[var(--panel-border)]"
                                style={{ backgroundColor: "#111111" }}
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="size-3 text-white/60" />
                                    <span className="text-[10px] text-white font-mono font-bold tracking-widest uppercase truncate max-w-[160px]">
                                        {providerLabel}
                                    </span>
                                </div>
                                <div className="bg-[#050505] px-2 py-[2px] rounded-[3px] border border-white/10">
                                    <span className="text-[9px] font-bold tracking-widest" style={{ color: isConfigured ? "#00ff88" : "var(--te-orange)" }}>
                                        {isLoading ? "STREAM" : isConfigured ? "READY" : "NO_KEY"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isConfigured ? (
                            /* No key configured state */
                            <div className="px-4 pb-4">
                                <div className="te-recessed p-4 flex flex-col items-center gap-2 text-center">
                                    <span className="text-[10px] font-mono font-bold tracking-widest text-foreground/40 uppercase">
                                        NO_AI_KEY_FOUND
                                    </span>
                                    <span className="text-[9px] font-mono text-foreground/30 leading-relaxed">
                                        Add an OpenAI or Google key in<br />Settings → KEYS tab to begin.
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Messages */}
                                <div className="px-4 mb-2">
                                    <div className="te-recessed p-2 max-h-[240px] overflow-y-auto" style={{ backgroundColor: "#0a0a0a" }}>
                                        {messages.length === 0 ? (
                                            <div className="flex items-center justify-center py-6">
                                                <span className="text-[9px] font-mono text-white/20 tracking-widest uppercase">AWAITING_INPUT</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 py-1">
                                                {messages.map((msg: Message) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                                    >
                                                        <div
                                                            className={`max-w-[85%] px-2.5 py-1.5 rounded-[6px] text-[11px] font-mono leading-relaxed ${
                                                                msg.role === "user"
                                                                    ? "text-white/90"
                                                                    : "text-white/70"
                                                            }`}
                                                            style={{
                                                                backgroundColor: msg.role === "user" ? `${accentColor}30` : "rgba(255,255,255,0.05)",
                                                                border: msg.role === "user" ? `1px solid ${accentColor}40` : "1px solid rgba(255,255,255,0.08)",
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                {isLoading && (
                                                    <div className="flex justify-start">
                                                        <div className="px-2.5 py-1.5 rounded-[6px] bg-white/5 border border-white/8">
                                                            <Loader2 className="size-3 text-white/40 animate-spin" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={scrollRef} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Input */}
                                <div className="px-4 pb-4">
                                    <form
                                        onSubmit={handleSubmit}
                                        className="te-recessed p-1.5 flex gap-1.5 items-center"
                                    >
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={handleInputChange}
                                            placeholder="TYPE_MSG..."
                                            disabled={isLoading}
                                            className="flex-1 h-9 px-3 rounded-[6px] text-[11px] font-mono font-bold tracking-wider text-foreground placeholder:text-foreground/25 bg-[var(--lcd-bg)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] border-none outline-none disabled:opacity-40 uppercase"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className="size-9 shrink-0 te-button rounded-[6px] flex items-center justify-center disabled:opacity-30 transition-all"
                                            style={input.trim() ? {
                                                "--key-bg": accentColor,
                                                "--key-border": `color-mix(in srgb, ${accentColor} 80%, black)`,
                                                "--key-shadow": `color-mix(in srgb, ${accentColor} 60%, black)`,
                                                color: "#ffffff",
                                            } as React.CSSProperties : undefined}
                                        >
                                            <Send className="size-3.5" />
                                        </button>
                                    </form>
                                </div>

                                {/* Error display */}
                                {error && (
                                    <div className="px-4 pb-3">
                                        <div className="text-[9px] font-mono text-[var(--te-orange)] tracking-wider bg-[var(--te-orange)]/10 px-2 py-1 rounded-[4px] border border-[var(--te-orange)]/20">
                                            ERR: {error.message?.slice(0, 60)}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
