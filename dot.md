# DOT — AI Companion Interface

**Live:** [dot-0.vercel.app](https://dot-0.vercel.app) · **Stack:** Next.js 14, TypeScript, Vercel AI SDK, Web Audio API, ElevenLabs, OpenAI, Google Gemini

---

## Overview

DOT is a fully client-rendered AI companion built on Next.js 14 App Router. It implements a complete real-time voice conversation loop — from microphone input through AI inference to synthesized speech — entirely in the browser, with no backend state. The project explores what a personal AI interface looks and feels like when the user owns their own keys, their own memory, and their own model choices.

---

## AI Architecture

### Multi-Provider Streaming Chat

The `/api/chat` route uses the **Vercel AI SDK** (`streamText`) to proxy requests to either **OpenAI** (GPT-4o, GPT-4o-mini) or **Google Gemini** (2.0 Flash, 1.5 Flash, 1.5 Pro) with a unified interface. Responses stream token-by-token to the client via `toTextStreamResponse()`. The route validates providers and models against an allowlist, normalises upstream errors (401, 429, 404) into structured error payloads with user-actionable recovery hints, and enforces a rolling 8-message context window.

```
POST /api/chat
  → validateProvider / validateModel
  → buildSystemPrompt(persona, memoryContext, personaTuning)
  → streamText({ model, system, messages, temperature: 0.7 })
  → ReadableStream → client
```

### Dynamic System Prompt Construction

Each chat request assembles a system prompt at runtime from three layers:

1. **Base character** — DOT's core voice (warm, poetic, concise: max 2–3 sentences)
2. **Persona tone** — one of four switchable personalities: Coach (momentum-driven), Playful (light and charming), Deep Thinker (reflective, meaning-focused), Focus Buddy (minimal, low-friction)
3. **Persona tuning** — two continuous sliders (`expressiveness` 0–100, `directness` 0–100) translate to discrete adjectives injected into the prompt ("animated and vivid" / "direct and action-oriented"), giving the user fine-grained control over response style without prompt engineering knowledge
4. **Memory context** — the 8 most recent memory entries are appended with the instruction to weave them in naturally, enabling personalised responses that reference past context without the AI ever saying "I remember" unprompted

### Voice Conversation Pipeline

A full duplex voice loop implemented in `useVoiceConversation`:

```
Web Speech API (STT)
  → interim transcripts shown live
  → final transcript fires on isFinal
  → POST /api/chat (streaming, abortable)
  → full response text collected
  → POST /api/tts (ElevenLabs streaming, optimize_streaming_latency=2)
  → AudioContext.decodeAudioData()
  → BufferSourceNode → AnalyserNode → destination
  → requestAnimationFrame loop reads FFT data at 60fps
```

Any active phase (listening / thinking / speaking) can be interrupted with a single tap — `AbortController` cancels the in-flight fetch, `BufferSourceNode.stop()` halts playback, and `SpeechRecognition.stop()` terminates capture. A browser `SpeechSynthesis` fallback activates automatically when no ElevenLabs key is present.

### Real-Time Audio Analysis

`useAudioAnalysis` implements a 5-band FFT decomposition using the **Web Audio API**:

| Band | Range | Use |
|------|-------|-----|
| Bass | 60–250 Hz | Avatar container breathing/scale |
| Low Mid | 250–500 Hz | Mouth opening (primary driver) |
| Mid | 500–2000 Hz | Mouth width variation |
| High Mid | 2000–4000 Hz | Eye subtle pulse |
| Presence | 4000–8000 Hz | Micro glances / blinks |

The analyser runs at 256-point FFT with a 0.6 smoothing constant. Frequency data is read into a pre-allocated `Uint8Array` buffer each frame to avoid garbage collection pressure in the animation loop.

### Persistent Memory System

Users accumulate a personal memory store across sessions (`dot_memory_core` in localStorage). Every voice transcript and ritual check-in writes a timestamped memory entry with source tagging (`voice`, `ritual`, `chat`). On each AI request, the 8 most recent memories are serialised and injected into the system prompt. The memory system respects a global enable/disable toggle — when off, no memories are written or read.

### BYOK Key Vault with Client-Side Encryption

`lib/key-store.ts` implements a three-tier key storage model:

- **Session-only** — stored in `sessionStorage`, cleared on tab close
- **Plain** — backward-compatible `localStorage` (default)
- **Encrypted vault** — AES-GCM 256-bit encryption via `crypto.subtle`, with keys derived using **PBKDF2** (SHA-256, 200,000 iterations, random 128-bit salt per key). Keys are decrypted on unlock and cached in memory for 15 minutes before re-locking.

Keys are forwarded to API routes via the `x-dot-api-key` request header and never logged or persisted server-side. The app supports three providers: **OpenAI**, **Google Gemini**, and **ElevenLabs** — all user-supplied.

### ElevenLabs TTS with Streaming Latency Optimisation

The `/api/tts` route proxies to ElevenLabs' streaming endpoint with `optimize_streaming_latency=2`, returning an `audio/mpeg` stream directly. Voice settings (stability, similarity boost, style, speed, speaker boost) are validated and normalised server-side before forwarding. The route accepts API keys via header or body, falling back to the environment variable for server-managed deployments.

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, React Server Components) |
| Language | TypeScript (strict) |
| AI Inference | Vercel AI SDK — `@ai-sdk/openai`, `@ai-sdk/google` |
| Voice Synthesis | ElevenLabs v1 streaming API |
| Speech Recognition | Web Speech API (browser-native) |
| Audio Analysis | Web Audio API — `AnalyserNode`, `AudioContext`, `BufferSourceNode` |
| Encryption | Web Crypto API — AES-GCM / PBKDF2 |
| Animation | Framer Motion (draggable panels, state transitions) |
| Styling | Tailwind CSS v4 (custom hardware design system) |
| Deployment | Vercel (Edge-compatible API routes) |

---

## What This Demonstrates

- **AI API integration at depth** — not just calling OpenAI but building a provider-agnostic inference layer with streaming, error normalisation, and model validation
- **Real-time voice pipeline engineering** — chaining STT → LLM → TTS → Web Audio with interrupt handling and graceful fallbacks
- **System prompt engineering** — dynamic prompt construction from user state (persona, memory, tuning sliders) to control model behaviour at runtime
- **Security-conscious BYOK design** — client-side AES-GCM encryption so user API keys are never exposed to the server in plaintext
- **Signal processing in the browser** — FFT-based audio analysis driving real-time UI reactivity at 60fps
- **Production-grade error handling** — structured error taxonomy across providers, propagated to UI with recovery actions
