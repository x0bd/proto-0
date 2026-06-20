# DOT — Local-First AI Companion Platform

**Full-Stack · Real-Time Voice · Multi-Provider AI · Privacy-First · Cloud-Native**

---

## Overview

DOT is a production-grade, full-stack web application that reimagines the personal AI assistant as an expressive, emotionally-reactive companion for voice, memory, and mood. Built entirely from scratch, the platform wires together three independent LLM providers, a streaming voice synthesis engine, and real-time browser audio analysis behind a clean, provider-agnostic REST API. Its defining architectural stance is **local-first, bring-your-own-key (BYOK)**: every API key, memory, and ritual lives encrypted on the user's device, and the server is a stateless proxy that never persists user data — demonstrating end-to-end ownership of a complex, multi-system, security-conscious product.

---

## Key Technical Achievements

### AI Integration & Intelligent Companionship

- Built a **provider-agnostic inference layer** on the Vercel AI SDK that unifies **OpenAI (GPT-5.4/5.5), Google Gemini (3.x Flash), and Anthropic Claude (Haiku/Sonnet/Opus)** behind a single `streamText` interface — token-streamed to the client with a rolling 6-message context window, temperature and output-token controls, and per-provider model allow-listing
- Engineered a **dynamic system-prompt compiler** that assembles each request from four runtime layers: a base character voice, one of **four switchable personas** (Coach, Playful, Deep Thinker, Focus Buddy), two continuous **tuning dials** (expressiveness + directness mapped to discrete prompt language), and **injected long-term memory** — so the model personalizes responses without the user ever engineering a prompt
- Designed a **structured error taxonomy** (`AUTH_INVALID`, `RATE_LIMITED`, `MODEL_UNAVAILABLE`, `PROVIDER_REQUEST_FAILED`, …) that normalizes heterogeneous provider failures into typed payloads with user-actionable recovery hints surfaced directly in the UI
- Implemented a **live key-validation service** that pings each provider's own models/account endpoint (OpenAI `/v1/models`, Google Generative Language, Anthropic `/v1/models`, ElevenLabs `/v1/user` + TTS-capability check) to verify a key and selected model before it is ever used in production

### Real-Time Voice & Audio Pipeline

- Architected a **full-duplex voice conversation loop** (415-line hook): Web Speech API speech-to-text → streaming multi-provider inference → **ElevenLabs** text-to-speech → Web Audio playback — with sub-second latency tuning (`optimize_streaming_latency`), live interim transcripts, and a browser `SpeechSynthesis` fallback when no TTS key is present
- Made every phase **abortable and interruptible** — `AbortController` cancels in-flight inference, `BufferSourceNode.stop()` halts playback, and recognition tears down on a single tap, so the user can cut DOT off mid-sentence
- Built a **real-time spectral analysis engine** (345-line hook) performing a 5-band FFT decomposition (bass / low-mid / mid / high-mid / presence + RMS) on a pre-allocated buffer at 60fps, driving the avatar's facial articulation in sync with live microphone input or synthesized speech

### REST API Design & Systems Integration

- Designed and implemented a complete **REST API surface** (Next.js App Router) covering streaming chat inference, BYOK-aware text-to-speech, and live provider key validation — each route stateless, input-validated, and isolated per service
- Integrated **four independent cloud AI platforms** (OpenAI, Google, Anthropic, ElevenLabs) behind a unified application layer with proper secrets handling: keys are forwarded only via an `x-dot-api-key` request header, never logged, and **never stored server-side**
- Authored a **client-side BYOK key vault** (301 lines) implementing **AES-GCM 256-bit encryption** with keys derived via **PBKDF2 (SHA-256, 200,000 iterations, per-key random salt + IV)**, plus a session-only storage tier, a 15-minute in-memory decrypt cache with automatic re-locking, and backward-compatible plaintext migration

### Custom Avatar Engine & Emotion Pipeline

- Authored a **1,450-line TypeScript/SVG avatar engine** driven by GSAP, implementing a 5-axis emotion model (joy, sadness, surprise, anger, curiosity), three visual variants, idle life systems (procedural blink/glance/breathing), pointer tracking with repulsion physics, and TTS-reactive lip-sync — extracted and published as a reusable **`@xoboid/avatar` npm package**
- Built a **lexical emotion engine** that scores conversation text across the 5 emotion axes and feeds it into the avatar in real time, so DOT's expression shifts with the emotional tone of what's being said
- Designed a **persistent memory system** with relevance scoring — recency decay over a 30-day window, token overlap, tag matching, and source weighting — that selects the most relevant entries to inject into each prompt, with auto-tagging, a 200-entry retention policy, and four memory sources (chat, voice, ritual, system)

### Personalization, Rituals & Operational UI

- Built a **daily check-in / ritual system** with timezone-aware date keys, current- and longest-streak calculation, weekly mood tracking, and automatic memory capture — feeding a compiled "ritual context" back into the AI for continuity across sessions
- Developed a **draggable hardware-panel workspace** — chat, memory, audio lab, rituals, customization, key vault, and share dock — with per-panel persisted positions, a live status/instrument readout per module, and a real-time spectral visualizer
- Engineered a **moment-export pipeline** producing shareable **PNG (html-to-image), animated GIF (gif.js), and WebM (canvas capture + MediaRecorder)** renders across multiple templates, entirely client-side
- Designed a bespoke **"Lime × Nothing" design system** from the token layer up: a single-accent indigo-on-bone palette, Carbon + Departure Mono type, flat instrument-panel components, scramble-decode interactions, and a dot-matrix motif

---

## Stack & Platforms

| Layer            | Technology                                                          |
| ---------------- | ------------------------------------------------------------------ |
| Frontend         | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS v4     |
| AI / LLM         | Vercel AI SDK v6 — OpenAI, Google Gemini, Anthropic Claude (streaming) |
| Voice Synthesis  | ElevenLabs streaming TTS (BYOK, latency-optimized)                 |
| Speech & Audio   | Web Speech API (STT), Web Audio API (5-band FFT analysis)          |
| State Management | React hooks + custom persistence hooks (memory, personas, panels) |
| Animation        | GSAP (avatar engine), Motion / Framer Motion (UI, draggable panels) |
| Security         | Web Crypto API — AES-GCM + PBKDF2 client-side key vault            |
| Persistence      | Local-first — localStorage / sessionStorage (no server DB)        |
| Cloud            | Vercel-compatible serverless deployment, stateless API routes     |
| Packaging        | Published `@xoboid/avatar` workspace npm package                  |

---

## Relevance to AI Fullstack Development

DOT directly demonstrates the skills required for modern AI engineering roles:

- **API integration across heterogeneous systems** — unified four independent AI/voice providers behind one streaming application layer with consistent error handling and service isolation
- **AI-powered behavioral tooling** — a persona- and memory-aware companion that adapts tone and guidance to the user move-by-move, mirroring the structure of enterprise AI coaching and assistance tools
- **Real-time pipelines** — a low-latency STT → LLM → TTS → audio-analysis loop with interruption handling, plus 60fps spectral visualization
- **Security at system boundaries** — client-side AES-GCM/PBKDF2 key encryption, header-only key forwarding, environment-isolated secrets, and strict input validation on every endpoint
- **Privacy-first, local-first architecture** — a deliberate design where no user data touches the server, proving the ability to build trustworthy AI products around sensitive data
- **Prompt & behavior engineering** — runtime system-prompt composition from user state (persona, tuning dials, memory) to control model behavior without fine-tuning

---

Public Link: https://dot-0.vercel.app
