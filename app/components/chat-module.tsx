"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, MessageSquare, Loader2, Settings2 } from "lucide-react";
import { usePanelPosition } from "@/hooks/usePanelPosition";
import { getKey, DEFAULT_MODELS, type Provider } from "@/lib/key-store";
import { addMemory, buildMemoryContextForPrompt, isMemoryEnabled } from "./memory-drawer";
import { buildRitualContextForPrompt } from "./ritual-drawer";
import type { EmotionState } from "../components/face/types";
import type { PersonaTuningSettings } from "@/hooks/usePersonaSettings";

interface ChatModuleProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmotionChange?: (emotion: EmotionState) => void;
    activePersonaId?: string;
    personaTuning?: PersonaTuningSettings;
    accentColor?: string;
    constraintsRef?: React.RefObject<Element>;
    onOpenSettings?: () => void;
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface ChatErrorResponse {
    error?: string;
    code?: string;
    action?: string;
}

// Lightweight text sentiment → emotion mapping
function sentimentToEmotion(text: string): EmotionState {
    const lower = text.toLowerCase();
    let joy = 0, sadness = 0, surprise = 0, anger = 0, curiosity = 0;

    const joyWords = ["happy", "great", "love", "wonderful", "beautiful", "bright", "warm", "light", "smile", "laugh", "glad", "brilliant", "enjoy", "fun", "delight", "hope", "joy", "excited"];
    joyWords.forEach(w => { if (lower.includes(w)) joy += 0.3; });

    const sadWords = ["sad", "sorry", "miss", "lost", "pain", "hurt", "alone", "quiet", "heavy", "weight", "dark", "shadow", "grief", "melancholy"];
    sadWords.forEach(w => { if (lower.includes(w)) sadness += 0.3; });

    const surpriseWords = ["wow", "unexpected", "sudden", "surprise", "amazing", "incredible", "whoa"];
    surpriseWords.forEach(w => { if (lower.includes(w)) surprise += 0.3; });

    const curiosityWords = ["wonder", "curious", "think", "reflect", "ponder", "question", "consider", "imagine", "perhaps", "maybe", "explore"];
    curiosityWords.forEach(w => { if (lower.includes(w)) curiosity += 0.25; });

    const angerWords = ["frustrat", "angry", "annoy", "hate", "rage", "furious", "stop", "enough"];
    angerWords.forEach(w => { if (lower.includes(w)) anger += 0.3; });

    if (text.includes("?")) curiosity += 0.2;
    if (text.includes("!")) { surprise += 0.15; joy += 0.1; }

    joy = Math.min(1, joy); sadness = Math.min(1, sadness);
    surprise = Math.min(1, surprise); anger = Math.min(1, anger); curiosity = Math.min(1, curiosity);

    if (joy < 0.1 && sadness < 0.1 && surprise < 0.1 && anger < 0.1 && curiosity < 0.1) {
        return { joy: 0.3, sadness: 0, surprise: 0, anger: 0, curiosity: 0.15 };
    }
    return { joy, sadness, surprise, anger, curiosity };
}

function autoTags(content: string): string[] {
    const lower = content.toLowerCase();
    const tags: string[] = [];
    if (/\b(goal|want to|trying to|plan|aim|working on|building)\b/.test(lower)) tags.push("goals");
    if (/\b(feel|feeling|emotion|mood|anxious|happy|sad|stress|nervous|excited)\b/.test(lower)) tags.push("feelings");
    if (/\b(work|job|project|career|boss|colleague|client)\b/.test(lower)) tags.push("work");
    if (/\b(friend|family|partner|relationship|mom|dad|brother|sister)\b/.test(lower)) tags.push("people");
    if (/\b(like|love|enjoy|prefer|favorite|hate|dislike)\b/.test(lower)) tags.push("preferences");
    return tags.length > 0 ? tags : ["general"];
}

// Detect which provider is configured
function getActiveProvider(): { provider: Provider; key: string; model: string } | null {
    for (const p of ["openai", "google"] as Provider[]) {
        const stored = getKey(p);
        if (stored) {
            return { provider: p, key: stored.key, model: stored.model || DEFAULT_MODELS[p] };
        }
    }
    return null;
}

function formatChatError(data: ChatErrorResponse, status: number): string {
    const code = data.code || `HTTP_${status}`;
    const message = data.error || "DOT could not reach the AI provider.";
    return data.action
        ? `${code}: ${message} ${data.action}`
        : `${code}: ${message}`;
}

export function ChatModule({
    open,
    onOpenChange,
    onEmotionChange,
    activePersonaId = "coach",
    personaTuning,
    accentColor = "#7c3aed",
    constraintsRef,
    onOpenSettings,
}: ChatModuleProps) {
    const [providerInfo, setProviderInfo] = React.useState<ReturnType<typeof getActiveProvider>>(null);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const abortRef = React.useRef<AbortController | null>(null);

    // Re-check keys when panel opens
    React.useEffect(() => {
        if (open) setProviderInfo(getActiveProvider());
    }, [open]);

    // Auto-scroll
    React.useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on open
    React.useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !providerInfo || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        setError(null);

        // Persist user message as a memory entry if learning is enabled
        const trimmed = userMsg.content;
        if (isMemoryEnabled() && trimmed.length > 20) {
            addMemory({ content: trimmed, tags: autoTags(trimmed), source: "chat" });
        }

        const assistantId = (Date.now() + 1).toString();
        const memoryContext = [
            buildMemoryContextForPrompt(trimmed),
            buildRitualContextForPrompt(),
        ].filter(Boolean).join("\n");

        try {
            abortRef.current = new AbortController();

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-dot-api-key": providerInfo.key,
                },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    provider: providerInfo.provider,
                    model: providerInfo.model,
                    persona: activePersonaId,
                    personaTuning,
                    memoryContext: memoryContext || undefined,
                }),
                signal: abortRef.current.signal,
            });

            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as ChatErrorResponse;
                throw new Error(formatChatError(data, res.status));
            }

            // Stream the text response
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            // Add empty assistant message
            setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;
                    setMessages(prev =>
                        prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
                    );
                }
            }

            // Drive avatar emotion
            if (onEmotionChange && fullText) {
                onEmotionChange(sentimentToEmotion(fullText));
            }
        } catch (err: unknown) {
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                setError(err instanceof Error ? err.message : "Connection failed");
            }
        } finally {
            setIsLoading(false);
            abortRef.current = null;
        }
    }, [input, messages, providerInfo, activePersonaId, personaTuning, isLoading, onEmotionChange]);

    const providerLabel = providerInfo
        ? `${providerInfo.provider.toUpperCase()} · ${providerInfo.model.split("/").pop()?.split("-").slice(0, 2).join("-") ?? providerInfo.model}`
        : "NO_KEY";

    const isConfigured = !!providerInfo;
    const { x, y, onDragEnd } = usePanelPosition("chat");

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
                    className="absolute top-24 left-6 w-[380px] h-auto te-module te-safe-panel z-[100] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]"
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
                            <span className="font-mono text-[8px] uppercase tracking-widest te-whisper ml-2">TX-2</span>
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
                            <div className="px-4 pb-4">
                                <div className="te-recessed p-4 flex flex-col items-center gap-3 text-center">
                                    <span className="text-[10px] font-mono font-bold tracking-widest text-foreground/40 uppercase">
                                        NO_AI_KEY_FOUND
                                    </span>
                                    <span className="text-[9px] font-mono te-whisper leading-relaxed">
                                        Add an OpenAI or Google key in<br />Settings → KEYS tab to begin.
                                    </span>
                                    {onOpenSettings && (
                                        <button
                                            onClick={() => { onOpenSettings(); onOpenChange(false); }}
                                            className="h-9 px-4 te-button rounded-[6px] flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
                                            style={{
                                                "--key-bg": "var(--te-orange)",
                                                "--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
                                                "--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
                                                color: "#ffffff",
                                            } as React.CSSProperties}
                                        >
                                            <Settings2 className="size-3" />
                                            <span className="text-[9px] font-bold tracking-widest">OPEN_SETTINGS</span>
                                        </button>
                                    )}
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
                                                {messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                                    >
                                                        <div
                                                            className={`max-w-[85%] px-2.5 py-1.5 rounded-[6px] text-[11px] font-mono leading-relaxed ${
                                                                msg.role === "user" ? "text-white/90" : "text-white/70"
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
                                                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
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
                                            onChange={(e) => setInput(e.target.value)}
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
                                            ERR: {error.slice(0, 60)}
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
