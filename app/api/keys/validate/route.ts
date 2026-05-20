import { NextResponse } from "next/server";
import { DEFAULT_MODELS, PROVIDER_IDS, type Provider } from "@/lib/ai-models";

interface ValidateRequestBody {
  provider?: Provider;
  model?: string;
}

interface ProviderCheckResult {
  label: string;
  detail?: string;
}

const PROVIDERS = new Set<Provider>(PROVIDER_IDS);

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-dot-api-key");
    const body = (await req.json()) as ValidateRequestBody;
    const provider = body.provider;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing API key" },
        { status: 400 },
      );
    }

    if (!provider || !PROVIDERS.has(provider)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported provider" },
        { status: 400 },
      );
    }

    const result = await validateProvider(provider, apiKey, body.model);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Key validation failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

async function validateProvider(
  provider: Provider,
  apiKey: string,
  model?: string,
): Promise<ProviderCheckResult> {
  switch (provider) {
    case "openai":
      return validateOpenAI(apiKey, model);
    case "google":
      return validateGoogle(apiKey, model);
    case "anthropic":
      return validateAnthropic(apiKey, model);
    case "elevenlabs":
      return validateElevenLabs(apiKey, model);
  }
}

async function validateOpenAI(
  apiKey: string,
  model?: string,
): Promise<ProviderCheckResult> {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const payload = await parseJson(response);

  if (!response.ok) throw new Error(readProviderError(payload, "OpenAI rejected key"));

  const models = Array.isArray(payload.data) ? payload.data : [];
  const modelFound =
    model && models.some((item) => item && item.id === model);

  return {
    label: modelFound ? "OPENAI_MODEL_OK" : "OPENAI_OK",
    detail: modelFound ? model : `${models.length} models visible`,
  };
}

async function validateGoogle(
  apiKey: string,
  model?: string,
): Promise<ProviderCheckResult> {
  const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);
  const payload = await parseJson(response);

  if (!response.ok) throw new Error(readProviderError(payload, "Google rejected key"));

  const models = Array.isArray(payload.models) ? payload.models : [];
  const normalizedModel = model?.startsWith("models/")
    ? model
    : model
      ? `models/${model}`
      : undefined;
  const modelFound =
    normalizedModel &&
    models.some((item) => item && item.name === normalizedModel);

  return {
    label: modelFound ? "GEMINI_MODEL_OK" : "GEMINI_OK",
    detail: modelFound ? model : `${models.length} models visible`,
  };
}

async function validateAnthropic(
  apiKey: string,
  model?: string,
): Promise<ProviderCheckResult> {
  const response = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    throw new Error(readProviderError(payload, "Anthropic rejected key"));
  }

  const models = Array.isArray(payload.data) ? payload.data : [];
  const modelFound =
    model && models.some((item) => item && item.id === model);

  return {
    label: modelFound ? "CLAUDE_MODEL_OK" : "CLAUDE_OK",
    detail: modelFound ? model : `${models.length} models visible`,
  };
}

async function validateElevenLabs(
  apiKey: string,
  model = DEFAULT_MODELS.elevenlabs,
): Promise<ProviderCheckResult> {
  const userResponse = await fetch("https://api.elevenlabs.io/v1/user", {
    headers: { "xi-api-key": apiKey },
  });
  const userPayload = await parseJson(userResponse);

  if (!userResponse.ok) {
    throw new Error(readProviderError(userPayload, "ElevenLabs rejected key"));
  }

  const tier =
    userPayload.subscription && typeof userPayload.subscription === "object"
      ? (userPayload.subscription as { tier?: unknown }).tier
      : undefined;
  const modelResponse = await fetch("https://api.elevenlabs.io/v1/models", {
    headers: { "xi-api-key": apiKey },
  });
  const modelPayload = (await modelResponse.json().catch(() => [])) as unknown;

  if (!modelResponse.ok) {
    throw new Error(
      readProviderError(
        modelPayload && typeof modelPayload === "object"
          ? (modelPayload as Record<string, unknown>)
          : {},
        "ElevenLabs model check failed",
      ),
    );
  }

  const models = Array.isArray(modelPayload) ? modelPayload : [];
  const selectedModel = models.find(
    (item) =>
      item &&
      typeof item === "object" &&
      (item as { model_id?: unknown }).model_id === model,
  ) as { can_do_text_to_speech?: unknown } | undefined;

  if (model && selectedModel && selectedModel.can_do_text_to_speech === false) {
    throw new Error(`${model} does not support text to speech`);
  }

  return {
    label: selectedModel ? "ELEVEN_MODEL_OK" : "ELEVEN_OK",
    detail: [typeof tier === "string" ? tier : undefined, selectedModel ? model : undefined]
      .filter(Boolean)
      .join(" · ") || undefined,
  };
}

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const payload = (await response.json()) as unknown;
    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function readProviderError(
  payload: Record<string, unknown>,
  fallback: string,
): string {
  const error = payload.error;

  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  const message = payload.message;
  return typeof message === "string" ? message : fallback;
}
