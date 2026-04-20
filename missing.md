# DOT — Missing / Incomplete Features

## 1. Voice Pipeline Not Wired
- `FloatingDock` uses a **mock** `voiceState` — mic button toggles local state only
- `useVoiceSynthesis` is implemented but never used in the UI
- Full loop unbuilt: mic → transcript → `/api/chat` → TTS → avatar animation
- No barge-in / interruption handling
- No speech-to-text integration (no Whisper / browser SpeechRecognition wired up)

## 2. Memory Never Influences AI Responses
- `addMemory()` is exported from `memory-drawer.tsx` but never called anywhere
- `ChatModule` does not write to memory after conversations
- `/api/chat/route.ts` receives no memory context — responses are stateless
- Memory drawer stores entries but they are purely display-only

## 3. TTS Route is Not BYOK
- `/api/tts/route.ts` reads `process.env.ELEVENLABS_API_KEY` from the server env
- Key vault stores an ElevenLabs key in localStorage but it is never forwarded to the TTS route
- Contradicts the core product principle of BYOK-first

## 4. Keys Stored in Plaintext
- `lib/key-store.ts` uses raw `localStorage.setItem` with no encryption
- Plan specifies Web Crypto (`crypto.subtle`) with a user passphrase
- Session-only mode toggle exists in the data model but is not exposed in the Key Vault UI

## 5. WebM Export Stub
- WEBM button exists in `ShareDock` but is hardcoded `disabled` with `onClick: () => undefined`

## 6. Deep Thinker Persona Locked
- `deep-thinker` persona has `unavailable: true` in `CustomizationModal`
- No system prompt tone defined for it in `/api/chat/route.ts`

## 7. Panel Positions Not Persisted
- All draggable panels reset to their default absolute positions on page reload
- No position memory in localStorage

## 8. Memory Not Injected Into Chat From Voice or Ritual
- Even if memory-to-chat is wired for text chat, voice sessions and ritual check-ins have no path to write meaningful memories

## 9. Provider Selection Has No Model Picker UI
- Key Vault panel stores a model string but the UI for picking a specific model variant is absent
- Default models are hardcoded: `gpt-4o-mini`, `gemini-2.0-flash`

## 10. No Onboarding Flow
- New users land directly on the avatar with no guidance on BYOK setup
- Chat module shows `NO_KEY_FOUND` with only a text hint — no action button to open settings
