"use client";

import * as React from "react";
import type { EmotionState } from "@/app/components/face/types";
import type { VoiceProfileId, VoiceSettings } from "@/hooks/useVoiceSettings";
import { normalizeVoiceSettings } from "@/hooks/useVoiceSettings";

export type PersonaVoiceMood = "matched" | "softened";

export interface PersonaTuningSettings {
	expressiveness: number;
	directness: number;
	autoVoice: boolean;
	voiceMood: PersonaVoiceMood;
}

export const DEFAULT_PERSONA_TUNING: PersonaTuningSettings = {
	expressiveness: 72,
	directness: 54,
	autoVoice: true,
	voiceMood: "matched",
};

const STORAGE_KEY = "dot_persona_tuning";
const CHANGE_EVENT = "dot:persona-tuning";

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function toFiniteNumber(value: unknown, fallback: number) {
	const numeric = typeof value === "number" ? value : Number(value);
	return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp01(value: number) {
	return clamp(value, 0, 1);
}

function isVoiceMood(value: unknown): value is PersonaVoiceMood {
	return value === "matched" || value === "softened";
}

export function normalizePersonaTuning(value: unknown): PersonaTuningSettings {
	const input =
		value && typeof value === "object"
			? (value as Partial<PersonaTuningSettings>)
			: {};

	return {
		expressiveness: clamp(
			toFiniteNumber(input.expressiveness, DEFAULT_PERSONA_TUNING.expressiveness),
			0,
			100,
		),
		directness: clamp(
			toFiniteNumber(input.directness, DEFAULT_PERSONA_TUNING.directness),
			0,
			100,
		),
		autoVoice:
			typeof input.autoVoice === "boolean"
				? input.autoVoice
				: DEFAULT_PERSONA_TUNING.autoVoice,
		voiceMood: isVoiceMood(input.voiceMood)
			? input.voiceMood
			: DEFAULT_PERSONA_TUNING.voiceMood,
	};
}

export function loadPersonaTuning(): PersonaTuningSettings {
	if (typeof window === "undefined") return DEFAULT_PERSONA_TUNING;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		return normalizePersonaTuning(raw ? JSON.parse(raw) : null);
	} catch {
		return DEFAULT_PERSONA_TUNING;
	}
}

export function savePersonaTuning(settings: PersonaTuningSettings): void {
	if (typeof window === "undefined") return;
	const normalized = normalizePersonaTuning(settings);
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
	window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: normalized }));
}

export function usePersonaSettings() {
	const [settings, setSettingsState] =
		React.useState<PersonaTuningSettings>(() => loadPersonaTuning());

	React.useEffect(() => {
		const syncSettings = () => setSettingsState(loadPersonaTuning());
		const syncFromEvent = (event: Event) => {
			const customEvent = event as CustomEvent<PersonaTuningSettings>;
			setSettingsState(normalizePersonaTuning(customEvent.detail));
		};

		window.addEventListener("storage", syncSettings);
		window.addEventListener(CHANGE_EVENT, syncFromEvent);
		return () => {
			window.removeEventListener("storage", syncSettings);
			window.removeEventListener(CHANGE_EVENT, syncFromEvent);
		};
	}, []);

	const setSettings = React.useCallback((next: PersonaTuningSettings) => {
		const normalized = normalizePersonaTuning(next);
		setSettingsState(normalized);
		savePersonaTuning(normalized);
	}, []);

	const updateSettings = React.useCallback(
		(patch: Partial<PersonaTuningSettings>) => {
			setSettings({ ...settings, ...patch });
		},
		[settings, setSettings],
	);

	return {
		settings,
		setSettings,
		updateSettings,
		resetSettings: () => setSettings(DEFAULT_PERSONA_TUNING),
	};
}

export function resolvePersonaVoiceSettings(
	personaId: string,
	baseSettings: VoiceSettings,
	tuning?: PersonaTuningSettings,
): VoiceSettings {
	const base = normalizeVoiceSettings(baseSettings);
	const normalized = normalizePersonaTuning(tuning);
	if (!normalized.autoVoice) return base;

	const matchedProfiles: Record<string, VoiceProfileId> = {
		coach: "guide",
		playful: "companion",
		"deep-thinker": "late-night",
		"focus-buddy": "guide",
	};
	const softenedProfiles: Record<string, VoiceProfileId> = {
		coach: "companion",
		playful: "companion",
		"deep-thinker": "late-night",
		"focus-buddy": "late-night",
	};

	const express = normalized.expressiveness / 100;
	const direct = normalized.directness / 100;
	const softened = normalized.voiceMood === "softened";
	const profileMap = softened ? softenedProfiles : matchedProfiles;

	return {
		...base,
		profile: profileMap[personaId] ?? base.profile,
		speed: clamp(46 + direct * 34 + express * 8 - (softened ? 12 : 0), 0, 100),
		warmth: clamp(52 + express * 34 - direct * 8 + (softened ? 12 : 0), 0, 100),
		clarity: clamp(
			50 + direct * 36 + (personaId === "focus-buddy" ? 8 : 0),
			0,
			100,
		),
	};
}

export function getPersonaAvatarBias(
	personaId: string,
	tuning?: PersonaTuningSettings,
): EmotionState {
	const normalized = normalizePersonaTuning(tuning);
	const express = normalized.expressiveness / 100;
	const direct = normalized.directness / 100;
	const scale = 0.55 + express * 0.75;

	const base: Record<string, EmotionState> = {
		coach: {
			joy: 0.1,
			sadness: 0,
			surprise: 0.04,
			anger: 0.03 + direct * 0.06,
			curiosity: 0.1,
		},
		playful: {
			joy: 0.18,
			sadness: 0,
			surprise: 0.08,
			anger: 0,
			curiosity: 0.12,
		},
		"deep-thinker": {
			joy: 0.04,
			sadness: 0.02,
			surprise: 0.02,
			anger: 0,
			curiosity: 0.2,
		},
		"focus-buddy": {
			joy: 0.06,
			sadness: 0,
			surprise: 0.01,
			anger: 0,
			curiosity: 0.08 + direct * 0.04,
		},
	};
	const selected = base[personaId] ?? base.coach;

	return {
		joy: clamp01(selected.joy * scale),
		sadness: clamp01(selected.sadness * scale),
		surprise: clamp01(selected.surprise * scale),
		anger: clamp01(selected.anger * scale),
		curiosity: clamp01(selected.curiosity * scale),
	};
}

export function buildPersonaTuningInstructions(
	tuning?: PersonaTuningSettings,
): string {
	const normalized = normalizePersonaTuning(tuning);
	const expressive =
		normalized.expressiveness >= 70
			? "animated and vivid"
			: normalized.expressiveness <= 35
				? "restrained and quiet"
				: "balanced and natural";
	const direct =
		normalized.directness >= 70
			? "direct, concise, and action-oriented"
			: normalized.directness <= 35
				? "gentle, exploratory, and spacious"
				: "clear without rushing the user";

	return `Persona tuning: be ${expressive}; be ${direct}. Keep the reply shaped by those two dials while staying warm and brief.`;
}
