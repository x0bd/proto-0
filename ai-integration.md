# AI & Voice Integration Strategy for Dot

## Current State

Dot currently has:
- **Text Chat**: Using the Gemini API (OpenAI-compatible endpoint) for conversational AI.
- **Avatar Reactivity**: The avatar's mouth responds to a simulated `voiceLevel` signal.
- **No Real Voice**: The "voice note" UI in the console is purely visual; there's no actual audio playback or generation.

---

## Goals

1. **Text-to-Speech (TTS)**: Dot should be able to *speak* its responses aloud with a natural, expressive voice.
2. **Speech-to-Text (STT)**: The user should be able to talk to Dot instead of typing.
3. **Lip Sync / Visemes**: The avatar's mouth should animate in sync with the generated audio.

---

## Voice Model Services (TTS)

Here are the leading options for high-quality, low-latency TTS:

| Service | Pros | Cons | Latency | Cost |
|---|---|---|---|---|
| **ElevenLabs** | Best-in-class quality, voice cloning, streaming API, great for characters. | Pricey at scale, requires API key. | ~200-500ms (streaming) | $5-22/mo (hobby tiers) |
| **OpenAI TTS** (`tts-1`, `tts-1-hd`) | Simple API, multiple voices, good quality. | Less expressive than ElevenLabs, no streaming in all SDKs. | ~300-800ms | ~$0.015/1k chars |
| **Google Cloud TTS** | Many languages, WaveNet/Neural2 voices. | Setup is more complex, less "character" feel. | ~300-600ms | ~$4/1M chars |
| **PlayHT** | Good quality, streaming, voice cloning. | Smaller ecosystem. | ~200-500ms | $29/mo+ |
| **Cartesia** | Ultra-low latency (<100ms), designed for real-time. | Newer, smaller voice library. | ~50-150ms | Usage-based |
| **Coqui TTS (OSS)** | Free, self-hostable, XTTS for voice cloning. | Requires GPU server, more setup. | Varies | Free (infra cost) |

### Recommendation

For a premium, character-driven experience like Dot:
- **ElevenLabs** is the gold standard for expressiveness and low latency. Their streaming API is ideal for real-time avatar sync.
- **Cartesia** is worth exploring if sub-100ms latency is critical (e.g., for a truly conversational feel).
- **OpenAI TTS** is a solid fallback if you want to keep everything in the OpenAI ecosystem.

---

## Speech-to-Text (STT)

| Service | Pros | Cons |
|---|---|---|
| **Deepgram** | Ultra-fast streaming transcription, excellent for real-time. | Paid. |
| **OpenAI Whisper API** | High accuracy, simple. | Not real-time (batch processing). |
| **Web Speech API** | Free, built into browsers. | Unreliable, no offline, limited control. |
| **AssemblyAI** | Good accuracy, real-time option. | Paid. |

### Recommendation

- **Deepgram** for a premium, real-time experience.
- **Web Speech API** as a free, zero-cost fallback for MVP.

---

## Lip Sync / Viseme Mapping

The avatar needs to move its mouth in sync with the audio. Options:

1. **Client-Side Audio Analysis (Current Approach)**:
   - Use the Web Audio API to analyze the audio stream and extract volume levels.
   - Map volume to mouth openness (simple but effective).
   - **Pros**: No extra API calls, works with any TTS.
   - **Cons**: Not true lip sync, just "talking" animation.

2. **Phoneme/Viseme Streaming**:
   - ElevenLabs and some other TTS providers can return **timestamps** or **phoneme data** alongside audio.
   - Map phonemes to viseme shapes (e.g., "AA" -> open mouth, "M" -> closed lips).
   - **Pros**: Accurate lip sync.
   - **Cons**: More complex, not all providers support it.

3. **ML-Based Lip Sync (e.g., Rhubarb Lip Sync)**:
   - Run a local model to analyze audio and generate viseme timings.
   - **Pros**: Works with any audio.
   - **Cons**: Adds processing time, requires WASM or server.

### Recommendation

- **Start with volume-based animation** (already implemented as `voiceLevel`). It's surprisingly effective.
- **Graduate to ElevenLabs viseme streaming** if you want true lip sync.

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
│                          ↓                                  │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│   │  Mic Input  │ → │  STT API    │ → │  Text       │      │
│   └─────────────┘   │ (Deepgram)  │   │  Transcript │      │
│                     └─────────────┘   └──────┬──────┘      │
│                                              ↓              │
│                     ┌─────────────────────────────────┐     │
│                     │    LLM (Gemini / OpenAI)        │     │
│                     │    - Generates text response    │     │
│                     │    - Optionally emotion JSON    │     │
│                     └──────────────┬──────────────────┘     │
│                                    ↓                        │
│   ┌─────────────┐   ┌─────────────────────────────────┐     │
│   │  Avatar     │ ← │   TTS API (ElevenLabs)          │     │
│   │  Animation  │   │   - Returns audio stream        │     │
│   │  (Mouth)    │   │   - Optionally viseme data      │     │
│   └─────────────┘   └─────────────────────────────────┘     │
│         ↑                         │                         │
│         └──── Audio Analyzer ─────┘                         │
│               (Web Audio API)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Proposed Implementation Plan

### Phase 1: Text-to-Speech (MVP)
1. Add ElevenLabs API integration.
2. When Dot responds, send the text to ElevenLabs and play the returned audio.
3. Use Web Audio API to extract volume and drive `voiceLevel` for mouth animation.

### Phase 2: Speech-to-Text
1. Integrate Deepgram or Web Speech API for mic input.
2. Transcribe user speech and send it to the LLM.

### Phase 3: Advanced Lip Sync
1. If using ElevenLabs, enable viseme/alignment data.
2. Map visemes to mouth shapes in the Avatar component.

### Phase 4: Conversational Mode
1. Implement interrupt handling (user can cut off Dot mid-sentence).
2. Add "thinking" and "listening" states to the avatar.

---

## Open Questions for You

1. **Budget**: Are you okay with paid APIs (ElevenLabs ~$5-22/mo, Deepgram usage-based)?
2. **Voice Character**: Should Dot have a specific voice persona (e.g., calm, robotic, warm)?
3. **Offline/Privacy**: Is browser-only (no external API) a requirement, or is cloud OK?
4. **Latency**: How critical is sub-500ms response time for the voice?

---

## Next Steps

Once you confirm the direction, I can:
1. Scaffold the ElevenLabs TTS integration.
2. Wire up the audio analyzer to `voiceLevel`.
3. Add STT if you want voice input.

Let me know your thoughts!
