# DOT — Missing / Incomplete Features

## ~~1. Voice Pipeline Not Wired~~ ✅ Fixed
- `useVoiceConversation` hook implements full loop: SpeechRecognition → `/api/chat` → ElevenLabs TTS → avatar audio analysis
- `FloatingDock` now accepts real `voiceState`, `onToggleMic`, `onInterrupt` props
- TTS audio drives avatar during speaking; mic levels resume on idle
- Browser `SpeechSynthesis` fallback when no ElevenLabs key is set
- `/api/tts` route now accepts BYOK `apiKey` from request body, falls back to env var

## ~~2. Memory Never Influences AI Responses~~ ✅ Fixed
- `loadMemories` and `isMemoryEnabled` exported from `memory-drawer.tsx`
- `ChatModule` writes user messages (>20 chars) as memories with auto-tags when learning is enabled
- `ChatModule` reads the 8 most recent memories and passes them as `memoryContext` to `/api/chat`
- `/api/chat/route.ts` injects memory context into the system prompt — DOT now personalises responses

## ~~3. TTS Route is Not BYOK~~ ✅ Fixed
- `/api/tts/route.ts` accepts `apiKey` from request body, falls back to env var (done in #1)
- `useVoiceSynthesis` now reads ElevenLabs key from key-store and forwards it on every TTS call
- Key vault panel rows now show a purpose label (`CHAT · VOICE` / `TTS_ENGINE`) so users know what each key powers

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
