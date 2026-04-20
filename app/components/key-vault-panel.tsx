"use client";

import * as React from "react";
import { KeyRound, Eye, EyeOff, Check, X, Plus } from "lucide-react";
import { setKey, getKey, clearKey, type Provider, DEFAULT_MODELS } from "@/lib/key-store";

interface KeyVaultPanelProps {
    accentColor?: string;
}

const PROVIDERS: { id: Provider; label: string; placeholder: string; purpose: string }[] = [
    { id: "openai",      label: "OPENAI", placeholder: "sk-...",   purpose: "CHAT · VOICE" },
    { id: "google",      label: "GOOGLE", placeholder: "AIza...",  purpose: "CHAT · VOICE" },
    { id: "elevenlabs",  label: "11LABS", placeholder: "sk_...",   purpose: "TTS_ENGINE"   },
];

export function KeyVaultPanel({ accentColor = "#7c3aed" }: KeyVaultPanelProps) {
    const [keyStates, setKeyStates] = React.useState<Record<Provider, boolean>>({
        openai: false,
        google: false,
        elevenlabs: false,
    });
    const [editingProvider, setEditingProvider] = React.useState<Provider | null>(null);
    const [inputValue, setInputValue] = React.useState("");
    const [showKey, setShowKey] = React.useState(false);

    // Load saved keys on mount
    React.useEffect(() => {
        setKeyStates({
            openai: !!getKey("openai"),
            google: !!getKey("google"),
            elevenlabs: !!getKey("elevenlabs"),
        });
    }, []);

    const handleSave = () => {
        if (!editingProvider || !inputValue.trim()) return;
        setKey(editingProvider, inputValue.trim());
        setKeyStates((prev) => ({ ...prev, [editingProvider]: true }));
        setEditingProvider(null);
        setInputValue("");
        setShowKey(false);
    };

    const handleDelete = (provider: Provider) => {
        clearKey(provider);
        setKeyStates((prev) => ({ ...prev, [provider]: false }));
    };

    if (editingProvider) {
        const providerMeta = PROVIDERS.find((p) => p.id === editingProvider)!;
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <span className="te-label">ADD_KEY · {providerMeta.label}</span>
                </div>

                {/* Key Input */}
                <div className="te-recessed p-2 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex-1 relative">
                            <input
                                type={showKey ? "text" : "password"}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                                placeholder={providerMeta.placeholder}
                                autoFocus
                                className="w-full h-9 px-3 pr-9 rounded-[6px] text-[11px] font-mono font-bold tracking-wider text-foreground placeholder:text-foreground/25 bg-[var(--lcd-bg)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] border-none outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-foreground/30 hover:text-foreground/60"
                            >
                                {showKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-1.5">
                        <button
                            onClick={() => { setEditingProvider(null); setInputValue(""); setShowKey(false); }}
                            className="flex-1 h-8 te-button rounded-[6px] flex items-center justify-center gap-1 text-foreground/60"
                        >
                            <X className="size-3" />
                            <span className="text-[9px] font-bold tracking-widest">CANCEL</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!inputValue.trim()}
                            className="flex-1 h-8 te-button rounded-[6px] flex items-center justify-center gap-1 disabled:opacity-30 text-white"
                            style={{
                                "--key-bg": "var(--te-green)",
                                "--key-border": "color-mix(in srgb, var(--te-green) 80%, black)",
                                "--key-shadow": "color-mix(in srgb, var(--te-green) 60%, black)",
                                color: "#ffffff",
                            } as React.CSSProperties}
                        >
                            <Check className="size-3" />
                            <span className="text-[9px] font-bold tracking-widest">SAVE</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <span className="te-label">KEY_VAULT</span>
                <span className="te-label opacity-40">LOCAL_ONLY</span>
            </div>

            {/* Provider list */}
            <div className="te-recessed p-1.5 flex flex-col gap-1.5">
                {PROVIDERS.map((provider) => {
                    const isConfigured = keyStates[provider.id];
                    return (
                        <div key={provider.id} className="flex items-center gap-1.5">
                            <button
                                onClick={() => {
                                    if (isConfigured) {
                                        // Already configured — clicking edits
                                        setEditingProvider(provider.id);
                                    } else {
                                        setEditingProvider(provider.id);
                                    }
                                    setInputValue("");
                                    setShowKey(false);
                                }}
                                className="flex-1 h-9 te-button rounded-[6px] flex items-center justify-between px-3 transition-all duration-150"
                                style={isConfigured ? {
                                    "--key-bg": "var(--te-green)",
                                    "--key-border": "color-mix(in srgb, var(--te-green) 80%, black)",
                                    "--key-shadow": "color-mix(in srgb, var(--te-green) 60%, black)",
                                    color: "#ffffff",
                                } as React.CSSProperties : undefined}
                            >
                                <div className="flex items-center gap-2">
                                    {isConfigured ? (
                                        <Check className="size-3" />
                                    ) : (
                                        <KeyRound className="size-3 opacity-50" />
                                    )}
                                    <span className="text-[10px] font-bold tracking-widest">{provider.label}</span>
                                    <span className="text-[7px] font-bold tracking-widest opacity-40">{provider.purpose}</span>
                                </div>
                                <span className="text-[8px] font-bold tracking-widest opacity-60">
                                    {isConfigured ? "SET" : "ADD"}
                                </span>
                            </button>

                            {isConfigured && (
                                <button
                                    onClick={() => handleDelete(provider.id)}
                                    className="size-9 shrink-0 te-button rounded-[6px] flex items-center justify-center transition-all"
                                    style={{
                                        "--key-bg": "var(--te-orange)",
                                        "--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
                                        "--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
                                        color: "#ffffff",
                                    } as React.CSSProperties}
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="te-lcd px-2 py-1.5 text-center">
                <span className="text-[8px] opacity-50 tracking-[0.2em] font-bold leading-relaxed">
                    KEYS STORED ON-DEVICE ONLY · NEVER SENT TO OUR SERVERS
                </span>
            </div>
        </div>
    );
}
