# DOT — Local-First, Multi-Provider AI Companion

**Multi-Model AI Gateway · Real-Time Voice · Privacy-First · Streaming Inference**

> Interview prep for **Cassava.ai** (AI Engineer). DOT is, in miniature, the same
> architectural idea Cassava productizes with **CAIMEx (Cassava AI Multi-Model
> Exchange)** — a single, unified API in front of OpenAI, Anthropic and Google,
> with provider abstraction, low-latency streaming, and strict data-handling
> guarantees. This doc gives a spoken pitch, an architecture deep-dive, the
> design trade-offs, and the Cassava-specific framing.

---

## The 60-Second Pitch (spoken)

> "DOT is a local-first AI companion — voice, memory and mood — that I built
> end to end. The interesting part for an AI engineering role isn't the avatar;
> it's the **inference layer**. DOT speaks to three LLM providers — OpenAI,
> Google Gemini and Anthropic Claude — behind a single streaming API, the same
> 'one gateway, many models' pattern as CAIMEx. On top of that I built a runtime
> **prompt compiler** that assembles each request from the user's persona,
> tuning dials and retrieved memory; a full **voice loop** (speech-to-text →
> streamed LLM → ElevenLabs TTS → live audio analysis) with sub-second latency
> and interruption handling; and a **client-side encrypted key vault** so the
> server never stores a single secret or message. It's deployed, it's
> bring-your-own-key, and every architectural decision is about provider
> abstraction, latency, and data privacy."

---

## Overview

DOT is a production-grade, full-stack web application that reimagines the personal
AI assistant as an expressive, emotionally-reactive companion. Built entirely from
scratch, it unifies three independent LLM providers, a streaming voice-synthesis
engine, and real-time browser audio analysis behind a clean, provider-agnostic API.

Its defining architectural stance is **local-first, bring-your-own-key (BYOK)**:
every API key, memory, and ritual lives encrypted on the user's device, and the
backend is a **stateless inference proxy that never persists user data**. This is a
deliberate engineering choice that demonstrates ownership of a complex, multi-system,
security-conscious product — and it maps directly onto the data-sovereignty and
in-region data-handling concerns that define Cassava's platform.

**Live:** https://dot-0.vercel.app

---

## Architecture Deep-Dive

### 1. Provider-Agnostic Inference Gateway (the CAIMEx parallel)

The core of DOT is a single API route that abstracts away which LLM is actually
answering. A request names a `provider` + `model`; the route validates both against
an allow-list, instantiates the correct SDK adapter, and returns one uniform
**token stream** regardless of vendor.

```
POST /api/chat
  → validateProvider()   // openai | google | anthropic (allow-listed)
  → validateModel()      // must be in SUPPORTED_CHAT_MODELS[provider]
  → buildSystemPrompt()  // runtime prompt compilation (see §3)
  → getModel(provider)   // @ai-sdk/openai | /google | /anthropic adapter
  → streamText({ model, system, messages, temperature: 0.7, maxOutputTokens: 180 })
  → toTextStreamResponse()   // uniform stream out
```

**Why it matters / talking points:**
- **One interface, many models** — adding a provider is a single adapter + an
  allow-list entry; nothing downstream changes. This is the exact value
  proposition of a multi-model exchange like CAIMEx: callers shouldn't care who
  serves the token.
- **Model governance via allow-listing** — `SUPPORTED_CHAT_MODELS` is the policy
  layer. Requests for un-enabled models are rejected with a typed error before
  any spend. (Currently: OpenAI `gpt-5.4-mini/nano`, `gpt-5.4/5.5`; Gemini
  `3.5-flash`, `3.1-flash-lite`, `3-flash-preview`, `2.5-flash`; Claude
  `haiku-4.5`, `sonnet-4.5/4.6`, `opus-4.6/4.7`.)
- **Vendor-error normalization** — heterogeneous failures (a 401 from OpenAI, a
  429 from Google, a model-not-found from Anthropic) are collapsed into a single
  typed taxonomy: `AUTH_INVALID`, `RATE_LIMITED`, `MODEL_UNAVAILABLE`,
  `PROVIDER_REQUEST_FAILED` — each with an actionable recovery hint. A gateway is
  only as good as its failure surface.

### 2. Streaming Internals & Latency

- Responses are **streamed token-by-token** (`streamText` → `toTextStreamResponse`);
  the client reads the `ReadableStream` incrementally and renders as it arrives,
  so time-to-first-token, not total latency, governs perceived speed.
- The request carries a **rolling 6-message context window** and a capped
  `maxOutputTokens` (180) — deliberate cost/latency controls for a
  short-turn conversational companion.
- The same stream is reused by the **voice path**: tokens are accumulated and
  handed to TTS, so spoken replies start as soon as the model commits text.

### 3. Dynamic Prompt Compilation (behavior without fine-tuning)

Each request's system prompt is **compiled at runtime** from four layers — this is
how DOT personalizes behavior with zero training:

1. **Base character** — a fixed voice contract ("warm, poetic, ≤3 sentences").
2. **Persona** — one of four tone modules (Coach / Playful / Deep Thinker /
   Focus Buddy).
3. **Tuning dials** — two continuous 0–100 sliders (`expressiveness`,
   `directness`) mapped to discrete prompt language ("animated and vivid" vs
   "restrained and quiet"), so non-technical users steer model behavior.
4. **Retrieved memory** — relevant long-term memories injected with an explicit
   instruction to weave them in naturally.

### 4. Lightweight Retrieval (a hand-rolled RAG loop)

DOT has no vector DB — it runs a **transparent, explainable relevance ranker** over
local memory:

- Each candidate memory is scored by **recency decay** (linear over a 30-day
  window) + **token overlap** with the query + **tag match** + a small
  **source-type weight**.
- Top-K (default 8) are serialized into the prompt's memory block; everything
  above a score threshold qualifies.
- Writes are auto-tagged and capped by a **200-entry retention policy**. Sources
  are typed (`chat | voice | ritual | system`).

**Talking point:** this is deliberately a keyword/recency ranker, not embeddings —
the trade-off is zero infra and full explainability vs. weaker semantic recall.
I can articulate exactly when I'd swap in pgvector/embeddings (see Trade-offs).

### 5. Real-Time Voice Pipeline

A full-duplex loop with interruption as a first-class concern:

```
Web Speech API (STT, interim transcripts)
  → /api/chat (streamed, AbortController-cancellable)
  → /api/tts  → ElevenLabs streaming (optimize_streaming_latency)
  → AudioContext → BufferSource → AnalyserNode → destination
  → 5-band FFT @ 60fps drives avatar lip-sync / expression
```

- Any phase can be **interrupted mid-sentence**: abort the fetch, `stop()` the
  audio node, tear down recognition.
- **Graceful degradation**: falls back to the browser's `SpeechSynthesis` when no
  ElevenLabs key is present.
- The **audio analyser** (5 bands: bass / low-mid / mid / high-mid / presence +
  RMS) runs on a pre-allocated buffer to avoid per-frame GC.

### 6. Security at the Boundary (BYOK key vault)

- Keys are encrypted client-side with **AES-GCM 256**, derived via **PBKDF2
  (SHA-256, 200,000 iterations, per-key random salt + IV)** using the Web Crypto API.
- Three storage tiers: encrypted vault (localStorage), **session-only**
  (sessionStorage), and plaintext (legacy/opt-in). Decrypted keys live in an
  in-memory cache with a **15-minute auto-relock**.
- Keys reach the server **only** as an `x-dot-api-key` request header, are used
  for a single call, and are **never logged or persisted**.
- A separate **validation route** live-pings each provider's own account/models
  endpoint to verify a key + model before it's trusted.

---

## Stack & Platforms

| Layer            | Technology                                                              |
| ---------------- | ---------------------------------------------------------------------- |
| Frontend         | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS v4         |
| AI / LLM         | Vercel AI SDK v6 — OpenAI, Google Gemini, Anthropic Claude (streaming) |
| Voice Synthesis  | ElevenLabs streaming TTS (BYOK, latency-optimized)                     |
| Speech & Audio   | Web Speech API (STT), Web Audio API (5-band FFT)                       |
| Animation        | GSAP (1,450-line avatar engine), Motion (UI / draggable panels)       |
| Security         | Web Crypto API — AES-GCM + PBKDF2 client-side key vault                |
| Persistence      | Local-first — localStorage / sessionStorage (no server database)      |
| Cloud            | Vercel-compatible serverless, stateless API routes                    |
| Packaging        | Avatar extracted + published as `@xoboid/avatar` npm package          |

---

## Design Decisions & Trade-offs (be ready to defend these)

**Why BYOK / local-first instead of a managed backend?**
Privacy and trust were the product thesis: no server-side store means no breach
surface for user keys or conversations. The cost is no cross-device sync and no
server-side analytics — acceptable for a personal companion, and it forced clean
stateless API design.

**Why keyword/recency memory instead of embeddings?**
Zero infra, fully explainable ranking, instant writes — right for a local-first app
with bounded memory (200 entries). I'd move to embeddings + a vector index
(pgvector / a managed store) the moment memory grows past a few hundred entries or
semantic recall matters more than transparency.

**Why cap context at 6 messages and 180 output tokens?**
DOT is a short-turn companion; long context inflates latency and cost for no
quality gain. These are config, not architecture — trivially raised per use case.

**Why three providers behind one route instead of just OpenAI?**
Resilience and choice: if one vendor rate-limits or a model is unavailable, the
user (or a router) can switch with no code change. This provider-abstraction is the
single most transferable idea to a multi-model exchange.

---

## Production Hardening — How I'd Scale It (senior framing)

This shows the gap between a deployed personal project and CAIMEx-scale infra, and
that I know how to close it:

- **Server-side response & semantic caching** (TTL + LRU) keyed on
  prompt+model — cut redundant spend and tail latency.
- **A routing/policy layer** — route by cost, latency SLO, or capability; failover
  across providers; per-tenant model allow-lists and budgets.
- **Observability & evals** — structured request/usage logging, token-cost
  metering per tenant, latency histograms, and an offline eval harness
  (golden prompts + LLM-as-judge) gating prompt/model changes.
- **Rate limiting & quotas** at the gateway (per key, per tenant).
- **Embeddings-backed memory** behind the existing ranker interface.
- **Streaming over SSE/WebSocket** with backpressure for multi-region edge
  deployment — relevant to in-region inference on regional GPU infrastructure.

---

## Why DOT Is Relevant to Cassava / CAIMEx

- **Multi-model gateway pattern** — DOT already abstracts OpenAI, Google and
  Anthropic behind one streaming API with allow-listing and unified error
  handling. That is CAIMEx's core idea at small scale.
- **Data sovereignty & privacy** — DOT's local-first, secrets-never-stored design
  reflects the in-region data-handling and compliance posture Cassava builds for.
- **Low-latency streaming inference** — token streaming and a latency-tuned voice
  pipeline mirror the performance focus of regional AI factories.
- **API integration across heterogeneous systems** — four cloud AI services wired
  into one coherent product with proper isolation, validation and failure modes.
- **Prompt/behavior engineering** — runtime prompt composition from user state, the
  practical alternative to fine-tuning for behavioral control.

---

## Likely Interview Questions (and crisp answers)

- **"Walk me through what happens when a user sends a message."** → §1 + §2: route
  validation → prompt compilation (persona + tuning + retrieved memory) → provider
  adapter → `streamText` → token stream rendered incrementally; voice path reuses
  the same stream into TTS.
- **"How do you handle a provider going down or rate-limiting?"** → Typed error
  normalization (`RATE_LIMITED`, `MODEL_UNAVAILABLE`…) surfaced with recovery
  actions; provider abstraction means switching vendors is config, not a rewrite.
- **"How would you make this multi-tenant / production-grade?"** → the Production
  Hardening section: caching, routing/policy, quotas, observability, evals.
- **"How do you keep user data safe?"** → client-side AES-GCM/PBKDF2 vault,
  header-only key forwarding, stateless proxy, no server persistence.
- **"Why not embeddings for memory?"** → explainability + zero infra now; clear
  migration path when scale demands it.

---

*Public Link:* https://dot-0.vercel.app
