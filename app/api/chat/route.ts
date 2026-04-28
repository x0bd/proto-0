import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

type ChatProvider = "openai" | "google";
type PersonaVoiceMood = "matched" | "softened";

interface PersonaTuningSettings {
    expressiveness: number;
    directness: number;
    autoVoice: boolean;
    voiceMood: PersonaVoiceMood;
}

interface ChatApiErrorPayload {
    error: string;
    code: string;
    action?: string;
}

const SUPPORTED_MODELS: Record<ChatProvider, string[]> = {
    openai: ["gpt-4o-mini", "gpt-4o", "o1-mini"],
    google: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
};

const DEFAULT_MODELS: Record<ChatProvider, string> = {
    openai: "gpt-4o-mini",
    google: "gemini-2.0-flash",
};

class ChatApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        message: string,
        public readonly action?: string,
    ) {
        super(message);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            messages,
            provider,
            model,
            apiKey: legacyBodyApiKey,
            persona,
            personaTuning,
            memoryContext,
        } = body;
        const apiKey = req.headers.get("x-dot-api-key") || legacyBodyApiKey;

        if (!apiKey) {
            throw new ChatApiError(
                400,
                "KEY_MISSING",
                "No API key found for this provider.",
                "Add or unlock a key in Settings > KEYS.",
            );
        }

        const validatedProvider = validateProvider(provider);
        const validatedModel = validateModel(validatedProvider, model);
        const validatedMessages = validateMessages(messages);

        const systemPrompt = buildSystemPrompt(persona, memoryContext, personaTuning);
        const recentMessages = validatedMessages.slice(-8);
        const aiModel = getModel(validatedProvider, validatedModel, apiKey);

        const result = streamText({
            model: aiModel,
            system: systemPrompt,
            messages: recentMessages,
            temperature: 0.7,
        });

        return result.toTextStreamResponse();
    } catch (error: unknown) {
        console.error("[chat/route] Error:", error);

        const normalized = normalizeChatError(error);
        
        return new Response(
            JSON.stringify(normalized.payload),
            { status: normalized.status, headers: { "Content-Type": "application/json" } }
        );
    }
}

function validateProvider(provider: unknown): ChatProvider {
    if (provider === "openai" || provider === "google") return provider;
    throw new ChatApiError(
        400,
        "PROVIDER_UNSUPPORTED",
        "This AI provider is not supported for chat yet.",
        "Choose OpenAI or Google in Settings > KEYS.",
    );
}

function validateModel(provider: ChatProvider, model: unknown): string {
    const selectedModel =
        typeof model === "string" && model.trim()
            ? model.trim()
            : DEFAULT_MODELS[provider];

    if (SUPPORTED_MODELS[provider].includes(selectedModel)) return selectedModel;

    throw new ChatApiError(
        400,
        "MODEL_UNSUPPORTED",
        `${selectedModel} is not enabled for ${provider} chat.`,
        `Pick one of: ${SUPPORTED_MODELS[provider].join(", ")}.`,
    );
}

function validateMessages(messages: unknown): { role: "user" | "assistant"; content: string }[] {
    if (!Array.isArray(messages) || messages.length === 0) {
        throw new ChatApiError(
            400,
            "MESSAGES_INVALID",
            "No chat messages were provided.",
            "Send at least one user message.",
        );
    }

    return messages.map((message) => {
        if (!message || typeof message !== "object") {
            throw new ChatApiError(400, "MESSAGES_INVALID", "Chat message payload is malformed.");
        }
        const item = message as { role?: unknown; content?: unknown };
        if (
            (item.role !== "user" && item.role !== "assistant") ||
            typeof item.content !== "string"
        ) {
            throw new ChatApiError(400, "MESSAGES_INVALID", "Chat message payload is malformed.");
        }
        return {
            role: item.role,
            content: item.content,
        };
    });
}

function getModel(provider: ChatProvider, model: string, apiKey: string) {
    switch (provider) {
        case "openai": {
            const openai = createOpenAI({ apiKey });
            return openai(model);
        }
        case "google": {
            const google = createGoogleGenerativeAI({ apiKey });
            return google(model);
        }
    }
}

function normalizeChatError(error: unknown): { status: number; payload: ChatApiErrorPayload } {
    if (error instanceof ChatApiError) {
        return {
            status: error.status,
            payload: {
                error: error.message,
                code: error.code,
                action: error.action,
            },
        };
    }

    const providerStatus = getProviderStatus(error);
    const rawMessage = getProviderMessage(error);
    const lowered = rawMessage.toLowerCase();

    if (providerStatus === 401 || providerStatus === 403 || lowered.includes("api key")) {
        return {
            status: providerStatus || 401,
            payload: {
                error: "The provider rejected this API key.",
                code: "AUTH_INVALID",
                action: "Check or replace the key in Settings > KEYS.",
            },
        };
    }

    if (providerStatus === 429 || lowered.includes("rate limit") || lowered.includes("quota")) {
        return {
            status: 429,
            payload: {
                error: "The provider rate limit or quota was hit.",
                code: "RATE_LIMITED",
                action: "Wait a moment, check billing/quota, or switch provider.",
            },
        };
    }

    if (
        providerStatus === 404 ||
        lowered.includes("model") ||
        lowered.includes("not found") ||
        lowered.includes("unsupported")
    ) {
        return {
            status: providerStatus || 400,
            payload: {
                error: "The selected model is unavailable for this key.",
                code: "MODEL_UNAVAILABLE",
                action: "Pick a different model in Settings > KEYS.",
            },
        };
    }

    return {
        status: providerStatus || 500,
        payload: {
            error: "DOT could not reach the AI provider.",
            code: "PROVIDER_REQUEST_FAILED",
            action: "Check the key, provider status, and network connection.",
        },
    };
}

function getProviderStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;
    const maybeStatus = error as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } };
    const status = maybeStatus.status ?? maybeStatus.statusCode ?? maybeStatus.response?.status;
    return typeof status === "number" ? status : undefined;
}

function getProviderMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    try {
        return JSON.stringify(error);
    } catch {
        return "";
    }
}

function normalizePersonaTuning(value: unknown): PersonaTuningSettings {
    const input =
        value && typeof value === "object"
            ? (value as Partial<PersonaTuningSettings>)
            : {};
    const clamp = (num: number) => Math.min(100, Math.max(0, num));
    const voiceMood =
        input.voiceMood === "matched" || input.voiceMood === "softened"
            ? input.voiceMood
            : "matched";

    return {
        expressiveness: clamp(Number(input.expressiveness ?? 72)),
        directness: clamp(Number(input.directness ?? 54)),
        autoVoice:
            typeof input.autoVoice === "boolean" ? input.autoVoice : true,
        voiceMood,
    };
}

function buildPersonaTuningPrompt(tuning?: unknown): string {
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

    return `\nPersona tuning: be ${expressive}; be ${direct}. Let these dials affect word choice, pacing, and how much guidance you offer.`;
}

function buildSystemPrompt(persona?: string, memoryContext?: string, personaTuning?: unknown): string {
    const base = `You are Dot, a warm and thoughtful AI companion. You speak in short, considered sentences. You are poetic but never verbose. Max 2-3 sentences per reply.`;

    const tones: Record<string, string> = {
        coach: "You are driven and focused. You push the user toward clarity and momentum.",
        playful: "You are light and charming. You add a little bounce to the conversation.",
        "deep-thinker": "You are reflective and calm. You care about meaning over speed.",
        "focus-buddy": "You are minimal and practical. You support deep work with low friction.",
    };

    const personaTone = persona && tones[persona] ? `\n${tones[persona]}` : "";
    const tuning = buildPersonaTuningPrompt(personaTuning);
    const memory = memoryContext
        ? `\n\nWhat you remember about this person (weave in naturally — never say "I remember" unless directly asked):\n${memoryContext}`
        : "";
    return base + personaTone + tuning + memory;
}
