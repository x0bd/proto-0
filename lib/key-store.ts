// lib/key-store.ts
// Client-side BYOK key persistence via localStorage.
// Keys are stored in plain text locally — they never leave the device
// except when forwarded to the app's own API routes.

const STORAGE_PREFIX = "dot_key_";

export type Provider = "openai" | "google" | "elevenlabs";

export interface StoredKey {
    provider: Provider;
    key: string;
    model?: string;
    sessionOnly?: boolean;
    updatedAt: number;
}

function storageKey(provider: Provider): string {
    return `${STORAGE_PREFIX}${provider}`;
}

export function setKey(provider: Provider, apiKey: string, opts?: { model?: string; sessionOnly?: boolean }): void {
    const entry: StoredKey = {
        provider,
        key: apiKey,
        model: opts?.model,
        sessionOnly: opts?.sessionOnly ?? false,
        updatedAt: Date.now(),
    };

    if (opts?.sessionOnly) {
        sessionStorage.setItem(storageKey(provider), JSON.stringify(entry));
    } else {
        localStorage.setItem(storageKey(provider), JSON.stringify(entry));
    }
}

export function getKey(provider: Provider): StoredKey | null {
    // Check sessionStorage first (session-only keys take precedence)
    const session = sessionStorage.getItem(storageKey(provider));
    if (session) {
        try { return JSON.parse(session); } catch { /* fall through */ }
    }

    const local = localStorage.getItem(storageKey(provider));
    if (local) {
        try { return JSON.parse(local); } catch { return null; }
    }

    return null;
}

export function clearKey(provider: Provider): void {
    localStorage.removeItem(storageKey(provider));
    sessionStorage.removeItem(storageKey(provider));
}

export function getAllKeys(): StoredKey[] {
    const providers: Provider[] = ["openai", "google", "elevenlabs"];
    return providers
        .map((p) => getKey(p))
        .filter((k): k is StoredKey => k !== null);
}

export function hasKey(provider: Provider): boolean {
    return getKey(provider) !== null;
}

// Default models per provider
export const DEFAULT_MODELS: Record<Provider, string> = {
    openai: "gpt-4o-mini",
    google: "gemini-2.0-flash",
    elevenlabs: "eleven_monolingual_v1",
};
