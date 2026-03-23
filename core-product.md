# DOT Product Core Implementation Plan

## 1) Objective
Turn DOT from an expressive demo into a repeat-use product with a clear daily value loop:
- remember me
- talk with me
- check in with me
- adapt to my preferred companion style
- let me share moments

This plan focuses on the Product Core:
1. Persistent Memory + Memory Controls
2. Voice Companion Mode (ElevenLabs + AI SDK)
3. Daily Check-ins + Streaks
4. Persona Packs
5. Shareable Animated Moments

---

## 2) Product Principles
- Local-first by default: users can use DOT without account setup.
- BYOK-first integrations: users provide their own API keys for AI, voice, and optional connectors.
- Transparent memory: users can view, edit, and delete what DOT remembers.
- Fast interactions: low-latency voice/chat is prioritized over feature breadth.
- Safe defaults: no silent key persistence to server, explicit consent for any memory write.

---

## 3) BYOK Strategy (Required Foundation)

### Key Requirements
- Users bring their own keys for:
  - LLM provider(s) via AI SDK (OpenAI/Google initially)
  - ElevenLabs TTS
  - Optional integrations (Spotify, weather, calendar, etc)
- Keys should not be stored on server by default.
- Keys should be revocable from DOT settings instantly.

### v1 Implementation
- Add `Key Vault` settings panel in app UI.
- Store keys client-side in encrypted local storage:
  - Use Web Crypto (`crypto.subtle`) with a user passphrase.
  - Save ciphertext + metadata only.
- On each request:
  - Decrypt in client memory.
  - Send provider-specific key in request headers to our API routes.
  - API routes forward to upstream providers and never persist keys.
- Add `session-only mode` toggle (do not persist encrypted key blobs).

### API Contract (v1)
- `POST /api/ai/respond`
  - headers: `x-dot-provider`, `x-dot-api-key`
  - body: messages, persona, memoryContext, toolsContext
- `POST /api/tts/speak`
  - headers: `x-elevenlabs-api-key`
  - body: text, voiceId, model settings
- `POST /api/integrations/:id/execute` (optional, per connector)
  - integration-specific BYOK headers

---

## 4) Technical Architecture

### Frontend (Next.js App Router)
- Keep `app/page.tsx` as experience shell.
- Add product state slices (Zustand or equivalent) for:
  - `settingsStore` (keys, provider config, privacy)
  - `memoryStore` (memories, recall controls, summaries)
  - `ritualStore` (check-ins, streaks, reminders)
  - `personaStore` (active pack, voice/profile traits)
  - `shareStore` (captures, exports, templates)

### Backend Routes
- Consolidate chat generation around AI SDK in a single route (`/api/ai/respond`).
- Keep ElevenLabs route specialized for streaming audio (`/api/tts/speak`).
- Add memory operations route set if/when backend persistence is introduced:
  - `GET/POST/PATCH/DELETE /api/memory`

### Data Storage
- v1 local persistence:
  - IndexedDB for memories/check-ins/history
  - Encrypted local storage for key vault
- v2 optional cloud sync:
  - User account + encrypted sync service

---

## 5) Core Feature Plans

## A) Persistent Memory + Controls
### Scope
- Capture interaction memory entries from chat, voice, and explicit saves.
- Memory console to inspect what DOT remembers.
- Toggle memory write/read globally and per category.

### Data Model (v1)
- `MemoryItem`:
  - id, createdAt, source (`chat|voice|manual|ritual`), content
  - tags (`preferences|people|goals|events`)
  - importance (1-5), expiresAt (optional), deletedAt (optional)
- `MemoryPolicy`:
  - readEnabled, writeEnabled
  - allowedTags[]
  - retentionDays by category

### Implementation Notes
- Add summarization step to condense long sessions into compact memory items.
- Add retrieval layer before response generation:
  - recent memories + relevant tagged memories.
- UI: `Memory` drawer with search, pin, redact, delete.

### Done Criteria
- User can see exactly what DOT stored.
- User can delete single memory or clear all.
- Model responses improve with remembered preferences.

---

## B) Voice Companion Mode (ElevenLabs + AI SDK)
### Scope
- Push-to-talk and conversational mode.
- AI text response + ElevenLabs speech output.
- Avatar reacts to both user audio and DOT speech output.

### Pipeline
1. Capture microphone + partial transcript.
2. Send transcript + context to `/api/ai/respond`.
3. Stream text response back to UI.
4. Send final/partial response text to `/api/tts/speak`.
5. Play audio stream and feed analyzer to avatar.

### Implementation Notes
- Use AI SDK streaming for low-latency responses.
- Keep current `useAudioAnalysis` and `useVoiceSynthesis`; add interruption handling:
  - barge-in (user can interrupt DOT speaking).
- Add voice fallback if ElevenLabs key missing:
  - browser SpeechSynthesis API.

### Done Criteria
- Voice latency is acceptable for conversation.
- User can interrupt ongoing speech cleanly.
- Works with user-provided ElevenLabs key only (no platform key dependency).

---

## C) Daily Check-ins + Streaks
### Scope
- Daily mood check-in flow (30-60 seconds).
- Streak tracking and weekly emotional snapshot.
- DOT can suggest reflection prompts.

### Data Model
- `CheckIn`:
  - id, date, moodVector, note, personaUsed
- `StreakState`:
  - currentStreak, longestStreak, lastCheckInDate

### Implementation Notes
- First load each day shows gentle check-in prompt.
- Store results locally and show weekly trends.
- Tie to persona and memory:
  - "You usually feel better after focus mode at night."

### Done Criteria
- User can complete a check-in quickly.
- Streak logic is reliable across time zones.
- DOT references prior check-ins naturally.

---

## D) Persona Packs
### Scope
- Multiple DOT personalities with distinct:
  - response style
  - voice profile
  - visual accent/animation behavior
- User can switch persona instantly.

### Initial Packs
1. Coach
2. Playful
3. Deep Thinker
4. Focus Buddy

### Implementation Notes
- Store persona config as structured JSON:
  - system instructions
  - lexical style constraints
  - default voice params
  - expression weights
- Feed persona config into AI route and avatar behavior at runtime.

### Done Criteria
- Persona switch is immediate and obvious.
- Conversation tone and voice both change with persona.
- Persona selection persists per user device.

---

## E) Shareable Animated Moments
### Scope
- Export DOT reaction moments as:
  - PNG
  - short GIF/WebM clips
- Add lightweight branded share cards.

### Implementation Notes
- Reuse and harden current capture/export path.
- Add predefined templates:
  - "Mood Card", "Daily Reflection", "DOT Reaction".
- Mobile-first share UX:
  - `Share` API when available, download fallback otherwise.

### Done Criteria
- Exports are reliable on desktop + mobile.
- Generated media is visually consistent across variants.

---

## 6) Delivery Plan (Phased)

## Phase 0 - Foundation (Week 1)
- Normalize API routes:
  - migrate to `/api/ai/respond` + `/api/tts/speak`
- Implement Key Vault (encrypted BYOK + session mode)
- Add provider selection UI (OpenAI/Google via AI SDK)
- Fix env/key naming consistency in docs and code

## Phase 1 - Memory Core (Week 2)
- Memory item ingestion + retrieval pipeline
- Memory console (view/edit/delete/clear)
- Memory policy controls

## Phase 2 - Voice Core (Week 3)
- Full voice companion loop
- Interruption handling
- ElevenLabs settings and voice testing screen

## Phase 3 - Habit Loop (Week 4)
- Daily check-ins + streaks + weekly summary
- Persona packs v1

## Phase 4 - Share + Polish (Week 5)
- Shareable moments templates
- mobile polish + performance pass
- onboarding flow for BYOK setup

---

## 7) QA and Reliability Checklist
- Build passes with `pnpm build`.
- Key vault encryption/decryption tested for:
  - wrong passphrase
  - corrupted payload
  - key rotation
- Voice pipeline tested under:
  - missing/invalid ElevenLabs key
  - network drop
  - user interruptions
- Memory controls tested:
  - read off + write off states
  - delete/clear behavior
- Mobile UX tested for all primary actions and exports.

---

## 8) Success Metrics
- Activation:
  - `% users who complete BYOK setup`
- Retention:
  - `% users with 3+ day streak`
- Engagement:
  - average sessions/week
  - voice sessions per active user
- Trust:
  - `% users visiting memory controls`
  - memory deletion events (healthy sign of control usage)
- Sharing:
  - exports per user/week

---

## 9) Risks and Mitigations
- Risk: BYOK friction reduces onboarding conversion.
  - Mitigation: guided setup wizard, provider quick tests, session-only mode.
- Risk: voice latency hurts experience.
  - Mitigation: AI SDK streaming + shorter first-response style + TTS chunking.
- Risk: memory feels invasive.
  - Mitigation: explicit memory ledger, category toggles, one-tap clear.
- Risk: duplicate avatar implementations drift (`app` vs `packages/avatar`).
  - Mitigation: define source-of-truth and consolidate after Phase 1.

---

## 10) Immediate Next Tasks
1. Create Key Vault UI + encrypted local storage utility.
2. Introduce `/api/ai/respond` route powered by AI SDK provider abstraction.
3. Rename/align TTS route to `/api/tts/speak` (keep temporary alias for compatibility).
4. Implement memory schema + local persistence adapter.
5. Add check-in MVP UI and streak calculation utility.

