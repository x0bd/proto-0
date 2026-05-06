"use client";

import * as React from "react";

export type VoiceProfileId = "companion" | "guide" | "late-night";

export interface VoiceSettings {
  profile: VoiceProfileId;
  speed: number;
  warmth: number;
  clarity: number;
  autoSpeak: boolean;
  interruptible: boolean;
}

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
  use_speaker_boost: boolean;
}

export const VOICE_PROFILES: {
  id: VoiceProfileId;
  label: string;
  short: string;
  voiceId: string;
  voiceLabel: string;
}[] = [
  {
    id: "companion",
    label: "CMPNN",
    short: "C-01",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    voiceLabel: "RACHEL",
  },
  {
    id: "guide",
    label: "GUIDE",
    short: "G-02",
    voiceId: "ErXwobaYiN019PkySvjV",
    voiceLabel: "ANTONI",
  },
  {
    id: "late-night",
    label: "NIGHT",
    short: "N-03",
    voiceId: "TxGEqnHWrfWFTfGW9XjX",
    voiceLabel: "JOSH",
  },
];

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  profile: "companion",
  speed: 58,
  warmth: 72,
  clarity: 64,
  autoSpeak: true,
  interruptible: true,
};

const STORAGE_KEY = "dot_voice_settings";
const CHANGE_EVENT = "dot:voice-settings";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toFiniteNumber(value: unknown, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function isVoiceProfileId(value: unknown): value is VoiceProfileId {
  return (
    value === "companion" ||
    value === "guide" ||
    value === "late-night"
  );
}

export function normalizeVoiceSettings(value: unknown): VoiceSettings {
  const input =
    value && typeof value === "object"
      ? (value as Partial<VoiceSettings>)
      : {};

  return {
    profile: isVoiceProfileId(input.profile)
      ? input.profile
      : DEFAULT_VOICE_SETTINGS.profile,
    speed: clamp(toFiniteNumber(input.speed, DEFAULT_VOICE_SETTINGS.speed), 0, 100),
    warmth: clamp(
      toFiniteNumber(input.warmth, DEFAULT_VOICE_SETTINGS.warmth),
      0,
      100,
    ),
    clarity: clamp(
      toFiniteNumber(input.clarity, DEFAULT_VOICE_SETTINGS.clarity),
      0,
      100,
    ),
    autoSpeak:
      typeof input.autoSpeak === "boolean"
        ? input.autoSpeak
        : DEFAULT_VOICE_SETTINGS.autoSpeak,
    interruptible:
      typeof input.interruptible === "boolean"
        ? input.interruptible
        : DEFAULT_VOICE_SETTINGS.interruptible,
  };
}

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") return DEFAULT_VOICE_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return normalizeVoiceSettings(raw ? JSON.parse(raw) : null);
  } catch {
    return DEFAULT_VOICE_SETTINGS;
  }
}

export function saveVoiceSettings(settings: VoiceSettings): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeVoiceSettings(settings);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: normalized }));
}

export function toElevenLabsVoiceSettings(
  settings: VoiceSettings,
): ElevenLabsVoiceSettings {
  const normalized = normalizeVoiceSettings(settings);
  const warmth = normalized.warmth / 100;
  const clarity = normalized.clarity / 100;

  const profileAdjustments: Record<
    VoiceProfileId,
    { stability: number; style: number; speed: number }
  > = {
    companion: { stability: 0, style: 0.04, speed: 0 },
    guide: { stability: 0.14, style: -0.04, speed: 0.03 },
    "late-night": { stability: 0.08, style: 0.12, speed: -0.09 },
  };
  const profile = profileAdjustments[normalized.profile];

  return {
    stability: clamp(0.7 - warmth * 0.35 + profile.stability, 0, 1),
    similarity_boost: clamp(0.45 + clarity * 0.5, 0, 1),
    style: clamp(warmth * 0.35 + profile.style, 0, 1),
    speed: clamp(0.7 + (normalized.speed / 100) * 0.5 + profile.speed, 0.7, 1.2),
    use_speaker_boost: clarity >= 45,
  };
}

export function getElevenLabsVoiceId(settings: VoiceSettings): string {
  const normalized = normalizeVoiceSettings(settings);
  return (
    VOICE_PROFILES.find((profile) => profile.id === normalized.profile)
      ?.voiceId ?? VOICE_PROFILES[0].voiceId
  );
}

export function useVoiceSettings() {
  const [settings, setSettingsState] = React.useState<VoiceSettings>(() =>
    loadVoiceSettings(),
  );

  React.useEffect(() => {
    const syncSettings = () => setSettingsState(loadVoiceSettings());
    const syncFromEvent = (event: Event) => {
      const customEvent = event as CustomEvent<VoiceSettings>;
      setSettingsState(normalizeVoiceSettings(customEvent.detail));
    };

    window.addEventListener("storage", syncSettings);
    window.addEventListener(CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener(CHANGE_EVENT, syncFromEvent);
    };
  }, []);

  const setSettings = React.useCallback((next: VoiceSettings) => {
    const normalized = normalizeVoiceSettings(next);
    setSettingsState(normalized);
    saveVoiceSettings(normalized);
  }, []);

  const updateSettings = React.useCallback(
    (patch: Partial<VoiceSettings>) => {
      setSettings({ ...settings, ...patch });
    },
    [settings, setSettings],
  );

  const resetSettings = React.useCallback(() => {
    setSettings(DEFAULT_VOICE_SETTINGS);
  }, [setSettings]);

  return {
    settings,
    setSettings,
    updateSettings,
    resetSettings,
    elevenLabsSettings: toElevenLabsVoiceSettings(settings),
    voiceId: getElevenLabsVoiceId(settings),
  };
}
