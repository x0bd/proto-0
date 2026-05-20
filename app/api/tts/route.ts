
import { NextResponse } from 'next/server';
import { DEFAULT_MODELS, ELEVENLABS_TTS_MODELS } from "@/lib/ai-models";

type ElevenLabsVoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
  use_speaker_boost: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: unknown, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeVoiceSettings(value: unknown): ElevenLabsVoiceSettings {
  const input =
    value && typeof value === "object"
      ? (value as Partial<ElevenLabsVoiceSettings>)
      : {};

  return {
    stability: clamp(toNumber(input.stability, 0.5), 0, 1),
    similarity_boost: clamp(toNumber(input.similarity_boost, 0.75), 0, 1),
    style: clamp(toNumber(input.style, 0), 0, 1),
    speed: clamp(toNumber(input.speed, 1), 0.7, 1.2),
    use_speaker_boost:
      typeof input.use_speaker_boost === "boolean"
        ? input.use_speaker_boost
        : true,
  };
}

function normalizeModelId(value: unknown) {
  const modelId = typeof value === "string" ? value.trim() : "";
  return ELEVENLABS_TTS_MODELS.some((model) => model.id === modelId)
    ? modelId
    : DEFAULT_MODELS.elevenlabs;
}

async function readElevenLabsError(response: Response) {
  const text = await response.text().catch(() => "");
  if (!text) return "ElevenLabs request failed";

  try {
    const payload = JSON.parse(text) as {
      detail?: { message?: unknown } | string;
      message?: unknown;
      error?: unknown;
    };
    if (typeof payload.detail === "string") return payload.detail;
    if (
      payload.detail &&
      typeof payload.detail === "object" &&
      typeof payload.detail.message === "string"
    ) {
      return payload.detail.message;
    }
    if (typeof payload.message === "string") return payload.message;
    if (typeof payload.error === "string") return payload.error;
  } catch {
    /* fall through */
  }

  return text.slice(0, 400);
}

export async function POST(req: Request) {
  try {
    const {
      text,
      voiceId = "21m00Tcm4TlvDq8ikWAM",
      apiKey: bodyApiKey,
      voiceSettings,
      modelId,
    } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey =
      req.headers.get("x-dot-api-key") ||
      bodyApiKey ||
      process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No ElevenLabs key. Add one in Settings → KEYS or set ELEVENLABS_API_KEY.' },
        { status: 400 },
      );
    }

    const selectedModel = normalizeModelId(modelId);
    const url = new URL(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
    );
    url.searchParams.set("output_format", "mp3_44100_128");

    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: selectedModel,
          voice_settings: normalizeVoiceSettings(voiceSettings),
        }),
      }
    );

    if (!response.ok) {
        const errorText = await readElevenLabsError(response);
        return NextResponse.json(
          { error: `ElevenLabs API Error: ${errorText}` },
          { status: response.status },
        );
    }

    // Return the audio stream directly
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get("content-type") || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
