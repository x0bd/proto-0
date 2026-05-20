export const CHAT_PROVIDER_IDS = ["openai", "google", "anthropic"] as const;
export const PROVIDER_IDS = [...CHAT_PROVIDER_IDS, "elevenlabs"] as const;

export type ChatProvider = (typeof CHAT_PROVIDER_IDS)[number];
export type Provider = (typeof PROVIDER_IDS)[number];

export interface ModelOption {
  id: string;
  label: string;
}

export const CHAT_MODELS: Record<ChatProvider, ModelOption[]> = {
  openai: [
    { id: "gpt-5.5", label: "5.5" },
    { id: "gpt-5.4", label: "5.4" },
    { id: "gpt-5.4-mini", label: "5.4-MINI" },
    { id: "gpt-5.4-nano", label: "5.4-NANO" },
  ],
  google: [
    { id: "gemini-3.5-flash", label: "3.5-FLASH" },
    { id: "gemini-3.1-flash-lite", label: "3.1-LITE" },
    { id: "gemini-3-flash-preview", label: "3-FLASH" },
    { id: "gemini-2.5-flash", label: "2.5-FLASH" },
  ],
  anthropic: [
    { id: "claude-sonnet-4-6", label: "SONNET-4.6" },
    { id: "claude-opus-4-7", label: "OPUS-4.7" },
    { id: "claude-opus-4-6", label: "OPUS-4.6" },
    { id: "claude-haiku-4-5", label: "HAIKU-4.5" },
    { id: "claude-sonnet-4-5", label: "SONNET-4.5" },
  ],
};

export const ELEVENLABS_TTS_MODELS: ModelOption[] = [
  { id: "eleven_flash_v2_5", label: "FLASH-2.5" },
  { id: "eleven_multilingual_v2", label: "MULTI-2" },
  { id: "eleven_v3", label: "V3" },
  { id: "eleven_flash_v2", label: "FLASH-2" },
];

export const SUPPORTED_CHAT_MODELS: Record<ChatProvider, string[]> = {
  openai: CHAT_MODELS.openai.map((model) => model.id),
  google: CHAT_MODELS.google.map((model) => model.id),
  anthropic: CHAT_MODELS.anthropic.map((model) => model.id),
};

export const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-5.5",
  google: "gemini-3.5-flash",
  anthropic: "claude-sonnet-4-6",
  elevenlabs: "eleven_flash_v2_5",
};

export function isChatProvider(provider: unknown): provider is ChatProvider {
  return CHAT_PROVIDER_IDS.includes(provider as ChatProvider);
}

export function resolveChatModel(provider: ChatProvider, model?: string): string {
  return model && SUPPORTED_CHAT_MODELS[provider].includes(model)
    ? model
    : DEFAULT_MODELS[provider];
}
