
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM", apiKey: bodyApiKey } = await req.json();

    if (!text) {
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
          model_id: "eleven_monolingual_v1", // Low latency model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
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
