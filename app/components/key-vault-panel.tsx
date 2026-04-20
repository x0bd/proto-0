"use client";

import * as React from "react";
import { KeyRound, Eye, EyeOff, Check, X, Lock, Unlock } from "lucide-react";
import {
    setKey, getKey, clearKey, unlockVault, vaultIsLocked, isKeyEncrypted,
    type Provider, DEFAULT_MODELS,
} from "@/lib/key-store";

interface KeyVaultPanelProps {
    accentColor?: string;
}

const PROVIDERS: { id: Provider; label: string; placeholder: string; purpose: string }[] = [
    { id: "openai",     label: "OPENAI", placeholder: "sk-...",  purpose: "CHAT · VOICE" },
    { id: "google",     label: "GOOGLE", placeholder: "AIza...", purpose: "CHAT · VOICE" },
    { id: "elevenlabs", label: "11LABS", placeholder: "sk_...",  purpose: "TTS_ENGINE"   },
];

type View = "list" | "edit" | "unlock";

export function KeyVaultPanel({ accentColor = "#7c3aed" }: KeyVaultPanelProps) {
    const [view, setView] = React.useState<View>("list");
    const [keyStates, setKeyStates] = React.useState<Record<Provider, boolean>>({
        openai: false, google: false, elevenlabs: false,
    });
    const [encryptedStates, setEncryptedStates] = React.useState<Record<Provider, boolean>>({
        openai: false, google: false, elevenlabs: false,
    });
    const [locked, setLocked] = React.useState(false);

    // Edit state
    const [editingProvider, setEditingProvider] = React.useState<Provider | null>(null);
    const [inputValue, setInputValue] = React.useState("");
    const [showKey, setShowKey] = React.useState(false);
    const [passphraseValue, setPassphraseValue] = React.useState("");
    const [showPassphrase, setShowPassphrase] = React.useState(false);
    const [isSessionOnly, setIsSessionOnly] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    // Unlock state
    const [unlockInput, setUnlockInput] = React.useState("");
    const [showUnlock, setShowUnlock] = React.useState(false);
    const [unlockError, setUnlockError] = React.useState(false);
    const [unlocking, setUnlocking] = React.useState(false);

    const refreshState = React.useCallback(() => {
        setKeyStates({
            openai:     !!getKey("openai"),
            google:     !!getKey("google"),
            elevenlabs: !!getKey("elevenlabs"),
        });
        setEncryptedStates({
            openai:     isKeyEncrypted("openai"),
            google:     isKeyEncrypted("google"),
            elevenlabs: isKeyEncrypted("elevenlabs"),
        });
        setLocked(vaultIsLocked());
    }, []);

    React.useEffect(() => { refreshState(); }, [refreshState]);

    // ── Edit view ─────────────────────────────────────────────────────────────

    const openEdit = (provider: Provider) => {
        setEditingProvider(provider);
        setInputValue("");
        setPassphraseValue("");
        setShowKey(false);
        setShowPassphrase(false);
        setIsSessionOnly(false);
        setView("edit");
    };

    const cancelEdit = () => {
        setEditingProvider(null);
        setView("list");
    };

    const handleSave = async () => {
        if (!editingProvider || !inputValue.trim()) return;
        setSaving(true);
        await setKey(editingProvider, inputValue.trim(), {
            sessionOnly: isSessionOnly,
            passphrase: !isSessionOnly && passphraseValue.trim() ? passphraseValue.trim() : undefined,
        });
        refreshState();
        setSaving(false);
        setEditingProvider(null);
        setView("list");
    };

    // ── Unlock view ───────────────────────────────────────────────────────────

    const handleUnlock = async () => {
        if (!unlockInput.trim()) return;
        setUnlocking(true);
        setUnlockError(false);
        const { success } = await unlockVault(unlockInput.trim());
        if (success) {
            refreshState();
            setUnlockInput("");
            setView("list");
        } else {
            setUnlockError(true);
        }
        setUnlocking(false);
    };

    const handleDelete = (provider: Provider) => {
        clearKey(provider);
        refreshState();
    };

    // ── Unlock view ───────────────────────────────────────────────────────────

    if (view === "unlock") {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <span className="te-label">VAULT_UNLOCK</span>
                </div>

                <div className="te-recessed p-2 flex flex-col gap-2">
                    <div className="relative">
                        <input
                            type={showUnlock ? "text" : "password"}
                            value={unlockInput}
                            onChange={(e) => { setUnlockInput(e.target.value); setUnlockError(false); }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
                            placeholder="VAULT_PASSPHRASE..."
                            autoFocus
                            className="w-full h-9 px-3 pr-9 rounded-[6px] text-[11px] font-mono font-bold tracking-wider text-foreground placeholder:text-foreground/25 bg-[var(--lcd-bg)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] border-none outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowUnlock((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-foreground/30 hover:text-foreground/60"
                        >
                            {showUnlock ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </button>
                    </div>

                    {unlockError && (
                        <span className="text-[9px] font-mono font-bold text-[var(--te-orange)] tracking-widest px-1">
                            ERR_WRONG_PASSPHRASE
                        </span>
                    )}

                    <div className="flex gap-1.5">
                        <button
                            onClick={() => { setView("list"); setUnlockInput(""); setUnlockError(false); }}
                            className="flex-1 h-8 te-button rounded-[6px] flex items-center justify-center gap-1 text-foreground/60"
                        >
                            <X className="size-3" />
                            <span className="text-[9px] font-bold tracking-widest">CANCEL</span>
                        </button>
                        <button
                            onClick={handleUnlock}
                            disabled={!unlockInput.trim() || unlocking}
                            className="flex-1 h-8 te-button rounded-[6px] flex items-center justify-center gap-1 disabled:opacity-30"
                            style={{
                                "--key-bg": "var(--te-blue)",
                                "--key-border": "color-mix(in srgb, var(--te-blue) 80%, black)",
                                "--key-shadow": "color-mix(in srgb, var(--te-blue) 60%, black)",
                                color: "#ffffff",
                            } as React.CSSProperties}
                        >
                            <Unlock className="size-3" />
                            <span className="text-[9px] font-bold tracking-widest">
                                {unlocking ? "..." : "UNLOCK"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Edit view ─────────────────────────────────────────────────────────────

    if (view === "edit" && editingProvider) {
        const providerMeta = PROVIDERS.find((p) => p.id === editingProvider)!;
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <span className="te-label">ADD_KEY · {providerMeta.label}</span>
                </div>

                <div className="te-recessed p-2 flex flex-col gap-2">
                    {/* API key input */}
                    <div className="relative">
                        <input
                            type={showKey ? "text" : "password"}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !isSessionOnly && passphraseValue) handleSave(); }}
                            placeholder={providerMeta.placeholder}
                            autoFocus
                            className="w-full h-9 px-3 pr-9 rounded-[6px] text-[11px] font-mono font-bold tracking-wider text-foreground placeholder:text-foreground/25 bg-[var(--lcd-bg)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] border-none outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-foreground/30 hover:text-foreground/60"
                        >
                            {showKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </button>
                    </div>

                    {/* Session-only toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-foreground/40 px-1">
                            SESSION_ONLY
                        </span>
                        <button
                            onClick={() => setIsSessionOnly((v) => !v)}
                            className="h-7 px-3 te-button rounded-[6px] text-[9px] transition-all duration-150"
                            style={isSessionOnly ? {
                                "--key-bg": "var(--te-orange)",
                                "--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
                                "--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
                                color: "#ffffff",
                            } as React.CSSProperties : undefined}
                        >
                            {isSessionOnly ? "ON" : "OFF"}
                        </button>
                    </div>

                    {/* Vault passphrase — only when NOT session-only */}
                    {!isSessionOnly && (
                        <div className="relative">
                            <input
                                type={showPassphrase ? "text" : "password"}
                                value={passphraseValue}
                                onChange={(e) => setPassphraseValue(e.target.value)}
                                placeholder="VAULT_PASS (optional)..."
                                className="w-full h-9 px-3 pr-9 rounded-[6px] text-[11px] font-mono font-bold tracking-wider text-foreground placeholder:text-foreground/25 bg-[var(--lcd-bg)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] border-none outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassphrase((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-foreground/30 hover:text-foreground/60"
                            >
                                {showPassphrase ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            </button>
                        </div>
                    )}

                    {/* Storage mode hint */}
                    <div className="te-lcd px-2 py-1 text-center">
                        <span className="text-[8px] font-mono font-bold tracking-widest opacity-50">
                            {isSessionOnly
                                ? "EPHEMERAL · CLEARED ON TAB CLOSE"
                                : passphraseValue.trim()
                                    ? "AES-256-GCM · ENCRYPTED AT REST"
                                    : "PLAIN · NO PASSPHRASE SET"}
                        </span>
                    </div>

                    <div className="flex gap-1.5">
                        <button
                            onClick={cancelEdit}
                            className="flex-1 h-8 te-button rounded-[6px] flex items-center justify-center gap-1 text-foreground/60"
                        >
                            <X className="size-3" />
                            <span className="text-[9px] font-bold tracking-widest">CANCEL</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!inputValue.trim() || saving}
                            className="flex-1 h-8 te-button rounded-[6px] flex items-center justify-center gap-1 disabled:opacity-30"
                            style={{
                                "--key-bg": "var(--te-green)",
                                "--key-border": "color-mix(in srgb, var(--te-green) 80%, black)",
                                "--key-shadow": "color-mix(in srgb, var(--te-green) 60%, black)",
                                color: "#ffffff",
                            } as React.CSSProperties}
                        >
                            <Check className="size-3" />
                            <span className="text-[9px] font-bold tracking-widest">
                                {saving ? "..." : "SAVE"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── List view ─────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <span className="te-label">KEY_VAULT</span>
                <span className="te-label opacity-40">LOCAL_ONLY</span>
            </div>

            {/* Vault locked banner */}
            {locked && (
                <div className="te-recessed p-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-1">
                        <Lock className="size-3 text-[var(--te-orange)]" />
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[var(--te-orange)]">
                            VAULT_LOCKED
                        </span>
                    </div>
                    <button
                        onClick={() => setView("unlock")}
                        className="h-7 px-3 te-button rounded-[6px] text-[9px]"
                        style={{
                            "--key-bg": "var(--te-orange)",
                            "--key-border": "color-mix(in srgb, var(--te-orange) 80%, black)",
                            "--key-shadow": "color-mix(in srgb, var(--te-orange) 60%, black)",
                            color: "#ffffff",
                        } as React.CSSProperties}
                    >
                        UNLOCK
                    </button>
                </div>
            )}

            {/* Provider rows */}
            <div className="te-recessed p-1.5 flex flex-col gap-1.5">
                {PROVIDERS.map((provider) => {
                    const isConfigured = keyStates[provider.id];
                    const isEnc = encryptedStates[provider.id];
                    return (
                        <div key={provider.id} className="flex items-center gap-1.5">
                            <button
                                onClick={() => openEdit(provider.id)}
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
                                        isEnc ? <Lock className="size-3" /> : <Check className="size-3" />
                                    ) : (
                                        <KeyRound className="size-3 opacity-50" />
                                    )}
                                    <span className="text-[10px] font-bold tracking-widest">{provider.label}</span>
                                    <span className="text-[7px] font-bold tracking-widest opacity-40">{provider.purpose}</span>
                                </div>
                                <span className="text-[8px] font-bold tracking-widest opacity-60">
                                    {isConfigured ? (isEnc ? "ENC" : "SET") : "ADD"}
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

            <div className="te-lcd px-2 py-1.5 text-center">
                <span className="text-[8px] opacity-50 tracking-[0.2em] font-bold leading-relaxed">
                    KEYS STORED ON-DEVICE ONLY · NEVER SENT TO OUR SERVERS
                </span>
            </div>
        </div>
    );
}
