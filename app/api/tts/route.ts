
import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
  try {
    const {
      text,
      voiceId = "21m00Tcm4TlvDq8ikWAM",
      apiKey: bodyApiKey,
      voiceSettings,
      modelId = "eleven_monolingual_v1",
    } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = bodyApiKey || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No ElevenLabs key. Add one in Settings → KEYS or set ELEVENLABS_API_KEY.' },
        { status: 400 },
      );
    }

    // Call ElevenLabs API
    // stream=true for lower latency
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=2`, 
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: normalizeVoiceSettings(voiceSettings),
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: `ElevenLabs API Error: ${errorText}` }, { status: response.status });
    }

    // Return the audio stream directly
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
