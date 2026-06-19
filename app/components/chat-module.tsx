"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, MessageSquare, Loader2, Settings2 } from "lucide-react";
import { usePanelPosition } from "@/hooks/usePanelPosition";
import { getKey } from "@/lib/key-store";
import { CHAT_PROVIDER_IDS, resolveChatModel, type ChatProvider } from "@/lib/ai-models";
import { addMemory, buildMemoryContextForPrompt, isMemoryEnabled } from "./memory-drawer";
import { buildRitualContextForPrompt } from "./ritual-drawer";
import type { EmotionState } from "../components/face/types";
import type { PersonaTuningSettings } from "@/hooks/usePersonaSettings";
import { emotionFromText } from "@/lib/emotion-analysis";

interface ChatModuleProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmotionChange?: (emotion: EmotionState) => void;
    externalMessages?: ChatMessage[];
    liveTranscript?: string;
    voiceState?: "idle" | "listening" | "thinking" | "speaking" | "error";
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
function getActiveProvider(): { provider: ChatProvider; key: string; model: string } | null {
    for (const p of CHAT_PROVIDER_IDS) {
        const stored = getKey(p);
        if (stored) {
            const model = resolveChatModel(p, stored.model);
            return { provider: p, key: stored.key, model };
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
    externalMessages = [],
    liveTranscript = "",
    voiceState = "idle",
    activePersonaId = "coach",
    personaTuning,
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

    React.useEffect(() => {
        if (!open) abortRef.current?.abort();
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
        onEmotionChange?.(emotionFromText(userMsg.content));

        const trimmed = userMsg.content;

        const assistantId = (Date.now() + 1).toString();
        const memoryContext = [
            buildMemoryContextForPrompt(trimmed),
            buildRitualContextForPrompt(),
        ].filter(Boolean).join("\n");

        try {
            // Memory should enrich chat, never block a provider call.
            if (isMemoryEnabled() && trimmed.length > 20) {
                addMemory({ content: trimmed, tags: autoTags(trimmed), source: "chat" });
            }

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
                onEmotionChange(emotionFromText(fullText));
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
    const visibleMessages = React.useMemo(
        () =>
            [...messages, ...externalMessages].sort(
                (a, b) => Number(a.id.split(":").pop()) - Number(b.id.split(":").pop()),
            ),
        [externalMessages, messages],
    );
    const isVoiceActive = voiceState === "listening" || voiceState === "thinking";

    const isConfigured = !!providerInfo;
    const { x, y, onDragEnd } = usePanelPosition("chat");

    const statusText = isVoiceActive
        ? "VOICE"
        : isLoading
            ? "STREAM"
            : isConfigured
                ? "READY"
                : "NO_KEY";
    const statusColor = !isConfigured
        ? "var(--error)"
        : isConfigured && !isVoiceActive && !isLoading
            ? "var(--success)"
            : "var(--fg)";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragMomentum={false}
                    style={{ x, y }}
                    onDragEnd={onDragEnd}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute top-24 left-6 z-[100] flex w-[380px] flex-col te-module te-safe-panel"
                >
                    {/* Header */}
                    <div className="te-module-header h-10 px-3">
                        <div className="flex items-center gap-2">
                            <span
                                className="size-2 shrink-0"
                                style={{ background: isConfigured ? "var(--success)" : "var(--accent)" }}
                            />
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg)]">
                                CONV_MOD
                            </span>
                            <span className="label">TX-2</span>
                        </div>
                        <div className="te-grip h-2.5 w-10 opacity-70" />
                        <button
                            onClick={() => onOpenChange(false)}
                            className="size-6 shrink-0 te-button rounded-[5px]"
                            aria-label="Close"
                        >
                            <X className="size-3" strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2.5 p-3">
                        {/* Provider / status readout */}
                        <div className="te-lcd flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <MessageSquare className="size-3 shrink-0 text-[var(--fg-muted)]" strokeWidth={1.5} />
                                <span className="truncate font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--fg)]">
                                    {providerLabel}
                                </span>
                            </div>
                            <span
                                className="shrink-0 font-mono text-[9px] tracking-[0.1em]"
                                style={{ color: statusColor }}
                            >
                                {statusText}
                            </span>
                        </div>

                        {!isConfigured ? (
                            <div className="te-recessed flex flex-col items-center gap-3 p-5 text-center">
                                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">
                                    NO_AI_KEY_FOUND
                                </span>
                                <span className="font-mono text-[9px] leading-relaxed text-[var(--fg-faint)]">
                                    Add an OpenAI, Google, or Claude key in
                                    <br />
                                    Settings → KEYS tab to begin.
                                </span>
                                {onOpenSettings && (
                                    <button
                                        onClick={() => { onOpenSettings(); onOpenChange(false); }}
                                        className="flex h-9 items-center gap-1.5 rounded-[5px] te-button px-4"
                                        style={{
                                            background: "var(--accent)",
                                            borderColor: "var(--accent)",
                                            color: "var(--accent-foreground)",
                                        }}
                                    >
                                        <Settings2 className="size-3" strokeWidth={1.5} />
                                        <span className="font-mono text-[9px] tracking-[0.12em]">OPEN_SETTINGS</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Message log */}
                                <div className="te-recessed max-h-[240px] overflow-y-auto p-2.5">
                                    {liveTranscript && (
                                        <div className="mb-2 te-lcd px-2.5 py-1.5">
                                            <div className="label mb-1 leading-none">LIVE_TRANSCRIPT</div>
                                            <div className="font-mono text-[10px] normal-case leading-relaxed text-[var(--fg-muted)]">
                                                {liveTranscript}
                                            </div>
                                        </div>
                                    )}
                                    {visibleMessages.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <span className="label">AWAITING_INPUT</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 py-0.5">
                                            {visibleMessages.map((msg) => {
                                                const isUser = msg.role === "user";
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex flex-col gap-0.5 ${isUser ? "items-end" : "items-start"}`}
                                                    >
                                                        <span className="label leading-none">
                                                            {isUser ? "YOU" : "DOT"}
                                                        </span>
                                                        <div
                                                            className="max-w-[85%] rounded-[6px] px-2.5 py-1.5 font-mono text-[11px] leading-relaxed"
                                                            style={
                                                                isUser
                                                                    ? { background: "var(--fg)", color: "var(--bg)" }
                                                                    : {
                                                                          background: "var(--surface-raised)",
                                                                          color: "var(--fg)",
                                                                          border: "1px solid var(--hair-2)",
                                                                      }
                                                            }
                                                        >
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                                                <div className="flex items-start">
                                                    <div className="rounded-[6px] border border-[var(--hair-2)] bg-[var(--surface-raised)] px-2.5 py-1.5">
                                                        <Loader2 className="size-3 animate-spin text-[var(--fg-muted)]" />
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={scrollRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex items-center gap-1.5 te-recessed p-1.5"
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="TYPE_MSG..."
                                        disabled={isLoading}
                                        className="h-9 flex-1 rounded-[5px] border border-[var(--hair-2)] bg-[var(--surface-raised)] px-3 font-mono text-[11px] uppercase tracking-wider text-[var(--fg)] outline-none placeholder:text-[var(--fg-faint)] focus:border-[var(--fg)] disabled:opacity-40"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="flex size-9 shrink-0 items-center justify-center rounded-[5px] te-button"
                                        style={input.trim() ? {
                                            background: "var(--accent)",
                                            borderColor: "var(--accent)",
                                            color: "var(--accent-foreground)",
                                        } : undefined}
                                    >
                                        <Send className="size-3.5" strokeWidth={1.5} />
                                    </button>
                                </form>

                                {/* Error */}
                                {error && (
                                    <div
                                        className="rounded-[5px] px-2.5 py-1.5 font-mono text-[9px] tracking-wider"
                                        style={{
                                            color: "var(--error)",
                                            background: "color-mix(in srgb, var(--error) 10%, transparent)",
                                            border: "1px solid color-mix(in srgb, var(--error) 30%, transparent)",
                                        }}
                                    >
                                        ERR: {error.slice(0, 60)}
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
