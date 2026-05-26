# DOT — Upwork Portfolio Entry

## Project Title

`DOT — Local-First AI Voice Companion`
_(36/70 chars)_

---

## Your Role

`Solo Fullstack AI Engineer`

---

## Project Description

_(paste this — 598 chars)_

```
DOT is a local-first AI companion built with Next.js 14 and the Vercel AI SDK. It implements a full real-time voice loop: Web Speech API → multi-provider AI inference (OpenAI GPT-5.5, Google Gemini 2.0 Flash) → ElevenLabs TTS → Web Audio frequency analysis — all in the browser with no backend state.

Technical depth: streaming AI responses, BYOK key vault with AES-GCM / PBKDF2 encryption, persistent memory injected into every AI prompt, four switchable personas with tunable behaviour sliders, and a 5-band real-time audio analyser.

Live → dot-0.vercel.app
```

---

## Skills and Deliverables

_(5 max — enter these one at a time)_

1. `Next.js`
2. `TypeScript`
3. `OpenAI API`
4. `REST API Development`
5. `Web Audio API`

---

## 3 Screenshots to Take + Captions

### Screenshot 1 — Chat Conversation (dark mode, Desktop)

**What to capture:** The `/companion` page with the **chat module open** and a visible multi-turn conversation. Have a real exchange typed out — ask DOT something thoughtful like "help me focus for the next 2 hours" and let it respond. Capture the full screen: avatar on the right, chat panel open on the left showing the conversation thread with DOT's streamed response fully loaded.

**How:** Open `/companion`, click the chat icon in the floating dock, type a message and wait for the full AI response to stream in. Switch to the **DIGITAL** face. Dark mode. Make sure the response is something meaty (2–3 sentences) so the chat bubble looks substantial — not a one-liner.

**Caption to use on Upwork:**

> AI chat interface with streaming responses via the Vercel AI SDK — supports OpenAI GPT-4o and Google Gemini 2.0 Flash. Persistent memory from past sessions is injected into every system prompt, so DOT personalizes responses across conversations.

---

### Screenshot 2 — Voice Conversation in Action (dark mode, Desktop)

**What to capture:** The `/companion` page with the avatar mid-conversation. Trigger a voice reply (click the mic, say something, let DOT respond). Take the screenshot while the avatar is in the **speaking** state — eyes slightly animated, floating dock showing the waveform/active state.

**How:** Open `/companion`, click the mic button, say "what can you do?", wait for DOT to start speaking, then screenshot immediately. Dark mode looks better here.

**Caption to use on Upwork:**

> Real-time voice pipeline in action — Web Speech API captures input, routes through GPT-4o via streaming API, and ElevenLabs synthesises the response. A 5-band Web Audio FFT drives the avatar's facial expressions in sync with speech.

---

### Screenshot 3 — Key Vault + Persona Panel (dark mode, Desktop)

**What to capture:** Open the settings/key vault panel (the gear icon) showing the provider keys (OpenAI, Google, ElevenLabs rows — they can be empty/masked). Then open the customisation panel and show the persona selector with the sliders (Expressiveness / Directness). Take a single screenshot that shows both panels open, or take two and pick the better one.

**How:** Click the settings key icon in the floating dock on `/companion` page, dark mode. If you can show both panels on screen at once, great. Otherwise capture the key vault alone.

**Caption to use on Upwork:**

> BYOK key vault with client-side AES-GCM encryption (PBKDF2, 200k iterations) — API keys never touch the server in plaintext. Supports OpenAI, Google Gemini, and ElevenLabs with per-provider model selection and an optional vault passphrase.
