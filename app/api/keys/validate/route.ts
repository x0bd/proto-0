import { NextResponse } from "next/server";

type Provider = "openai" | "google" | "elevenlabs";

interface ValidateRequestBody {
  provider?: Provider;
  model?: string;
}

interface ProviderCheckResult {
  label: string;
  detail?: string;
}

const PROVIDERS = new Set<Provider>(["openai", "google", "elevenlabs"]);

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
    case "elevenlabs":
      return validateElevenLabs(apiKey);
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

async function validateElevenLabs(apiKey: string): Promise<ProviderCheckResult> {
  const response = await fetch("https://api.elevenlabs.io/v1/user", {
    headers: { "xi-api-key": apiKey },
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    throw new Error(readProviderError(payload, "ElevenLabs rejected key"));
  }

  const tier =
    payload.subscription && typeof payload.subscription === "object"
      ? (payload.subscription as { tier?: unknown }).tier
      : undefined;

  return {
    label: "ELEVEN_OK",
    detail: typeof tier === "string" ? tier : undefined,
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
