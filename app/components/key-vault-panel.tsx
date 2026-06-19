"use client";

import * as React from "react";
import { KeyRound, Eye, EyeOff, Check, X, Lock, Unlock } from "lucide-react";
import {
    setKey, getKey, clearKey, unlockVault, vaultIsLocked, isKeyEncrypted,
    type Provider, DEFAULT_MODELS, KEY_STORE_CHANGE_EVENT,
} from "@/lib/key-store";
import { CHAT_MODELS, ELEVENLABS_TTS_MODELS } from "@/lib/ai-models";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const PROVIDERS: { id: Provider; label: string; placeholder: string; purpose: string }[] = [
    { id: "openai",     label: "OPENAI", placeholder: "sk-...",  purpose: "CHAT · VOICE" },
    { id: "google",     label: "GOOGLE", placeholder: "AIza...", purpose: "CHAT · VOICE" },
    { id: "anthropic",  label: "CLAUDE", placeholder: "sk-ant-...", purpose: "CHAT · VOICE" },
    { id: "elevenlabs", label: "11LABS", placeholder: "sk_...",  purpose: "TTS_ENGINE"   },
];

const PROVIDER_MODELS: Partial<Record<Provider, { id: string; label: string }[]>> = {
    ...CHAT_MODELS,
    elevenlabs: ELEVENLABS_TTS_MODELS,
};

type View = "list" | "edit" | "unlock";
type ValidationStatus = "idle" | "testing" | "valid" | "invalid";

interface ValidationState {
    status: ValidationStatus;
    message?: string;
}

const INITIAL_VALIDATION_STATE: Record<Provider, ValidationState> = {
    openai: { status: "idle" },
    google: { status: "idle" },
    anthropic: { status: "idle" },
    elevenlabs: { status: "idle" },
};

export function KeyVaultPanel() {
    const [view, setView] = React.useState<View>("list");
    const [keyStates, setKeyStates] = React.useState<Record<Provider, boolean>>({
        openai: false, google: false, anthropic: false, elevenlabs: false,
    });
    const [encryptedStates, setEncryptedStates] = React.useState<Record<Provider, boolean>>({
        openai: false, google: false, anthropic: false, elevenlabs: false,
    });
    const [locked, setLocked] = React.useState(false);

    // Edit state
    const [editingProvider, setEditingProvider] = React.useState<Provider | null>(null);
    const [inputValue, setInputValue] = React.useState("");
    const [showKey, setShowKey] = React.useState(false);
    const [passphraseValue, setPassphraseValue] = React.useState("");
    const [showPassphrase, setShowPassphrase] = React.useState(false);
    const [isSessionOnly, setIsSessionOnly] = React.useState(false);
    const [modelValue, setModelValue] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    // Unlock state
    const [unlockInput, setUnlockInput] = React.useState("");
    const [showUnlock, setShowUnlock] = React.useState(false);
    const [unlockError, setUnlockError] = React.useState(false);
    const [unlocking, setUnlocking] = React.useState(false);
    const [validationStates, setValidationStates] = React.useState<Record<Provider, ValidationState>>(INITIAL_VALIDATION_STATE);
    const [deleteProvider, setDeleteProvider] = React.useState<Provider | null>(null);

    const refreshState = React.useCallback(() => {
        setKeyStates({
            openai:     !!getKey("openai"),
            google:     !!getKey("google"),
            anthropic:  !!getKey("anthropic"),
            elevenlabs: !!getKey("elevenlabs"),
        });
        setEncryptedStates({
            openai:     isKeyEncrypted("openai"),
            google:     isKeyEncrypted("google"),
            anthropic:  isKeyEncrypted("anthropic"),
            elevenlabs: isKeyEncrypted("elevenlabs"),
        });
        setLocked(vaultIsLocked());
    }, []);

    React.useEffect(() => {
        refreshState();
        window.addEventListener("storage", refreshState);
        window.addEventListener(KEY_STORE_CHANGE_EVENT, refreshState);
        return () => {
            window.removeEventListener("storage", refreshState);
            window.removeEventListener(KEY_STORE_CHANGE_EVENT, refreshState);
        };
    }, [refreshState]);

    // ── Edit view ─────────────────────────────────────────────────────────────

    const openEdit = (provider: Provider) => {
        setEditingProvider(provider);
        setInputValue("");
        setPassphraseValue("");
        setShowKey(false);
        setShowPassphrase(false);
        setIsSessionOnly(false);
        setModelValue(DEFAULT_MODELS[provider]);
        setView("edit");
    };

    const cancelEdit = () => {
        setEditingProvider(null);
        setView("list");
    };

    const handleSave = async () => {
        if (!editingProvider || !inputValue.trim()) return;
        setSaving(true);
        try {
            await setKey(editingProvider, inputValue.trim(), {
                sessionOnly: isSessionOnly,
                passphrase: !isSessionOnly && passphraseValue.trim() ? passphraseValue.trim() : undefined,
                model: modelValue || DEFAULT_MODELS[editingProvider],
            });
            refreshState();
            setEditingProvider(null);
            setView("list");
        } catch (error) {
            setValidationStates((prev) => ({
                ...prev,
                [editingProvider]: {
                    status: "invalid",
                    message: error instanceof Error ? error.message : "SAVE_FAILED",
                },
            }));
        } finally {
            setSaving(false);
        }
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
        setValidationStates((prev) => ({ ...prev, [provider]: { status: "idle" } }));
        setDeleteProvider(null);
        refreshState();
    };

    const validateKey = async (provider: Provider, key: string, model?: string) => {
        if (!key.trim()) return;
        setValidationStates((prev) => ({
            ...prev,
            [provider]: { status: "testing", message: "PINGING" },
        }));

        try {
            const response = await fetch("/api/keys/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-dot-api-key": key.trim(),
                },
                body: JSON.stringify({ provider, model }),
            });
            const data = (await response.json().catch(() => ({}))) as {
                ok?: boolean;
                label?: string;
                detail?: string;
                error?: string;
            };

            if (!response.ok || !data.ok) {
                throw new Error(data.error || "VALIDATION_FAILED");
            }

            setValidationStates((prev) => ({
                ...prev,
                [provider]: {
                    status: "valid",
                    message: data.detail ? `${data.label} · ${data.detail}` : data.label || "KEY_OK",
                },
            }));
        } catch (error) {
            setValidationStates((prev) => ({
                ...prev,
                [provider]: {
                    status: "invalid",
                    message: error instanceof Error ? error.message : "KEY_BAD",
                },
            }));
        }
    };

    const validateSavedKey = (provider: Provider) => {
        const stored = getKey(provider);
        if (!stored) return;
        const supportedModels = PROVIDER_MODELS[provider]?.map((item) => item.id);
        const model =
            stored.model && supportedModels?.includes(stored.model)
                ? stored.model
                : DEFAULT_MODELS[provider];
        void validateKey(provider, stored.key, model);
    };

    const validationLabel = (provider: Provider, fallback: string) => {
        const state = validationStates[provider];
        if (state.status === "testing") return "PING";
        if (state.status === "valid") return "OK";
        if (state.status === "invalid") return "BAD";
        return fallback;
    };

    const validationColor = (provider: Provider) => {
        const state = validationStates[provider];
        if (state.status === "valid") return "var(--success)";
        if (state.status === "invalid") return "var(--error)";
        if (state.status === "testing") return "var(--fg)";
        return undefined;
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
                            className="h-9 w-full rounded-[5px] border border-[var(--hair-2)] bg-[var(--surface-raised)] px-3 pr-9 font-mono text-[11px] tracking-wider text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--fg)]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowUnlock((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center text-foreground/55 hover:text-foreground"
                        >
                            {showUnlock ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </button>
                    </div>

                    {unlockError && (
                        <span className="px-1 font-mono text-[9px] tracking-widest text-[var(--error)]">
                            ERR_WRONG_PASSPHRASE
                        </span>
                    )}

                    <div className="flex gap-1.5">
                        <button
                            onClick={() => { setView("list"); setUnlockInput(""); setUnlockError(false); }}
                            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-[5px] te-button"
                        >
                            <X className="size-3" strokeWidth={1.5} />
                            <span className="text-[9px] tracking-widest">CANCEL</span>
                        </button>
                        <button
                            onClick={handleUnlock}
                            disabled={!unlockInput.trim() || unlocking}
                            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-[5px] te-button disabled:opacity-30"
                            style={{
                                background: "var(--accent)",
                                borderColor: "var(--accent)",
                                color: "var(--accent-foreground)",
                            } as React.CSSProperties}
                        >
                            <Unlock className="size-3" strokeWidth={1.5} />
                            <span className="text-[9px] tracking-widest">
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
                            className="h-9 w-full rounded-[5px] border border-[var(--hair-2)] bg-[var(--surface-raised)] px-3 pr-9 font-mono text-[11px] tracking-wider text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--fg)]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center text-foreground/55 hover:text-foreground"
                        >
                            {showKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </button>
                    </div>

                    {/* Session-only toggle */}
                    <div className="flex items-center justify-between">
                        <span className="px-1 font-mono text-[9px] tracking-widest text-[var(--fg-faint)]">
                            SESSION_ONLY
                        </span>
                        <button
                            onClick={() => setIsSessionOnly((v) => !v)}
                            className="h-7 rounded-[5px] te-button px-3 text-[9px]"
                            style={isSessionOnly ? {
                                background: "var(--fg)",
                                borderColor: "var(--fg)",
                                color: "var(--bg)",
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
                                className="h-9 w-full rounded-[5px] border border-[var(--hair-2)] bg-[var(--surface-raised)] px-3 pr-9 font-mono text-[11px] tracking-wider text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--fg)]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassphrase((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center text-foreground/55 hover:text-foreground"
                            >
                                {showPassphrase ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            </button>
                        </div>
                    )}

                    {/* Model picker — only for providers that have model options */}
                    {editingProvider && PROVIDER_MODELS[editingProvider] && (
                        <div className="flex flex-col gap-1">
                            <span className="px-1 font-mono text-[9px] tracking-widest text-[var(--fg-faint)]">MODEL_VER</span>
                            <div className="flex flex-wrap gap-1.5">
                                {PROVIDER_MODELS[editingProvider]!.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setModelValue(m.id)}
                                        className="h-7 flex-1 rounded-[5px] te-button px-2 text-[8px]"
                                        style={modelValue === m.id ? {
                                            background: "var(--fg)",
                                            borderColor: "var(--fg)",
                                            color: "var(--bg)",
                                        } as React.CSSProperties : undefined}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Storage mode hint */}
                    <div className="te-lcd px-2 py-1 text-center">
                        <span className="font-mono text-[8px] tracking-widest text-[var(--fg-faint)]">
                            {isSessionOnly
                                ? "EPHEMERAL · CLEARED ON TAB CLOSE"
                                : passphraseValue.trim()
                                    ? "AES-256-GCM · ENCRYPTED AT REST"
                                    : "PLAIN · NO PASSPHRASE SET"}
                        </span>
                    </div>

                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={() => validateKey(editingProvider, inputValue, modelValue || DEFAULT_MODELS[editingProvider])}
                            disabled={!inputValue.trim() || validationStates[editingProvider].status === "testing"}
                            className="flex h-9 items-center justify-center gap-1 rounded-[5px] te-button px-3 disabled:opacity-30"
                        >
                            <span className="text-[9px] tracking-widest">
                                {validationStates[editingProvider].status === "testing" ? "PING..." : "PING_KEY"}
                            </span>
                        </button>
                        <div className="flex flex-1 items-center justify-center overflow-hidden te-lcd px-2 py-1 text-center">
                            <span
                                className="truncate font-mono text-[8px] tracking-widest"
                                style={{ color: validationColor(editingProvider) ?? "var(--fg-muted)" }}
                            >
                                {validationStates[editingProvider].message || "KEY_TEST_STANDBY"}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-1.5">
                        <button
                            onClick={cancelEdit}
                            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-[5px] te-button"
                        >
                            <X className="size-3" strokeWidth={1.5} />
                            <span className="text-[9px] tracking-widest">CANCEL</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!inputValue.trim() || saving}
                            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-[5px] te-button disabled:opacity-30"
                            style={{
                                background: "var(--accent)",
                                borderColor: "var(--accent)",
                                color: "var(--accent-foreground)",
                            } as React.CSSProperties}
                        >
                            <Check className="size-3" strokeWidth={1.5} />
                            <span className="text-[9px] tracking-widest">
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
                <div className="te-recessed flex items-center justify-between p-1.5">
                    <div className="flex items-center gap-2 px-1">
                        <Lock className="size-3 text-[var(--warning)]" strokeWidth={1.5} />
                        <span className="font-mono text-[9px] tracking-widest text-[var(--warning)]">
                            VAULT_LOCKED
                        </span>
                    </div>
                    <button
                        onClick={() => setView("unlock")}
                        className="h-7 rounded-[5px] te-button px-3 text-[9px]"
                        style={{
                            background: "var(--accent)",
                            borderColor: "var(--accent)",
                            color: "var(--accent-foreground)",
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
                    const isLockedEncrypted = isEnc && !isConfigured;
                    return (
                        <div key={provider.id} className="flex items-center gap-1.5">
                            <button
                                onClick={() => isLockedEncrypted ? setView("unlock") : openEdit(provider.id)}
                                className="flex h-9 flex-1 items-center justify-between rounded-[5px] te-button px-3"
                            >
                                <div className="flex items-center gap-2">
                                    {isLockedEncrypted ? (
                                        <Lock className="size-3 text-[var(--warning)]" strokeWidth={1.5} />
                                    ) : isConfigured ? (
                                        isEnc
                                            ? <Lock className="size-3 text-[var(--success)]" strokeWidth={1.5} />
                                            : <Check className="size-3 text-[var(--success)]" strokeWidth={1.5} />
                                    ) : (
                                        <KeyRound className="size-3 opacity-40" strokeWidth={1.5} />
                                    )}
                                    <span className="text-[10px] tracking-widest text-[var(--fg)]">{provider.label}</span>
                                    <span className="text-[7px] tracking-widest text-[var(--fg-faint)]">{provider.purpose}</span>
                                </div>
                                <span
                                    className="text-[8px] tracking-widest"
                                    style={{
                                        color: isLockedEncrypted
                                            ? "var(--warning)"
                                            : isConfigured
                                                ? (validationColor(provider.id) ?? "var(--success)")
                                                : "var(--fg-faint)",
                                    }}
                                >
                                    {isLockedEncrypted
                                        ? "LOCK"
                                        : isConfigured
                                        ? validationLabel(provider.id, isEnc ? "ENC" : "SET")
                                        : "ADD"}
                                </span>
                            </button>

                            {isConfigured && (
                                <>
                                    <button
                                        onClick={() => validateSavedKey(provider.id)}
                                        disabled={validationStates[provider.id].status === "testing"}
                                        className="flex h-9 shrink-0 items-center justify-center rounded-[5px] te-button px-2 disabled:opacity-40"
                                        title="Test key"
                                    >
                                        <span
                                            className="text-[8px] tracking-widest"
                                            style={{ color: validationColor(provider.id) ?? "var(--fg-muted)" }}
                                        >
                                            {validationStates[provider.id].status === "testing" ? "..." : "TST"}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setDeleteProvider(provider.id)}
                                        className="flex size-9 shrink-0 items-center justify-center rounded-[5px] te-button text-[var(--fg-muted)] hover:border-[var(--error)] hover:text-[var(--error)]"
                                        title="Eject key"
                                    >
                                        <X className="size-3" strokeWidth={1.5} />
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {PROVIDERS.some((provider) => validationStates[provider.id].message) && (
                <div className="te-lcd px-2 py-1 text-center">
                    <span className="text-[8px] tracking-[0.2em] leading-relaxed text-[var(--fg-muted)]">
                        {PROVIDERS.map((provider) => validationStates[provider.id].message)
                            .find(Boolean)
                            ?.slice(0, 44)}
                    </span>
                </div>
            )}

            <div className="te-lcd px-2 py-1.5 text-center">
                <span className="text-[8px] tracking-[0.2em] leading-relaxed text-[var(--fg-faint)]">
                    LOCAL_VAULT · PROXY_HEADER_ONLY · SERVER_NOT_STORED
                </span>
            </div>

            <ConfirmDialog
                open={deleteProvider !== null}
                onOpenChange={(open) => !open && setDeleteProvider(null)}
                title="Eject this key?"
                description="This removes the provider key from this browser vault. DOT will stop using that integration until a new key is added."
                confirmText="Eject Key"
                destructive
                onConfirm={() => {
                    if (deleteProvider) handleDelete(deleteProvider);
                }}
            />
        </div>
    );
}
