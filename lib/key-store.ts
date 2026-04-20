// lib/key-store.ts
// BYOK key persistence with optional Web Crypto AES-GCM encryption.
// Keys never leave the device except when forwarded to the app's own API routes.

const STORAGE_PREFIX = "dot_key_";

export type Provider = "openai" | "google" | "elevenlabs";

export interface StoredKey {
  provider: Provider;
  key: string;
  model?: string;
  sessionOnly?: boolean;
  updatedAt: number;
}

interface EncryptedBlob {
  ciphertext: string; // base64
  iv: string;         // base64
  salt: string;       // base64
}

interface StoredEntry {
  provider: Provider;
  encrypted: boolean;
  blob?: EncryptedBlob; // present when encrypted === true
  key?: string;         // present when encrypted === false
  model?: string;
  sessionOnly?: boolean;
  updatedAt: number;
}

// In-memory cache — populated on setKey or unlockVault, cleared on page reload
const memCache = new Map<Provider, StoredKey>();

function storageKey(provider: Provider): string {
  return `${STORAGE_PREFIX}${provider}`;
}

// ── Web Crypto helpers ──────────────────────────────────────────────────────

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

function fromBase64(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

async function deriveKey(passphrase: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptValue(plaintext: string, passphrase: string): Promise<EncryptedBlob> {
  const saltArr = crypto.getRandomValues(new Uint8Array(16));
  const ivArr   = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, saltArr.buffer as ArrayBuffer);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivArr.buffer as ArrayBuffer },
    key,
    new TextEncoder().encode(plaintext),
  );
  return {
    ciphertext: toBase64(ciphertext),
    iv:         toBase64(ivArr.buffer as ArrayBuffer),
    salt:       toBase64(saltArr.buffer as ArrayBuffer),
  };
}

async function decryptValue(blob: EncryptedBlob, passphrase: string): Promise<string> {
  const salt       = fromBase64(blob.salt);
  const iv         = fromBase64(blob.iv);
  const ciphertext = fromBase64(blob.ciphertext);
  const key = await deriveKey(passphrase, salt);
  const plaintext  = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Save a provider key.
 * - passphrase provided → encrypt with AES-GCM (PBKDF2) and persist to localStorage
 * - sessionOnly        → store plain in sessionStorage (cleared when tab closes)
 * - neither            → store plain in localStorage (backward-compatible default)
 */
export async function setKey(
  provider: Provider,
  apiKey: string,
  opts?: { model?: string; sessionOnly?: boolean; passphrase?: string },
): Promise<void> {
  const sessionOnly = opts?.sessionOnly ?? false;
  const passphrase = opts?.passphrase?.trim();

  if (sessionOnly) {
    const entry: StoredEntry = {
      provider, encrypted: false, key: apiKey,
      model: opts?.model, sessionOnly: true, updatedAt: Date.now(),
    };
    sessionStorage.setItem(storageKey(provider), JSON.stringify(entry));
    localStorage.removeItem(storageKey(provider));
    memCache.set(provider, { provider, key: apiKey, model: opts?.model, sessionOnly: true, updatedAt: Date.now() });
    return;
  }

  if (passphrase) {
    const blob = await encryptValue(apiKey, passphrase);
    const entry: StoredEntry = {
      provider, encrypted: true, blob,
      model: opts?.model, sessionOnly: false, updatedAt: Date.now(),
    };
    localStorage.setItem(storageKey(provider), JSON.stringify(entry));
    memCache.set(provider, { provider, key: apiKey, model: opts?.model, sessionOnly: false, updatedAt: Date.now() });
    return;
  }

  // Plain — backward-compatible
  const entry: StoredEntry = {
    provider, encrypted: false, key: apiKey,
    model: opts?.model, sessionOnly: false, updatedAt: Date.now(),
  };
  localStorage.setItem(storageKey(provider), JSON.stringify(entry));
  memCache.set(provider, { provider, key: apiKey, model: opts?.model, sessionOnly: false, updatedAt: Date.now() });
}

/** Read a key. Returns from memory cache first, then sessionStorage, then plain localStorage. Returns null for encrypted keys that haven't been unlocked. */
export function getKey(provider: Provider): StoredKey | null {
  const cached = memCache.get(provider);
  if (cached) return cached;

  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(storageKey(provider));
      if (!raw) continue;
      const entry: StoredEntry = JSON.parse(raw);
      // Old format (pre-encryption) has no `encrypted` field — treat as plain
      if (entry.encrypted) continue; // locked — must call unlockVault first
      if (!entry.key) continue;
      const stored: StoredKey = { provider, key: entry.key, model: entry.model, sessionOnly: entry.sessionOnly, updatedAt: entry.updatedAt };
      memCache.set(provider, stored);
      return stored;
    } catch { /* fall through */ }
  }
  return null;
}

export function clearKey(provider: Provider): void {
  localStorage.removeItem(storageKey(provider));
  sessionStorage.removeItem(storageKey(provider));
  memCache.delete(provider);
}

export function getAllKeys(): StoredKey[] {
  const providers: Provider[] = ["openai", "google", "elevenlabs"];
  return providers.map((p) => getKey(p)).filter((k): k is StoredKey => k !== null);
}

export function hasKey(provider: Provider): boolean {
  return getKey(provider) !== null;
}

/** True if any localStorage entry is encrypted and not yet in the memory cache. */
export function vaultIsLocked(): boolean {
  const providers: Provider[] = ["openai", "google", "elevenlabs"];
  return providers.some((p) => {
    if (memCache.has(p)) return false;
    try {
      const raw = localStorage.getItem(storageKey(p));
      if (!raw) return false;
      return (JSON.parse(raw) as StoredEntry).encrypted === true;
    } catch { return false; }
  });
}

/** True if a specific key is stored encrypted in localStorage. */
export function isKeyEncrypted(provider: Provider): boolean {
  try {
    const raw = localStorage.getItem(storageKey(provider));
    if (!raw) return false;
    return (JSON.parse(raw) as StoredEntry).encrypted === true;
  } catch { return false; }
}

/**
 * Decrypt all encrypted localStorage keys using the given vault passphrase.
 * Populates the in-memory cache so getKey() returns immediately after.
 * Returns { success: true } if all encrypted keys decrypted without error.
 */
export async function unlockVault(passphrase: string): Promise<{ success: boolean; unlocked: number }> {
  const providers: Provider[] = ["openai", "google", "elevenlabs"];
  let unlocked = 0;
  let anyFailed = false;

  for (const p of providers) {
    if (memCache.has(p)) continue;
    try {
      const raw = localStorage.getItem(storageKey(p));
      if (!raw) continue;
      const entry: StoredEntry = JSON.parse(raw);
      if (!entry.encrypted || !entry.blob) continue;
      const plainKey = await decryptValue(entry.blob, passphrase);
      memCache.set(p, { provider: p, key: plainKey, model: entry.model, sessionOnly: false, updatedAt: entry.updatedAt });
      unlocked++;
    } catch {
      anyFailed = true;
    }
  }

  return { success: !anyFailed, unlocked };
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  google: "gemini-2.0-flash",
  elevenlabs: "eleven_monolingual_v1",
};
